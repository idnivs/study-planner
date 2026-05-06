import { create } from 'zustand';
import { Task, TaskWithMeta, CustomTaskInput } from '../types/task';
import { TaskStats } from '../types/progress';
import {
  loadTasks, markComplete, addCustomTask,
  deleteCustomTask, decomposeTask, isCompleted,
  isUnlocked, getAvailableTasks, getLockedTasks,
  clearCache, getContextSummary,
} from '../services/taskManager';
import { getTaskAdjustedEstimate } from '../services/timeTracker';

interface TaskState {
  tasks: Task[];
  completed: Record<string, boolean>;
  loading: boolean;
  load: (treeIds: string[]) => Promise<void>;
  markComplete: (taskId: string, treeId: string, done: boolean) => Promise<void>;
  addCustomTask: (input: CustomTaskInput, treeId: string) => Promise<string>;
  deleteCustomTask: (taskId: string, treeId: string) => Promise<boolean>;
  decomposeTask: (taskId: string, treeId: string, subs?: string[]) => Promise<string[]>;
  isCompleted: (taskId: string) => boolean;
  isUnlocked: (taskId: string) => boolean;
  getAvailable: (category?: string) => Task[];
  getLocked: (category?: string) => Task[];
  getContextSummary: () => Promise<string>;
  getStats: () => TaskStats;
  getTaskWithMeta: (taskId: string, treeId: string) => Promise<TaskWithMeta | null>;
}

export const useTaskStore = create<TaskState>((set, get) => ({
  tasks: [],
  completed: {},
  loading: false,

  load: async (treeIds: string[]) => {
    set({ loading: true });
    clearCache();
    const { tasks, completed } = await loadTasks(treeIds);
    set({ tasks, completed, loading: false });
  },

  markComplete: async (taskId, treeId, done) => {
    await markComplete(taskId, treeId, done);
    if (done) {
      set({ completed: { ...get().completed, [taskId]: true } });
    } else {
      const next = { ...get().completed };
      delete next[taskId];
      set({ completed: next });
    }
  },

  addCustomTask: async (input, treeId) => {
    const id = await addCustomTask(input, treeId);
    // Reload to get fresh state
    // For simplicity, just return the id; caller should reload
    return id;
  },

  deleteCustomTask: async (taskId, treeId) => {
    const ok = await deleteCustomTask(taskId, treeId);
    if (ok) {
      const tasks = get().tasks.filter(t => t.id !== taskId);
      const completed = { ...get().completed };
      delete completed[taskId];
      set({ tasks, completed });
    }
    return ok;
  },

  decomposeTask: async (taskId, treeId, subs) => {
    const ids = await decomposeTask(taskId, treeId, subs);
    return ids;
  },

  isCompleted: (taskId) => get().completed[taskId] || false,

  isUnlocked: (taskId) => isUnlocked(taskId, get().tasks),

  getAvailable: (category) => getAvailableTasks(get().tasks, category),

  getLocked: (category) => getLockedTasks(get().tasks, category),

  getContextSummary: async () => getContextSummary(get().tasks),

  getStats: () => {
    const { tasks } = get();
    const total = tasks.length;
    let done = 0;
    let unlocked = 0;
    const byCat: Record<string, TaskStats['by_category'][string]> = {};

    for (const t of tasks) {
      if (!byCat[t.category]) {
        byCat[t.category] = { total: 0, done: 0, unlocked: 0, locked: 0 };
      }
      byCat[t.category].total++;
      if (get().completed[t.id]) {
        byCat[t.category].done++;
        done++;
      } else if (isUnlocked(t.id, tasks)) {
        byCat[t.category].unlocked++;
        unlocked++;
      } else {
        byCat[t.category].locked++;
      }
    }

    return {
      total,
      done,
      unlocked,
      locked: total - done - unlocked,
      by_category: byCat,
    };
  },

  getTaskWithMeta: async (taskId, treeId) => {
    const task = get().tasks.find(t => t.id === taskId);
    if (!task) return null;
    const adj = await getTaskAdjustedEstimate(taskId, treeId, task.minutes);
    return {
      ...task,
      completed: get().completed[taskId] || false,
      unlocked: isUnlocked(taskId, get().tasks),
      adjusted_minutes: adj,
      triggered: false,
    };
  },
}));
