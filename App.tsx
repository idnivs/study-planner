import React, { useEffect, useState } from 'react';
import { View, StyleSheet, Alert } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { StatusBar } from 'expo-status-bar';
import { NavigationContainer } from '@react-navigation/native';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import { RootNavigator } from './src/navigation/RootNavigator';
import { TimerBanner } from './src/components/timer/TimerBanner';
import { TimerFullScreen } from './src/components/timer/TimerFullScreen';
import { ManualTimeModal } from './src/components/timer/ManualTimeModal';
import { useConfigStore } from './src/stores/useConfigStore';
import { useTimerStore } from './src/stores/useTimerStore';
import { getDatabase } from './src/db/database';
import { theme } from './src/constants/theme';
import { scheduleDailyReminder } from './src/services/notificationService';
import { loadTimerState, clearTimerState } from './src/services/timeTracker';

export default function App() {
  const [dbReady, setDbReady] = useState(false);
  const [timerFullScreen, setTimerFullScreen] = useState(false);
  const [manualModal, setManualModal] = useState(false);
  const loadConfig = useConfigStore((s) => s.load);

  useEffect(() => {
    (async () => {
      await getDatabase();
      await loadConfig();
      // Re-schedule daily reminder if enabled
      const state = useConfigStore.getState();
      if (state.notify_enabled) {
        await scheduleDailyReminder(state.notify_time);
      }
      // Check for dangling timer from previous session (app killed while timer was running)
      const saved = await loadTimerState();
      if (saved) {
        const elapsed = Math.floor((Date.now() - saved.startTime) / 1000);
        if (elapsed > 10) {
          // Only recover if at least 10 seconds elapsed
          const elapsedStr = `${Math.floor(elapsed / 60)}分${elapsed % 60}秒`;
          Alert.alert(
            '恢复计时器',
            `上次应用关闭时计时器还在运行。\n任务：${saved.taskTitle}\n已过时间：${elapsedStr}\n\n是否恢复计时？`,
            [
              {
                text: '放弃',
                onPress: async () => {
                  await clearTimerState();
                },
              },
              {
                text: '恢复',
                onPress: () => {
                  useTimerStore.getState().restore({
                    taskId: saved.taskId,
                    taskTitle: saved.taskTitle,
                    estimatedMin: saved.estimatedMin,
                    running: true,
                    startTime: saved.startTime,
                    elapsed: 0,
                  });
                },
              },
            ],
            { cancelable: false }
          );
        } else {
          // Very short elapsed time, just discard
          await clearTimerState();
        }
      }
      setDbReady(true);
    })();
  }, []);

  if (!dbReady) {
    return <View style={styles.loading} />;
  }

  return (
    <GestureHandlerRootView style={styles.container}>
      <SafeAreaProvider>
        <SafeAreaView style={styles.container} edges={['top']}>
        <StatusBar style="dark" />
        <TimerBanner
          onExpand={() => setTimerFullScreen(true)}
          onManual={() => setManualModal(true)}
        />
        <NavigationContainer>
          <RootNavigator />
        </NavigationContainer>
        <TimerFullScreen
          visible={timerFullScreen}
          onClose={() => setTimerFullScreen(false)}
        />
        <ManualTimeModal
          visible={manualModal}
          onClose={() => setManualModal(false)}
        />
        </SafeAreaView>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.bg,
  },
  loading: {
    flex: 1,
    backgroundColor: theme.bg,
  },
});
