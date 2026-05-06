import React, { useState } from 'react';
import { View, Text, TextInput, Pressable, ActivityIndicator, ScrollView, StyleSheet } from 'react-native';
import { Card } from '../ui/Card';
import { theme } from '../../constants/theme';
import { evaluateAnswer, generateModelAnswer } from '../../services/quizGenerator';

interface QuizResult {
  question: string;
  hint: string;
  topics: string;
  sourceTasks: { id: string; title: string }[];
}

interface QuizCardProps {
  onGenerate: () => Promise<QuizResult | null>;
}

export function QuizCard({ onGenerate }: QuizCardProps) {
  const [quiz, setQuiz] = useState<QuizResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [showHint, setShowHint] = useState(false);
  const [answer, setAnswer] = useState('');
  const [score, setScore] = useState('');
  const [scoring, setScoring] = useState(false);
  const [modelAnswer, setModelAnswer] = useState('');
  const [loadingAnswer, setLoadingAnswer] = useState(false);

  const handleGenerate = async () => {
    setLoading(true);
    setShowHint(false);
    setAnswer('');
    setScore('');
    setModelAnswer('');
    const result = await onGenerate();
    if (result) setQuiz(result);
    setLoading(false);
  };

  const handleScore = async () => {
    if (!quiz || !answer.trim()) return;
    setScoring(true);
    setScore('');
    const result = await evaluateAnswer(quiz.question, answer.trim());
    setScore(result);
    setScoring(false);
  };

  const handleModelAnswer = async () => {
    if (!quiz) return;
    setLoadingAnswer(true);
    setModelAnswer('');
    const result = await generateModelAnswer(quiz.question);
    setModelAnswer(result);
    setLoadingAnswer(false);
  };

  if (!quiz) {
    return (
      <Card style={styles.card}>
        <Text style={styles.title}>🎯 复习检测</Text>
        <Text style={styles.desc}>从已完成的任务中随机选题，AI 为你生成一道综合测验题</Text>
        <Pressable
          style={[styles.genBtn, loading && styles.genBtnDisabled]}
          onPress={handleGenerate}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#fff" size="small" />
          ) : (
            <Text style={styles.genBtnText}>生成题目</Text>
          )}
        </Pressable>
      </Card>
    );
  }

  return (
    <Card style={styles.card}>
      <View style={styles.header}>
        <Text style={styles.title}>🎯 复习检测</Text>
        <Pressable onPress={handleGenerate} disabled={loading}>
          {loading ? (
            <ActivityIndicator color={theme.primary} size="small" />
          ) : (
            <Text style={styles.refresh}>🔄 换一题</Text>
          )}
        </Pressable>
      </View>

      <ScrollView style={styles.scrollArea} nestedScrollEnabled>
        <Text style={styles.question}>{quiz.question}</Text>

        {quiz.topics ? (
          <Text style={styles.topics}>📌 考察：{quiz.topics}</Text>
        ) : null}

        {showHint ? (
          <View style={styles.hintBox}>
            <Text style={styles.hintLabel}>💡 提示</Text>
            <Text style={styles.hintText}>{quiz.hint || '暂无提示'}</Text>
          </View>
        ) : (
          <Pressable style={styles.hintBtn} onPress={() => setShowHint(true)}>
            <Text style={styles.hintBtnText}>💡 显示提示</Text>
          </Pressable>
        )}

        {/* Answer input */}
        <Text style={styles.answerLabel}>✏️ 我的答案</Text>
        <TextInput
          style={styles.answerInput}
          value={answer}
          onChangeText={setAnswer}
          placeholder="在此作答..."
          placeholderTextColor={theme.text3}
          multiline
          textAlignVertical="top"
        />

        {/* Action buttons */}
        <View style={styles.actionRow}>
          <Pressable
            style={[styles.actionBtn, styles.scoreBtn]}
            onPress={handleScore}
            disabled={scoring || !answer.trim()}
          >
            {scoring ? (
              <ActivityIndicator color="#fff" size="small" />
            ) : (
              <Text style={styles.actionBtnText}>🤖 AI 评分</Text>
            )}
          </Pressable>
          <Pressable
            style={[styles.actionBtn, styles.answerBtn]}
            onPress={handleModelAnswer}
            disabled={loadingAnswer}
          >
            {loadingAnswer ? (
              <ActivityIndicator color={theme.primary} size="small" />
            ) : (
              <Text style={[styles.actionBtnText, { color: theme.primary }]}>📝 标准答案</Text>
            )}
          </Pressable>
        </View>

        {/* Score result */}
        {score ? (
          <View style={styles.scoreBox}>
            <Text style={styles.scoreLabel}>🤖 AI 评分</Text>
            <Text style={styles.scoreText}>{score}</Text>
          </View>
        ) : null}

        {/* Model answer */}
        {modelAnswer ? (
          <View style={styles.answerBox}>
            <Text style={styles.answerBoxLabel}>📝 标准答案</Text>
            <Text style={styles.answerBoxText}>{modelAnswer}</Text>
          </View>
        ) : null}

        <Text style={styles.source}>
          基于：{quiz.sourceTasks.map(t => t.title).join('、')}
        </Text>
      </ScrollView>
    </Card>
  );
}

