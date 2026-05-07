import React, { useMemo, useState } from 'react';
import { View, Text, Pressable, Modal, ScrollView, StyleSheet } from 'react-native';
import { Card } from '../ui/Card';
import { theme } from '../../constants/theme';

interface Props {
  dailyStats: Record<string, number>;
  weeks?: number;
}

const DAY_MS = 86400000;
const LEVELS = [0, 1, 30, 60, 120] as const;
const CELL = 13;
const GAP = 2;
const CELL_LG = 20;
const GAP_LG = 3;
const WEEKDAYS = ['一', '二', '三', '四', '五', '六', '日'];

function getLevel(minutes: number): number {
  for (let i = LEVELS.length - 1; i >= 0; i--) {
    if (minutes >= LEVELS[i]) return i;
  }
  return 0;
}

function HeatmapGrid({
  dailyStats, weeks, cellSize, gap, showAllDays,
}: { dailyStats: Record<string, number>; weeks: number; cellSize: number; gap: number; showAllDays?: boolean }) {
  const { grid, months } = useMemo(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const dayOfWeek = today.getDay();
    const endDate = new Date(today.getTime() - dayOfWeek * DAY_MS + 6 * DAY_MS);
    const startDate = new Date(endDate.getTime() - (weeks * 7 - 1) * DAY_MS);

    const grid: { date: string; level: number; minutes: number }[][] = [];
    const months: { label: string; col: number }[] = [];

    for (let row = 0; row < 7; row++) {
      grid.push([]);
      for (let col = 0; col < weeks; col++) {
        const d = new Date(startDate.getTime() + (col * 7 + row) * DAY_MS);
        const key = d.toISOString().slice(0, 10);
        const minutes = dailyStats[key] || 0;
        grid[row].push({ date: key, level: getLevel(minutes), minutes });
      }
    }

    for (let col = 0; col < weeks; col++) {
      const d = new Date(startDate.getTime() + col * 7 * DAY_MS);
      if (d.getDate() <= 7 || col === 0) {
        months.push({ label: `${d.getMonth() + 1}月`, col });
      }
    }

    return { grid, months };
  }, [dailyStats, weeks]);

  const dayIndices = showAllDays ? [0, 1, 2, 3, 4, 5, 6] : [0, 2, 4, 6];

  return (
    <View>
      <View style={{ height: 18, position: 'relative', marginBottom: 2 }}>
        <View style={{ width: showAllDays ? 30 : 24 }} />
        {months.map((m) => (
          <Text
            key={m.col}
            style={{
              position: 'absolute',
              left: m.col * (cellSize + gap) + (showAllDays ? 34 : 28),
              fontSize: showAllDays ? 12 : 10,
              color: theme.text3,
            }}
          >
            {m.label}
          </Text>
        ))}
      </View>

      <View style={{ flexDirection: 'row' }}>
        <View style={{ width: showAllDays ? 30 : 24, height: 7 * (cellSize + gap), position: 'relative', marginRight: 4 }}>
          {dayIndices.map((di, i) => (
            <Text
              key={WEEKDAYS[di]}
              style={{
                position: 'absolute',
                top: di * (cellSize + gap),
                fontSize: showAllDays ? 12 : 9,
                color: theme.text3,
                lineHeight: cellSize,
              }}
            >
              {WEEKDAYS[di]}
            </Text>
          ))}
        </View>

        <View style={{ flexDirection: 'column', gap }}>
          {grid.map((row, ri) => (
            <View key={ri} style={{ flexDirection: 'row', gap }}>
              {row.map((cell) => (
                <View
                  key={cell.date}
                  style={{
                    width: cellSize,
                    height: cellSize,
                    borderRadius: cellSize > 16 ? 3 : 2,
                    backgroundColor: CELL_COLORS[cell.level],
                  }}
                />
              ))}
            </View>
          ))}
        </View>
      </View>
    </View>
  );
}

export function CalendarHeatmap({ dailyStats, weeks = 20 }: Props) {
  const [zoomed, setZoomed] = useState(false);
  const totalHours = useMemo(() => {
    let total = 0;
    for (const v of Object.values(dailyStats)) total += v;
    return (total / 60).toFixed(1);
  }, [dailyStats]);

  return (
    <>
      <Pressable onPress={() => setZoomed(true)}>
        <Card style={styles.card}>
          <View style={styles.header}>
            <Text style={styles.title}>📅 学习日历</Text>
            <Text style={styles.total}>{totalHours} 小时</Text>
          </View>

          <HeatmapGrid dailyStats={dailyStats} weeks={weeks} cellSize={CELL} gap={GAP} />

          <View style={styles.legend}>
            <Text style={styles.legendText}>少</Text>
            {LEVELS.map((_, i) => (
              <View key={i} style={[styles.legendCell, { backgroundColor: CELL_COLORS[i] }]} />
            ))}
            <Text style={styles.legendText}>多</Text>
          </View>
        </Card>
      </Pressable>

      <Modal visible={zoomed} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>📅 学习日历</Text>
              <Pressable onPress={() => setZoomed(false)}>
                <Text style={styles.modalClose}>✕</Text>
              </Pressable>
            </View>
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              <View style={{ padding: 16 }}>
                <HeatmapGrid
                  dailyStats={dailyStats}
                  weeks={weeks}
                  cellSize={CELL_LG}
                  gap={GAP_LG}
                  showAllDays
                />
              </View>
            </ScrollView>
            <View style={styles.legend}>
              <Text style={styles.legendTextLg}>少</Text>
              {LEVELS.map((_, i) => (
                <View key={i} style={[styles.legendCellLg, { backgroundColor: CELL_COLORS[i] }]} />
              ))}
              <Text style={styles.legendTextLg}>多</Text>
              <Text style={[styles.legendTextLg, { marginLeft: 16 }]}>共 {totalHours} 小时</Text>
            </View>
          </View>
        </View>
      </Modal>
    </>
  );
}

const CELL_COLORS = ['#ebedf0', '#c6e48b', '#7bc96f', '#239a3b', '#196127'];

const styles = StyleSheet.create({
  card: {
    marginTop: 12,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  title: {
    fontSize: 14,
    fontWeight: '600',
    color: theme.text,
  },
  total: {
    fontSize: 12,
    color: theme.text3,
  },
  legend: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    gap: 3,
    marginTop: 8,
  },
  legendCell: {
    width: CELL,
    height: CELL,
    borderRadius: 2,
  },
  legendCellLg: {
    width: CELL_LG,
    height: CELL_LG,
    borderRadius: 3,
  },
  legendText: {
    fontSize: 9,
    color: theme.text3,
    marginHorizontal: 2,
  },
  legendTextLg: {
    fontSize: 12,
    color: theme.text3,
    marginHorizontal: 3,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'center',
    paddingHorizontal: 16,
  },
  modalCard: {
    backgroundColor: theme.surface,
    borderRadius: theme.radius,
    padding: 16,
    maxHeight: '80%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  modalTitle: {
    fontSize: 17,
    fontWeight: '600',
    color: theme.text,
  },
  modalClose: {
    fontSize: 22,
    color: theme.text3,
    padding: 4,
  },
});
