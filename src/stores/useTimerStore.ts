import { create } from 'zustand';
import { TimerState } from '../types/progress';
import { recordTime, getTaskStats } from '../services/timeTracker';

interface TimerStore {
  current: TimerState | null;
  taskStats: { count: number; avgActual: number; avgEstimated: number } | null;
  start: (taskId: string, taskTitle: string, estimatedMin: number) => void;
  stop: (treeId: string) => Promise<void>;
  pause: () => void;
  resume: () => void;
  tick: (elapsed: number) => void;
  recordManual: (taskId: string, treeId: string, estimatedMin: number, minutes: number) => Promise<void>;
  loadStats: (taskId: string, treeId: string) => Promise<void>;
  clear: () => void;
}

export const useTimerStore = create<TimerStore>((set, get) => ({
  current: null,
  taskStats: null,

  start: (taskId, taskTitle, estimatedMin) => {
    set({
      current: {
        taskId,
        taskTitle,
        estimatedMin,
        running: true,
        startTime: Date.now(),
        elapsed: 0,
      },
    });
  },

  stop: async (treeId) => {
    const cur = get().current;
    if (!cur) return;
    await recordTime(cur.taskId, treeId, cur.estimatedMin, cur.elapsed);
    set({ current: null });
  },

  pause: () => {
    const cur = get().current;
    if (!cur || !cur.running) return;
    set({
      current: {
        ...cur,
        running: false,
        elapsed: Math.floor((Date.now() - cur.startTime) / 1000),
      },
    });
  },

  resume: () => {
    const cur = get().current;
    if (!cur || cur.running) return;
    set({
      current: {
        ...cur,
        running: true,
        startTime: Date.now() - cur.elapsed * 1000,
      },
    });
  },

  tick: (elapsed) => {
    const cur = get().current;
    if (!cur || !cur.running) return;
    set({ current: { ...cur, elapsed } });
  },

  recordManual: async (taskId, treeId, estimatedMin, minutes) => {
    await recordTime(taskId, treeId, estimatedMin, minutes * 60);
  },

  loadStats: async (taskId, treeId) => {
    const stats = await getTaskStats(taskId, treeId);
    set({ taskStats: stats });
  },

  clear: () => set({ current: null, taskStats: null }),
}));
