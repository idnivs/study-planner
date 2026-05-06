import { Task, TaskWithMeta } from '../types/task';
import { Category } from '../types/tree';
import { getAvailableTasks, shouldTrigger, isCompleted } from './taskManager';
import { getTaskAdjustedEstimate } from './timeTracker';

export interface PlanItem extends Task {
  _adjusted_minutes: number;
  _triggered: boolean;
}

export interface PlanResult {
  [category: string]: PlanItem[];
}

export function generatePlan(
  tasks: Task[],
  categories: Category[],
  preferences: string = '',
  seed?: number
): PlanResult {
  const rng = seed !== undefined ? seededRandom(seed) : Math.random;

  const plan: PlanResult = {};

  for (const cat of categories) {
    const budget = cat.daily_budget_min;
    plan[cat.name] = sample(cat.name, budget, tasks, preferences, rng);
  }

  return plan;
}

function sample(
  category: string,
  budget: number,
  allTasks: Task[],
  preferences: string,
  rng: () => number
): PlanItem[] {
  const selected: PlanItem[] = [];
  let total = 0;
  const triggeredIds = new Set<string>();

  // Step 1: triggered tasks first
  const triggered = getAvailableTasks(allTasks, category).filter(t => shouldTrigger(t));
  for (const t of triggered) {
    const adjMin = t.minutes; // will be replaced with adjusted estimate
    if (total + adjMin <= budget) {
      selected.push({ ...t, _adjusted_minutes: adjMin, _triggered: true });
      total += adjMin;
      triggeredIds.add(t.id);
    }
  }

  // Step 2: random weighted sampling
  const remaining = budget - total;
  if (remaining < 5) {
    selected.sort((a, b) => (a.module + a.chapter + a.id).localeCompare(b.module + b.chapter + b.id));
    return selected;
  }

  const candidates = getAvailableTasks(allTasks, category).filter(
    t => !triggeredIds.has(t.id)
  );
  if (candidates.length === 0) {
    selected.sort((a, b) => (a.module + a.chapter + a.id).localeCompare(b.module + b.chapter + b.id));
    return selected;
  }

  // weighted by priority^2, with preference boosts
  const weighted: PlanItem[] = [];
  for (const t of candidates) {
    let w = Math.pow(t.priority, 2);
    if (preferences) {
      if (t.chapter && preferences.includes(t.chapter)) w *= 3;
      if (t.module && preferences.includes(t.module)) w *= 2;
    }
    for (let i = 0; i < w; i++) {
      weighted.push({ ...t, _adjusted_minutes: t.minutes, _triggered: false });
    }
  }

  // Fisher-Yates shuffle with provided rng
  for (let i = weighted.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [weighted[i], weighted[j]] = [weighted[j], weighted[i]];
  }

  // deduplicate while preserving order
  const seen = new Set<string>();
  const shuffled: PlanItem[] = [];
  for (const t of weighted) {
    if (!seen.has(t.id)) {
      seen.add(t.id);
      shuffled.push(t);
    }
  }

  for (const t of shuffled) {
    const adjMin = t.minutes;
    if (total + adjMin <= budget) {
      selected.push(t);
      total += adjMin;
    } else if (total >= budget * 0.85) {
      break;
    }
  }

  selected.sort((a, b) => (a.module + a.chapter + a.id).localeCompare(b.module + b.chapter + b.id));
  return selected;
}

function seededRandom(seed: number): () => number {
  let s = seed;
  return () => {
    s = (s * 16807 + 0) % 2147483647;
    return (s - 1) / 2147483646;
  };
}

export async function generatePlanWithEstimates(
  tasks: Task[],
  categories: Category[],
  preferences: string = '',
  seed?: number
): Promise<PlanResult> {
  const plan = generatePlan(tasks, categories, preferences, seed);

  // Replace static minutes with adjusted estimates
  for (const cat of Object.keys(plan)) {
    for (let i = 0; i < plan[cat].length; i++) {
      const t = plan[cat][i];
      const task = tasks.find(tk => tk.id === t.id);
      if (task) {
        const adj = await getTaskAdjustedEstimate(t.id, t.tree_id, t.minutes);
        plan[cat][i]._adjusted_minutes = adj;
      }
    }
  }

  return plan;
}