const styles = StyleSheet.create({
  card: {
    marginTop: 16,
    maxHeight: 600,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  title: {
    fontSize: 15,
    fontWeight: 'bold',
    color: theme.text,
  },
  desc: {
    fontSize: 12,
    color: theme.text3,
    marginBottom: 12,
  },
  genBtn: {
    backgroundColor: theme.primary,
    borderRadius: theme.radiusSm,
    paddingVertical: 10,
    alignItems: 'center',
  },
  genBtnDisabled: {
    opacity: 0.7,
  },
  genBtnText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  refresh: {
    fontSize: 12,
    color: theme.primary,
    fontWeight: '600',
  },
  scrollArea: {
    maxHeight: 480,
  },
  question: {
    fontSize: 15,
    color: theme.text,
    lineHeight: 24,
    marginBottom: 10,
  },
  topics: {
    fontSize: 11,
    color: theme.primary,
    marginBottom: 10,
  },
  hintBox: {
    backgroundColor: '#fffbeb',
    borderRadius: theme.radiusSm,
    padding: 12,
    marginBottom: 8,
  },
  hintLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: '#b45309',
    marginBottom: 4,
  },
  hintText: {
    fontSize: 13,
    color: '#92400e',
    lineHeight: 20,
  },
  hintBtn: {
    paddingVertical: 8,
    marginBottom: 8,
  },
  hintBtnText: {
    fontSize: 13,
    color: theme.primary,
    fontWeight: '600',
  },
  answerLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: theme.text,
    marginTop: 12,
    marginBottom: 6,
  },
  answerInput: {
    backgroundColor: theme.bg,
    borderRadius: theme.radiusSm,
    borderWidth: 1,
    borderColor: theme.border,
    padding: 10,
    fontSize: 14,
    color: theme.text,
    minHeight: 80,
    lineHeight: 20,
  },
  actionRow: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 10,
  },
  actionBtn: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: theme.radiusSm,
    alignItems: 'center',
  },
  scoreBtn: {
    backgroundColor: theme.primary,
  },
  answerBtn: {
    backgroundColor: theme.primaryLight,
  },
  actionBtnText: {
    color: '#fff',
    fontSize: 13,
    fontWeight: '600',
  },
  scoreBox: {
    backgroundColor: '#f0fdf4',
    borderRadius: theme.radiusSm,
    padding: 12,
    marginTop: 10,
  },
  scoreLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: '#166534',
    marginBottom: 4,
  },
  scoreText: {
    fontSize: 13,
    color: '#14532d',
    lineHeight: 20,
  },
  answerBox: {
    backgroundColor: '#eff6ff',
    borderRadius: theme.radiusSm,
    padding: 12,
    marginTop: 10,
  },
  answerBoxLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: '#1e40af',
    marginBottom: 4,
  },
  answerBoxText: {
    fontSize: 13,
    color: '#1e3a5f',
    lineHeight: 20,
  },
  source: {
    fontSize: 10,
    color: theme.text3,
    fontStyle: 'italic',
    marginTop: 10,
  },
});
