import React, { useEffect, useMemo } from 'react';
import { View, Text, ScrollView, StyleSheet } from 'react-native';
import { useStatsStore } from '../stores/useStatsStore';
import { useTaskStore } from '../stores/useTaskStore';
import { useConfigStore } from '../stores/useConfigStore';
import { useTreeStore } from '../stores/useTreeStore';
import { ProgressRing } from '../components/stats/ProgressRing';
import { ProgressTimeline } from '../components/stats/ProgressTimeline';
import { Card } from '../components/ui/Card';
import { theme } from '../constants/theme';
import { calcMonthlyTargets } from '../services/progressTimeline';

export function StatsScreen() {
  const { taskStats, timeStats, refresh } = useStatsStore();
  const { active_trees, countdown_date } = useConfigStore();
  const tasks = useTaskStore((s) => s.tasks);
  const completed = useTaskStore((s) => s.completed);
  const categories = useTreeStore((s) => s.categories);

  useEffect(() => {
    refresh();
  }, [active_trees]);

  const monthly = useMemo(() => {
    return calcMonthlyTargets(tasks, completed, countdown_date || undefined);
  }, [tasks, completed, countdown_date]);

  const pct = taskStats ? (taskStats.total > 0 ? taskStats.done / taskStats.total * 100 : 0) : 0;

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Card style={styles.hero}>
        <ProgressRing pct={pct} size={100} thickness={8} />
        <View style={styles.heroText}>
          <Text style={styles.heroTitle}>
            {taskStats?.done || 0} / {taskStats?.total || 0}
          </Text>
          <Text style={styles.heroSub}>任务完成</Text>
          <Text style={styles.heroDetail}>
            可解锁 {taskStats?.unlocked || 0} · 锁定 {taskStats?.locked || 0}
          </Text>
        </View>
      </Card>

      <View style={styles.row}>
        <Card style={styles.halfCard}>
          <Text style={styles.statNumber}>{timeStats.sessions}</Text>
          <Text style={styles.statLabel}>累计学习次数</Text>
        </Card>
        <Card style={styles.halfCard}>
          <Text style={styles.statNumber}>{timeStats.hours.toFixed(1)}</Text>
          <Text style={styles.statLabel}>累计学习小时</Text>
        </Card>
      </View>

      {monthly && (
        <ProgressTimeline
          month={monthly.month}
          targets={monthly.targets}
        />
      )}
      <View style={{ height: 60 }} />
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
  },
  hero: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 24,
    paddingVertical: 24,
  },
  heroText: {
    alignItems: 'flex-start',
  },
  heroTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: theme.text,
  },
  heroSub: {
    fontSize: 14,
    color: theme.text2,
    marginTop: 2,
  },
  heroDetail: {
    fontSize: 12,
    color: theme.text3,
    marginTop: 4,
  },
  row: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 12,
  },
  halfCard: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 16,
  },
  statNumber: {
    fontSize: 24,
    fontWeight: 'bold',
    color: theme.primary,
  },
  statLabel: {
    fontSize: 12,
    color: theme.text2,
    marginTop: 4,
  },
});
