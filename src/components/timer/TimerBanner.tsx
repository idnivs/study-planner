import React from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import { useTimerStore } from '../../stores/useTimerStore';
import { useNavigation } from '@react-navigation/native';
import { theme } from '../../constants/theme';
import { formatDuration } from '../../utils/dateHelpers';

export function TimerBanner() {
  const current = useTimerStore((s) => s.current);
  const pause = useTimerStore((s) => s.pause);
  const resume = useTimerStore((s) => s.resume);

  if (!current) return null;

  const elapsed = current.running
    ? Math.floor((Date.now() - current.startTime) / 1000)
    : current.elapsed;

  return (
    <View style={styles.banner}>
      <View style={styles.left}>
        <Text style={styles.title} numberOfLines={1}>{current.taskTitle}</Text>
        <Text style={styles.time}>{formatDuration(elapsed)}</Text>
      </View>
      <View style={styles.actions}>
        <Pressable
          style={[styles.btn, current.running ? styles.pauseBtn : styles.playBtn]}
          onPress={() => current.running ? pause() : resume()}
        >
          <Text style={styles.btnText}>{current.running ? '⏸' : '▶'}</Text>
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
    paddingVertical: 10,
    paddingTop: 10,
  },
  left: {
    flex: 1,
  },
  title: {
    color: '#fff',
    fontSize: 13,
    fontWeight: '600',
  },
  time: {
    color: '#fff',
    fontSize: 22,
    fontWeight: 'bold',
    fontFamily: 'monospace',
  },
  actions: {
    flexDirection: 'row',
  },
  btn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 8,
  },
  playBtn: {
    backgroundColor: 'rgba(255,255,255,0.25)',
  },
  pauseBtn: {
    backgroundColor: 'rgba(255,255,255,0.25)',
  },
  btnText: {
    color: '#fff',
    fontSize: 18,
  },
});
