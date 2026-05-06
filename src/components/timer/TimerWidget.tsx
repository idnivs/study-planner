import React, { useEffect, useRef } from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import { theme } from '../../constants/theme';
import { useTimerStore } from '../../stores/useTimerStore';
import { formatDuration } from '../../utils/dateHelpers';

interface TimerWidgetProps {
  taskId: string;
  taskTitle: string;
  estimatedMin: number;
  treeId: string;
}

export function TimerWidget({ taskId, taskTitle, estimatedMin, treeId }: TimerWidgetProps) {
  const { current, start, stop, pause, resume, tick, taskStats } = useTimerStore();
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  const isActive = current?.taskId === taskId;
  const running = isActive && current?.running;

  useEffect(() => {
    if (running) {
      intervalRef.current = setInterval(() => {
        if (current) {
          const elapsed = Math.floor((Date.now() - current.startTime) / 1000);
          tick(elapsed);
        }
      }, 200);
    }
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [running, current?.taskId]);

  const handleToggle = async () => {
    if (!isActive) {
      start(taskId, taskTitle, estimatedMin);
    } else if (running) {
      pause();
    } else {
      resume();
    }
  };

  const handleStop = async () => {
    if (current?.taskId === taskId) {
      await stop(treeId);
    }
  };

  const elapsedStr = isActive ? formatDuration(current?.elapsed || 0) : '00:00';
  const btnLabel = !isActive ? '▶ 计时' : running ? '⏸ 暂停' : '▶ 继续';
  const btnBg = running ? theme.danger : theme.primary;

  return (
    <View style={styles.container}>
      <View style={styles.row}>
        <Text style={styles.timeLabel}>{elapsedStr}</Text>
        <Pressable style={[styles.btn, { backgroundColor: btnBg }]} onPress={handleToggle}>
          <Text style={styles.btnText}>{btnLabel}</Text>
        </Pressable>
        {isActive && (
          <Pressable style={[styles.btn, styles.stopBtn]} onPress={handleStop}>
            <Text style={styles.stopText}>⏹ 完成</Text>
          </Pressable>
        )}
      </View>
      <View style={styles.info}>
        <Text style={styles.estLabel}>预计 {estimatedMin} min</Text>
        {taskStats && (
          <Text style={styles.statsLabel}> | 历史平均 {taskStats.avgActual}min</Text>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: theme.bg,
    borderRadius: theme.radiusSm,
    padding: 12,
    marginTop: 8,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  timeLabel: {
    fontSize: 24,
    fontWeight: 'bold',
    fontFamily: 'monospace',
    color: theme.text,
    marginRight: 12,
  },
  btn: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: theme.radiusSm,
    marginRight: 8,
  },
  btnText: {
    color: '#fff',
    fontSize: 13,
    fontWeight: '600',
  },
  stopBtn: {
    backgroundColor: theme.surface,
    borderWidth: 1,
    borderColor: theme.border,
  },
  stopText: {
    color: theme.danger,
    fontSize: 13,
    fontWeight: '600',
  },
  info: {
    flexDirection: 'row',
    marginTop: 6,
  },
  estLabel: {
    fontSize: 11,
    color: theme.text2,
  },
  statsLabel: {
    fontSize: 11,
    color: theme.primary,
  },
});
