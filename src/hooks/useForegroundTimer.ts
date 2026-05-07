import { useEffect, useRef } from 'react';
import { AppState, AppStateStatus, Platform, Alert } from 'react-native';
import { activateKeepAwakeAsync, deactivateKeepAwake } from 'expo-keep-awake';
import * as Notifications from 'expo-notifications';
import { useTimerStore } from '../stores/useTimerStore';
import { formatDuration } from '../utils/dateHelpers';

const BG_PAUSE_THRESHOLD = 15 * 60 * 1000; // 15 minutes

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: false,
    shouldSetBadge: false,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

export function useForegroundTimer() {
  const current = useTimerStore((s) => s.current);
  const tick = useTimerStore((s) => s.tick);
  const pause = useTimerStore((s) => s.pause);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const bgTimestamp = useRef<number | null>(null);
  const notificationId = useRef<string | null>(null);
  const alertedRef = useRef(false);

  // Keep-awake: prevent screen sleep while timer is running
  useEffect(() => {
    if (current?.running) {
      activateKeepAwakeAsync('timer').catch(() => {});
    } else {
      deactivateKeepAwake('timer').catch(() => {});
    }
    return () => {
      deactivateKeepAwake('timer').catch(() => {});
    };
  }, [current?.running]);

  // Tick every 200ms while running in foreground
  useEffect(() => {
    if (current?.running) {
      intervalRef.current = setInterval(() => {
        const elapsed = Math.floor((Date.now() - current.startTime) / 1000);
        tick(elapsed);
      }, 200);
    }
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, [current?.running, current?.taskId]);

  // Handle app background/foreground transitions
  useEffect(() => {
    const handleChange = async (state: AppStateStatus) => {
      if (!current?.running) {
        alertedRef.current = false;
        return;
      }

      if (state === 'background' || state === 'inactive') {
        bgTimestamp.current = Date.now();

        // Show notification to remind user timer is running
        if (Platform.OS === 'android') {
          const elapsed = Math.floor((Date.now() - current.startTime) / 1000);
          const id = await Notifications.scheduleNotificationAsync({
            content: {
              title: `计时中: ${current.taskTitle}`,
              body: `已进行 ${formatDuration(elapsed)} / 预计 ${current.estimatedMin}min`,
              data: { taskId: current.taskId },
            },
            trigger: null,
          });
          notificationId.current = id;
        }
      } else if (state === 'active') {
        // Dismiss notification when back in foreground
        if (notificationId.current) {
          await Notifications.dismissNotificationAsync(notificationId.current);
          notificationId.current = null;
        }

        // Check if app was in background too long
        if (bgTimestamp.current && !alertedRef.current) {
          const bgDuration = Date.now() - bgTimestamp.current;
          if (bgDuration > BG_PAUSE_THRESHOLD) {
            alertedRef.current = true;
            const bgMin = Math.round(bgDuration / 60000);
            const bgSec = Math.floor(bgDuration / 1000);

            // Auto-pause and ask user what to do
            pause();

            // Use a small delay so the pause state propagates
            setTimeout(() => {
              Alert.alert(
                '计时已暂停',
                `应用在后台停留了 ${bgMin} 分钟。这段时间计入学习时长吗？`,
                [
                  {
                    text: '不计入',
                    onPress: () => {
                      // Timer remains paused at the pre-background elapsed
                    },
                  },
                  {
                    text: '全部计入',
                    onPress: () => {
                      // Resume so the elapsed counts the background time
                      useTimerStore.getState().resume();
                    },
                  },
                ],
                { cancelable: false }
              );
            }, 300);
          }
          bgTimestamp.current = null;
        }
      }
    };

    const sub = AppState.addEventListener('change', handleChange);
    return () => sub.remove();
  }, [current?.running, current?.taskId, current?.startTime]);
}
