import React, { useEffect, useRef, useState } from 'react';
import { View, Text, Pressable, Modal, StyleSheet } from 'react-native';
import { useKeepAwake } from 'expo-keep-awake';
import { theme } from '../../constants/theme';
import { useTimerStore } from '../../stores/useTimerStore';
import { formatDuration } from '../../utils/dateHelpers';

interface TimerFullScreenProps {
  visible: boolean;
  onClose: () => void;
}

export function TimerFullScreen({ visible, onClose }: TimerFullScreenProps) {
  const { current, start, stop, pause, resume, tick } = useTimerStore();
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const [elapsed, setElapsed] = useState(0);

  useKeepAwake();

  useEffect(() => {
    if (current?.running) {
      intervalRef.current = setInterval(() => {
        if (current) {
          const e = Math.floor((Date.now() - current.startTime) / 1000);
          setElapsed(e);
          tick(e);
        }
      }, 200);
    }
    return () => { if (intervalRef.current) clearInterval(intervalRef.current); };
  }, [current?.running, current?.taskId]);

  const isRunning = current?.running;

  const handleToggle = () => {
    if (!current) return;
    if (isRunning) {
      pause();
    } else {
      resume();
    }
  };

  const handleStop = async () => {
    if (current) {
      // treeId is not stored in timer, pass empty — stop handles it
    }
    onClose();
  };

  const display = current
    ? formatDuration(isRunning ? elapsed : (current?.elapsed || 0))
    : '00:00';

  return (
    <Modal visible={visible} animationType="fade" onRequestClose={onClose}>
      <View style={styles.container}>
        <Pressable style={styles.closeBtn} onPress={onClose}>
          <Text style={styles.closeBtnText}>✕ 收起</Text>
        </Pressable>

        <View style={styles.center}>
          {current ? (
            <>
              <Text style={styles.taskTitle} numberOfLines={2}>{current.taskTitle}</Text>
              <Text style={styles.estLabel}>预估 {current.estimatedMin} 分钟</Text>
              <Text style={styles.timer}>{display}</Text>

              <View style={styles.controls}>
                <Pressable
                  style={[styles.ctrlBtn, { backgroundColor: isRunning ? theme.danger : theme.success }]}
                  onPress={handleToggle}
                >
                  <Text style={styles.ctrlText}>{isRunning ? '⏸ 暂停' : '▶ 开始'}</Text>
                </Pressable>
                {current && (
                  <Pressable style={[styles.ctrlBtn, styles.stopBtn]} onPress={handleStop}>
                    <Text style={styles.stopText}>⏹ 结束</Text>
                  </Pressable>
                )}
              </View>
            </>
          ) : (
            <>
              <Text style={styles.noTask}>没有正在进行的任务</Text>
              <Text style={styles.noTaskHint}>在任务上点击 ⏱ 开始计时</Text>
            </>
          )}
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.bg,
  },
  closeBtn: {
    position: 'absolute',
    top: 50,
    right: 20,
    zIndex: 10,
    padding: 10,
  },
  closeBtnText: {
    color: theme.text2,
    fontSize: 15,
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
  },
  taskTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: theme.text,
    textAlign: 'center',
    marginBottom: 6,
  },
  estLabel: {
    fontSize: 14,
    color: theme.text3,
    marginBottom: 32,
  },
  timer: {
    fontSize: 64,
    fontWeight: 'bold',
    fontFamily: 'monospace',
    color: theme.text,
    marginBottom: 48,
    fontVariant: ['tabular-nums'],
  },
  controls: {
    flexDirection: 'row',
    gap: 16,
  },
  ctrlBtn: {
    paddingHorizontal: 32,
    paddingVertical: 16,
    borderRadius: theme.radius,
  },
  ctrlText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
  },
  stopBtn: {
    backgroundColor: theme.surface,
    borderWidth: 1,
    borderColor: theme.border,
  },
  stopText: {
    color: theme.danger,
    fontSize: 18,
    fontWeight: '600',
  },
  noTask: {
    fontSize: 18,
    color: theme.text2,
  },
  noTaskHint: {
    fontSize: 13,
    color: theme.text3,
    marginTop: 8,
  },
});
