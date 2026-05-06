import React, { useEffect, useState } from 'react';
import {
  View, Text, ScrollView, Pressable, Alert, StyleSheet,
} from 'react-native';
import { useRoute, useNavigation, RouteProp } from '@react-navigation/native';
import { useTaskStore } from '../stores/useTaskStore';
import { useTimerStore } from '../stores/useTimerStore';
import { TimerWidget } from '../components/timer/TimerWidget';
import { Card } from '../components/ui/Card';
import { Pill } from '../components/ui/Pill';
import { PromptModal } from '../components/ui/PromptModal';
import { theme } from '../constants/theme';
import { getCatStyle } from '../constants/categories';
import { TaskWithMeta } from '../types/task';

type RouteParams = {
  TaskDetail: { taskId: string; treeId: string };
};

export function TaskDetailScreen() {
  const route = useRoute<RouteProp<RouteParams, 'TaskDetail'>>();
  const nav = useNavigation<any>();
  const { taskId, treeId } = route.params;
  const { getTaskWithMeta, markComplete, decomposeTask, deleteCustomTask, tasks } = useTaskStore();
  const { loadStats } = useTimerStore();
  const [taskMeta, setTaskMeta] = useState<TaskWithMeta | null>(null);
  const [decomposeModal, setDecomposeModal] = useState(false);

  useEffect(() => {
    (async () => {
      const meta = await getTaskWithMeta(taskId, treeId);
      setTaskMeta(meta);
      await loadStats(taskId, treeId);
    })();
  }, [taskId, treeId]);

  if (!taskMeta) {
    return (
      <View style={styles.container}>
        <Text style={styles.loading}>加载中...</Text>
      </View>
    );
  }

  const catStyle = getCatStyle(taskMeta.category);
  const prereqIds = tasks.filter(t => t.id === taskId)[0]?.prerequisites;

  const handleComplete = async () => {
    const newDone = !taskMeta.completed;
    await markComplete(taskId, treeId, newDone);
    const meta = await getTaskWithMeta(taskId, treeId);
    setTaskMeta(meta);
  };

  const handleDecompose = () => {
    setDecomposeModal(true);
  };

  const handleDecomposeConfirm = async (text: string) => {
    const subs = text.split('\n').map((s: string) => s.trim()).filter(Boolean);
    if (subs.length > 0) {
      const ids = await decomposeTask(taskId, treeId, subs);
      Alert.alert('成功', `已分解为 ${ids.length} 个子任务`);
    }
    setDecomposeModal(false);
  };

  const handleDelete = () => {
    if (!taskMeta.is_custom) {
      Alert.alert('提示', '只能删除自定义任务');
      return;
    }
    Alert.alert('确认', `确定删除 "${taskMeta.title}"？`, [
      { text: '取消', style: 'cancel' },
      {
        text: '删除', style: 'destructive',
        onPress: async () => {
          await deleteCustomTask(taskId, treeId);
          nav.goBack();
        },
      },
    ]);
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Card>
        <View style={styles.header}>
          <Text style={styles.title}>{taskMeta.title}</Text>
          <View style={styles.breadcrumb}>
            <Pill text={taskMeta.category} color={catStyle.color} bg={catStyle.bg} />
            {taskMeta.module ? <Text style={styles.bc}>{taskMeta.module}</Text> : null}
            {taskMeta.chapter ? <Text style={styles.bc}>· {taskMeta.chapter}</Text> : null}
          </View>
          <View style={styles.meta}>
            <Text style={styles.metaText}>⏱ {taskMeta.adjusted_minutes}min</Text>
            {taskMeta.adjusted_minutes !== taskMeta.minutes && (
              <Text style={styles.metaAdj}>(原{taskMeta.minutes}min)</Text>
            )}
            <Text style={styles.metaText}>  ★ P{taskMeta.priority}</Text>
            <Pill
              text={taskMeta.completed ? '✓ 已完成' : taskMeta.unlocked ? '◉ 可解锁' : '🔒 锁定'}
              color={taskMeta.completed ? '#bbb' : taskMeta.unlocked ? theme.primary : theme.text3}
            />
          </View>
        </View>
      </Card>

      <View style={styles.actions}>
        <Pressable
          style={[styles.actionBtn, taskMeta.completed ? styles.undoBtn : styles.doneBtn]}
          onPress={handleComplete}
        >
          <Text style={styles.actionText}>
            {taskMeta.completed ? '🔄 标记未完成' : '✅ 标记完成'}
          </Text>
        </Pressable>
        <Pressable style={styles.actionBtn2} onPress={handleDecompose}>
          <Text style={styles.actionText2}>🔧 分解</Text>
        </Pressable>
        <Pressable style={styles.actionBtn2} onPress={() =>
          nav.navigate('KnowledgeDetail', {
            taskId, treeId,
            title: taskMeta.title,
            category: taskMeta.category,
            module: taskMeta.module,
            chapter: taskMeta.chapter,
          })
        }>
          <Text style={styles.actionText2}>📖 知识</Text>
        </Pressable>
        {taskMeta.is_custom && (
          <Pressable style={styles.actionBtn2} onPress={handleDelete}>
            <Text style={[styles.actionText2, { color: theme.danger }]}>🗑 删除</Text>
          </Pressable>
        )}
      </View>

      <TimerWidget
        taskId={taskId}
        taskTitle={taskMeta.title}
        estimatedMin={taskMeta.adjusted_minutes}
        treeId={treeId}
      />

      {prereqIds && prereqIds.length > 0 && (
        <Card style={{ marginTop: 12 }}>
          <Text style={styles.sectionTitle}>前置任务</Text>
          {prereqIds.map((pid: string) => {
            const pt = tasks.find(t => t.id === pid);
            const done = useTaskStore.getState().isCompleted(pid);
            return (
              <View key={pid} style={styles.prereq}>
                <Text style={[styles.prereqIcon, { color: done ? theme.success : theme.text3 }]}>
                  {done ? '✓' : '◯'}
                </Text>
                <Text style={[styles.prereqText, done && styles.doneText]}>
                  {pt?.title || pid}
                </Text>
              </View>
            );
          })}
        </Card>
      )}
      <PromptModal
        visible={decomposeModal}
        title="分解任务"
        placeholder="每行一个子任务"
        initialValue=""
        multiline
        onConfirm={handleDecomposeConfirm}
        onCancel={() => setDecomposeModal(false)}
      />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.bg,
  },
  content: {
    padding: 12,
    paddingBottom: 40,
  },
  loading: {
    textAlign: 'center',
    paddingTop: 40,
    color: theme.text3,
  },
  header: {
    gap: 8,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    color: theme.text,
    lineHeight: 26,
  },
  breadcrumb: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  bc: {
    fontSize: 12,
    color: theme.text2,
  },
  meta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  metaText: {
    fontSize: 13,
    color: theme.text2,
  },
  metaAdj: {
    fontSize: 11,
    color: theme.text3,
    fontStyle: 'italic',
  },
  actions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 12,
  },
  actionBtn: {
    paddingHorizontal: 18,
    paddingVertical: 10,
    borderRadius: theme.radiusSm,
  },
  doneBtn: {
    backgroundColor: theme.success,
  },
  undoBtn: {
    backgroundColor: '#f3f4f6',
  },
  actionText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  actionBtn2: {
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: theme.radiusSm,
    backgroundColor: '#f3f4f6',
  },
  actionText2: {
    color: theme.text,
    fontSize: 13,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: theme.text,
    marginBottom: 8,
  },
  prereq: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 4,
  },
  prereqIcon: {
    fontSize: 14,
    marginRight: 8,
    width: 20,
  },
  prereqText: {
    fontSize: 13,
    color: theme.text,
  },
  doneText: {
    color: '#bbb',
    textDecorationLine: 'line-through',
  },
});
