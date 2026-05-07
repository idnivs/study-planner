import { create } from 'zustand';
import { TaskStats, TimeStats } from '../types/progress';
import { useTaskStore } from './useTaskStore';
import { getTotalTimeStats, getDailyStats } from '../db/repositories/progressRepo';

interface StatsState {
  taskStats: TaskStats | null;
  timeStats: TimeStats;
  dailyStats: Record<string, number>;
  loading: boolean;
  refresh: () => Promise<void>;
}

export const useStatsStore = create<StatsState>((set) => ({
  taskStats: null,
  timeStats: { sessions: 0, hours: 0 },
  dailyStats: {},
  loading: false,

  refresh: async () => {
    set({ loading: true });
    const taskStats = useTaskStore.getState().getStats();
    const [timeStats, dailyStats] = await Promise.all([
      getTotalTimeStats(),
      getDailyStats(),
    ]);
    set({ taskStats, timeStats, dailyStats, loading: false });
  },
}));
