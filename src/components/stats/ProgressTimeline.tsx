import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Card } from '../ui/Card';
import { theme } from '../../constants/theme';
import { getCatStyle } from '../../constants/categories';
import { CategoryTarget } from '../../services/progressTimeline';

interface ProgressTimelineProps {
  month: string;
  targets: CategoryTarget[];
}

export function ProgressTimeline({ month, targets }: ProgressTimelineProps) {
  return (
    <Card style={styles.card}>
      <Text style={styles.title}>📅 {month} 目标</Text>

      {targets.map((t) => {
        const catStyle = getCatStyle(t.category);
        const statusIcon = t.ahead ? '⚡' : t.behind ? '🐢' : '→';
        const statusColor = t.ahead ? theme.success : t.behind ? theme.warning : theme.text3;
        const statusText = t.ahead ? '超前' : t.behind ? '落后' : '正常';
        const barW = Math.round(t.pct / 5);
        const bar = '█'.repeat(barW) + '░'.repeat(20 - barW);

        return (
          <View key={t.category} style={styles.row}>
            <View style={styles.catHeader}>
              <Text style={styles.catIcon}>{catStyle.icon}</Text>
              <Text style={styles.catName}>{t.category}</Text>
              <Text style={[styles.status, { color: statusColor }]}>
                {statusIcon} {statusText}
              </Text>
            </View>
            <Text style={styles.bar}>{bar}  {t.done}/{t.total} ({Math.round(t.pct * 100)}%)</Text>
            {t.targetTask ? (
              <Text style={styles.refPoint}>
                参考进度：{t.targetTask.module} · {t.targetTask.chapter}
              </Text>
            ) : null}
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
    marginBottom: 14,
  },
  row: {
    marginBottom: 12,
  },
  catHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 4,
  },
  catIcon: {
    fontSize: 16,
  },
  catName: {
    fontSize: 14,
    fontWeight: '600',
    color: theme.text,
    flex: 1,
  },
  status: {
    fontSize: 11,
    fontWeight: '600',
  },
  bar: {
    fontSize: 11,
    color: theme.text2,
    fontFamily: 'monospace',
    marginBottom: 2,
  },
  refPoint: {
    fontSize: 11,
    color: theme.primary,
    fontWeight: '500',
  },
});
