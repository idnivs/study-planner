import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Card } from '../ui/Card';
import { theme } from '../../constants/theme';
import { Milestone } from '../../services/progressTimeline';

interface ProgressTimelineProps {
  milestones: Milestone[];
  totalDays: number;
  dailyBudget: number;
}

const PHASE_COLORS: Record<string, string> = {
  '基础阶段': '#60a5fa',
  '强化阶段': '#f59e0b',
  '冲刺阶段': '#ef4444',
  '查漏补缺': '#10b981',
};

export function ProgressTimeline({ milestones, totalDays, dailyBudget }: ProgressTimelineProps) {
  if (milestones.length === 0) {
    return (
      <Card style={styles.card}>
        <Text style={styles.title}>📅 推荐进度</Text>
        <Text style={styles.empty}>
          设置倒计日期后，将显示每月里程碑推荐。
        </Text>
      </Card>
    );
  }

  return (
    <Card style={styles.card}>
      <Text style={styles.title}>📅 推荐进度</Text>
      <Text style={styles.subtitle}>
        每日学习 {dailyBudget} 分钟 · 预计 {totalDays} 天完成
      </Text>

      {milestones.map((m, i) => {
        const isLast = i === milestones.length - 1;
        const color = PHASE_COLORS[m.phase] || theme.primary;
        return (
          <View key={m.monthKey} style={styles.milestoneRow}>
            <View style={styles.timelineCol}>
              <View style={[styles.dot, { backgroundColor: color }]} />
              {!isLast && <View style={styles.line} />}
            </View>
            <View style={styles.milestoneContent}>
              <View style={styles.milestoneHeader}>
                <Text style={styles.month}>{m.month}</Text>
                <View style={[styles.phaseBadge, { backgroundColor: color + '22' }]}>
                  <Text style={[styles.phaseText, { color }]}>{m.phase}</Text>
                </View>
              </View>
              <View style={styles.progressBarBg}>
                <View style={[styles.progressBarFill, { width: `${m.targetPct}%`, backgroundColor: color }]} />
              </View>
              <Text style={styles.milestoneDetail}>
                完成 {m.targetDone} 个任务 ({m.targetPct}%)
              </Text>
            </View>
          </View>
        );
      })}
    </Card>
  );
}

const styles = StyleSheet.create({
  card: {
    marginTop: 12,
  },
  title: {
    fontSize: 15,
    fontWeight: 'bold',
    color: theme.text,
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 12,
    color: theme.text3,
    marginBottom: 16,
  },
  empty: {
    fontSize: 13,
    color: theme.text3,
    marginTop: 8,
  },
  milestoneRow: {
    flexDirection: 'row',
    marginBottom: 4,
  },
  timelineCol: {
    alignItems: 'center',
    width: 20,
    marginRight: 12,
  },
  dot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    marginTop: 6,
  },
  line: {
    width: 2,
    flex: 1,
    backgroundColor: theme.border,
    marginVertical: 2,
    minHeight: 40,
  },
  milestoneContent: {
    flex: 1,
    paddingBottom: 16,
  },
  milestoneHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 6,
  },
  month: {
    fontSize: 14,
    fontWeight: '600',
    color: theme.text,
  },
  phaseBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
  },
  phaseText: {
    fontSize: 11,
    fontWeight: '600',
  },
  progressBarBg: {
    height: 6,
    backgroundColor: theme.border,
    borderRadius: 3,
    marginBottom: 4,
  },
  progressBarFill: {
    height: 6,
    borderRadius: 3,
  },
  milestoneDetail: {
    fontSize: 11,
    color: theme.text2,
  },
});
