import React, { useEffect } from 'react';
import { View, Text, ScrollView, StyleSheet } from 'react-native';
import { useStatsStore } from '../stores/useStatsStore';
import { useTaskStore } from '../stores/useTaskStore';
import { useConfigStore } from '../stores/useConfigStore';
import { ProgressRing } from '../components/stats/ProgressRing';
import { Card } from '../components/ui/Card';
import { theme } from '../constants/theme';
import { getCatStyle } from '../constants/categories';

export function StatsScreen() {
  const { taskStats, timeStats, refresh } = useStatsStore();
  const { active_trees } = useConfigStore();
  const tasks = useTaskStore((s) => s.tasks);

  useEffect(() => {
    refresh();
  }, [active_trees]);

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

      <Text style={styles.sectionTitle}>分类统计</Text>
      {taskStats && Object.entries(taskStats.by_category).map(([cat, s]) => {
        const catStyle = getCatStyle(cat);
        const catPct = s.total > 0 ? s.done / s.total * 100 : 0;
        const barW = Math.round(catPct / 5);
        const bar = '█'.repeat(barW) + '░'.repeat(20 - barW);
        return (
          <Card key={cat} style={{ marginBottom: 8 }}>
            <View style={styles.catRow}>
              <Text style={[styles.catIcon]}>{catStyle.icon}</Text>
              <View style={styles.catInfo}>
                <Text style={styles.catName}>{cat}</Text>
                <Text style={styles.catBar}>{bar}  {s.done}/{s.total} ({Math.round(catPct)}%)</Text>
              </View>
            </View>
          </Card>
        );
      })}
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
  sectionTitle: {
    fontSize: 15,
    fontWeight: 'bold',
    color: theme.text,
    marginTop: 20,
    marginBottom: 10,
  },
  catRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  catIcon: {
    fontSize: 24,
    marginRight: 12,
  },
  catInfo: {
    flex: 1,
  },
  catName: {
    fontSize: 14,
    fontWeight: '600',
    color: theme.text,
  },
  catBar: {
    fontSize: 11,
    color: theme.text2,
    marginTop: 4,
    fontFamily: 'monospace',
  },
});
