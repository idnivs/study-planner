import React, { useState } from 'react';
import { View, Text, Pressable, ActivityIndicator, StyleSheet } from 'react-native';
import { Card } from '../ui/Card';
import { theme } from '../../constants/theme';

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

  const handleGenerate = async () => {
    setLoading(true);
    setShowHint(false);
    const result = await onGenerate();
    if (result) setQuiz(result);
    setLoading(false);
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

      <Text style={styles.source}>
        基于：{quiz.sourceTasks.map(t => t.title).join('、')}
      </Text>
    </Card>
  );
}

const styles = StyleSheet.create({
  card: {
    marginTop: 16,
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
  source: {
    fontSize: 10,
    color: theme.text3,
    fontStyle: 'italic',
  },
});
