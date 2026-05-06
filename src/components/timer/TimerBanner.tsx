import React from 'react';
import { View, Text, Pressable, StyleSheet, Alert } from 'react-native';
import { useTimerStore } from '../../stores/useTimerStore';
import { useForegroundTimer } from '../../hooks/useForegroundTimer';
import { theme } from '../../constants/theme';
import { formatDuration } from '../../utils/dateHelpers';

interface TimerBannerProps {
  onExpand?: () => void;
  onManual?: () => void;
}

export function TimerBanner({ onExpand, onManual }: TimerBannerProps) {
  const current = useTimerStore((s) => s.current);
  const pause = useTimerStore((s) => s.pause);
  const resume = useTimerStore((s) => s.resume);
  const stop = useTimerStore((s) => s.stop);

  useForegroundTimer();

  if (!current) return null;

  const elapsed = current.running
    ? Math.floor((Date.now() - current.startTime) / 1000)
    : current.elapsed;

  const handleStop = () => {
    Alert.alert('停止计时', `已完成 "${current.taskTitle}"？`, [
      { text: '取消', style: 'cancel' },
      {
        text: '停止并记录',
        onPress: async () => {
          // Find treeId from task store
          const { useTaskStore } = require('../../stores/useTaskStore');
          const tasks = useTaskStore.getState().tasks;
          const task = tasks.find((t: any) => t.id === current.taskId);
          const treeId = task?.tree_id || '11408';
          await stop(treeId);
        },
      },
    ]);
  };

  return (
    <View style={styles.banner}>
      <View style={styles.left}>
        <Text style={styles.title} numberOfLines={1}>{current.taskTitle}</Text>
        <Text style={[styles.time, current.running && styles.timeRunning]}>
          {formatDuration(elapsed)}
        </Text>
      </View>
      <View style={styles.actions}>
        <Pressable
          style={[styles.btn, styles.smallBtn]}
          onPress={onManual}
        >
          <Text style={styles.smallIcon}>+</Text>
        </Pressable>
        <Pressable
          style={[styles.btn, current.running ? styles.pauseBtn : styles.playBtn]}
          onPress={() => current.running ? pause() : resume()}
        >
          <Text style={styles.btnIcon}>{current.running ? '⏸' : '▶'}</Text>
        </Pressable>
        <Pressable style={[styles.btn, styles.stopBtn]} onPress={handleStop}>
          <Text style={styles.stopIcon}>⏹</Text>
        </Pressable>
        <Pressable style={[styles.btn, styles.expandBtn]} onPress={onExpand}>
          <Text style={styles.expandIcon}>⛶</Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  banner: {
    backgroundColor: theme.primary,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  left: {
    flex: 1,
    marginRight: 12,
  },
  title: {
    color: 'rgba(255,255,255,0.9)',
    fontSize: 12,
    fontWeight: '500',
  },
  time: {
    color: '#fff',
    fontSize: 22,
    fontWeight: 'bold',
    fontFamily: 'monospace',
  },
  timeRunning: {
    // pulsing effect could be added later
  },
  actions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  btn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255,255,255,0.2)',
  },
  playBtn: {
    backgroundColor: 'rgba(255,255,255,0.3)',
  },
  pauseBtn: {
    backgroundColor: 'rgba(255,255,255,0.15)',
  },
  stopBtn: {
    backgroundColor: 'rgba(255,0,0,0.3)',
  },
  btnIcon: {
    color: '#fff',
    fontSize: 16,
  },
  stopIcon: {
    color: '#fff',
    fontSize: 14,
  },
  smallBtn: {
    backgroundColor: 'rgba(255,255,255,0.1)',
    width: 30,
    height: 30,
    borderRadius: 15,
  },
  smallIcon: {
    color: 'rgba(255,255,255,0.7)',
    fontSize: 16,
    fontWeight: 'bold',
  },
  expandBtn: {
    backgroundColor: 'rgba(255,255,255,0.1)',
    width: 30,
    height: 30,
    borderRadius: 15,
  },
  expandIcon: {
    color: 'rgba(255,255,255,0.7)',
    fontSize: 14,
  },
});
