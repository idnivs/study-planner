import { create } from 'zustand';
import { TaskStats, TimeStats } from '../types/progress';
import { useTaskStore } from './useTaskStore';
import { getTotalTimeStats } from '../db/repositories/progressRepo';

interface StatsState {
  taskStats: TaskStats | null;
  timeStats: TimeStats;
  loading: boolean;
  refresh: () => Promise<void>;
}

export const useStatsStore = create<StatsState>((set) => ({
  taskStats: null,
  timeStats: { sessions: 0, hours: 0 },
  loading: false,

  refresh: async () => {
    set({ loading: true });
    const taskStats = useTaskStore.getState().getStats();
    const timeStats = await getTotalTimeStats();
    set({ taskStats, timeStats, loading: false });
  },
}));
