import React, { useEffect, useCallback } from 'react';
import {
  View, Text, ScrollView, RefreshControl, StyleSheet, Pressable,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useTaskStore } from '../stores/useTaskStore';
import { usePlanStore } from '../stores/usePlanStore';
import { useTreeStore } from '../stores/useTreeStore';
import { useConfigStore } from '../stores/useConfigStore';
import { useStatsStore } from '../stores/useStatsStore';
import { PlanCategoryCard } from '../components/plan/PlanCategoryCard';
import { ProgressRing } from '../components/stats/ProgressRing';
import { CountdownWidget } from '../components/timer/CountdownWidget';
import { theme } from '../constants/theme';
import { formatDateDisplay } from '../utils/dateHelpers';

export function TodayScreen() {
  const nav = useNavigation<any>();
  const { tasks, completed, load: loadTasks, markComplete } = useTaskStore();
  const { plan, generate } = usePlanStore();
  const { categories, trees, load: loadTrees } = useTreeStore();
  const { active_trees, countdown_date, countdown_label } = useConfigStore();
  const { taskStats, refresh: refreshStats } = useStatsStore();

  const [refreshing, setRefreshing] = React.useState(false);

  const loadAll = useCallback(async () => {
    await loadTasks(active_trees);
    await loadTrees(active_trees);
  }, [active_trees]);

  useEffect(() => {
    loadAll().then(() => {
      const { tasks, completed } = useTaskStore.getState();
      const { categories } = useTreeStore.getState();
      generate(tasks, categories, undefined, '');
      refreshStats();
    });
  }, [active_trees]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await loadAll();
    const { tasks, completed } = useTaskStore.getState();
    const { categories } = useTreeStore.getState();
    generate(tasks, categories, undefined, '');
    await refreshStats();
    setRefreshing(false);
  }, [active_trees]);

  const handleTaskToggle = async (taskId: string, treeId: string, done: boolean) => {
    await markComplete(taskId, treeId, done);
    const t = useTaskStore.getState();
    const c = useTreeStore.getState();
    generate(t.tasks, c.categories, undefined, '');
    refreshStats();
  };

  const pct = taskStats ? (taskStats.done / taskStats.total * 100) : 0;

  const treeNames: Record<string, string> = {};
  for (const t of trees) {
    treeNames[t.id] = t.name;
  }
  const multiTree = active_trees.length > 1;

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View>
          <Text style={styles.title}>📚 学习计划</Text>
          <Text style={styles.date}>{formatDateDisplay()}</Text>
        </View>
        <ProgressRing pct={pct} />
      </View>
      {countdown_date ? (
        <View style={styles.countdownRow}>
          <CountdownWidget targetDate={countdown_date} label={countdown_label || '倒计时'} />
        </View>
      ) : null}
      <ScrollView
        style={styles.scroll}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {Object.entries(plan).map(([category, tasks]) => {
          const catData = categories.find(c => c.name === category);
          return (
            <PlanCategoryCard
              key={category}
              category={category}
              budget={catData?.daily_budget_min || 120}
              tasks={tasks || []}
              allTasks={useTaskStore.getState().tasks.filter(t => t.category === category)}
              completed={completed}
              treeNames={treeNames}
              multiTree={multiTree}
              onTaskToggle={handleTaskToggle}
              onTaskPress={(taskId, treeId) =>
                nav.navigate('TaskDetail', { taskId, treeId })
              }
            />
          );
        })}
        {Object.keys(plan).length === 0 && (
          <View style={styles.emptyAll}>
            <Text style={styles.emptyText}>没有活跃的知识树</Text>
            <Pressable style={styles.emptyBtn} onPress={() => nav.navigate('设置')}>
              <Text style={styles.emptyBtnText}>去设置</Text>
            </Pressable>
          </View>
        )}
        <View style={{ height: 80 }} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.bg,
  },
  header: {
    backgroundColor: theme.surface,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 14,
    borderBottomWidth: 1,
    borderBottomColor: theme.border,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: theme.text,
  },
  date: {
    fontSize: 13,
    color: theme.text2,
    marginTop: 4,
  },
  countdownRow: {
    paddingHorizontal: 12,
    paddingTop: 8,
  },
  scroll: {
    flex: 1,
    paddingHorizontal: 12,
    paddingTop: 8,
  },
  emptyAll: {
    alignItems: 'center',
    paddingTop: 60,
  },
  emptyText: {
    fontSize: 15,
    color: theme.text3,
    marginBottom: 16,
  },
  emptyBtn: {
    backgroundColor: theme.primary,
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: theme.radiusSm,
  },
  emptyBtnText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
});
