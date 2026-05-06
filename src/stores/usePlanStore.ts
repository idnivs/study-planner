import { create } from 'zustand';
import { Task } from '../types/task';
import { Category } from '../types/tree';
import { generatePlan, PlanResult } from '../services/planGenerator';

interface PlanState {
  plan: PlanResult;
  seed: number | undefined;
  preferences: string;
  loading: boolean;
  generate: (tasks: Task[], categories: Category[], seed?: number, preferences?: string) => void;
  setPreferences: (prefs: string) => void;
}

export const usePlanStore = create<PlanState>((set) => ({
  plan: {},
  seed: undefined,
  preferences: '',
  loading: false,

  generate: (tasks, categories, seed?, preferences?) => {
    const prefs = preferences ?? '';
    const plan = generatePlan(tasks, categories, prefs, seed);
    set({ plan, seed, preferences: prefs });
  },

  setPreferences: (prefs) => {
    set({ preferences: prefs });
  },
}));
