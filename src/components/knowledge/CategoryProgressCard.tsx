import React from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import { theme } from '../../constants/theme';
import { getCatStyle } from '../../constants/categories';
import { PaceResult } from '../../utils/paceCalculator';

interface CategoryProgressCardProps {
  category: string;
  pace: PaceResult;
  onPress: () => void;
}

const STATUS_STYLE: Record<string, { icon: string; color: string }> = {
  ahead: { icon: '⚡', color: theme.success },
  behind: { icon: '🐢', color: theme.warning },
  on_track: { icon: '→', color: theme.text3 },
};

export function CategoryProgressCard({ category, pace, onPress }: CategoryProgressCardProps) {
  const catStyle = getCatStyle(category);
  const status = STATUS_STYLE[pace.status];
  const barW = Math.round(pace.pct / 5);
  const bar = '█'.repeat(barW) + '░'.repeat(20 - barW);

  return (
    <Pressable style={styles.card} onPress={onPress}>
      <View style={styles.header}>
        <Text style={styles.icon}>{catStyle.icon}</Text>
        <Text style={styles.catName}>{category}</Text>
        <View style={styles.statusRow}>
          <Text style={[styles.statusIcon]}>{status.icon}</Text>
          <Text style={[styles.statusText, { color: status.color }]}>{pace.label}</Text>
        </View>
      </View>
      <Text style={styles.bar}>{bar}</Text>
      <Text style={styles.stats}>
        {pace.done}/{pace.total} ({Math.round(pace.pct * 100)}%)
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: theme.surface,
    borderRadius: theme.radius,
    padding: 14,
    marginBottom: 10,
    ...theme.shadowStyle,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
    gap: 8,
  },
  icon: {
    fontSize: 18,
  },
  catName: {
    fontSize: 15,
    fontWeight: '600',
    color: theme.text,
    flex: 1,
  },
  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  statusIcon: {
    fontSize: 14,
  },
  statusText: {
    fontSize: 11,
    fontWeight: '600',
  },
  bar: {
    fontSize: 12,
    color: theme.text2,
    fontFamily: 'monospace',
    letterSpacing: 1,
  },
  stats: {
    fontSize: 11,
    color: theme.text3,
    marginTop: 4,
  },
});
