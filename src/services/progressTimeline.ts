import { Task } from '../types/task';
import { Category } from '../types/tree';

export interface Milestone {
  month: string;       // e.g. "6月"
  monthKey: string;    // e.g. "2026-06"
  targetDone: number;  // target cumulative tasks done
  targetPct: number;   // target cumulative percentage
  phase: string;       // phase label
}

export function calcProgressTimeline(
  tasks: Task[],
  categories: Category[],
  completed: Record<string, boolean>,
  countdownDate?: string,
): { milestones: Milestone[]; totalDays: number; dailyBudget: number } {
  const now = new Date();
  const remaining = tasks.filter(t => !completed[t.id]);
  const totalRemainingMin = remaining.reduce((s, t) => s + t.minutes, 0);
  const totalTasks = tasks.length;
  const doneCount = totalTasks - remaining.length;

  // Calculate total daily budget from categories
  const dailyBudget = categories.reduce((s, c) => s + (c.daily_budget_min || 0), 0) || 120;

  // Days needed to finish
  const totalDays = dailyBudget > 0 ? Math.ceil(totalRemainingMin / dailyBudget) : 0;

  // If no countdown date, use projection from now + totalDays
  const endDate = countdownDate
    ? new Date(countdownDate)
    : new Date(now.getTime() + totalDays * 86400000);

  const monthsDiff = monthDiff(now, endDate);
  if (monthsDiff <= 0) return { milestones: [], totalDays, dailyBudget };

  // Generate monthly milestones
  const milestones: Milestone[] = [];
  for (let i = 1; i <= Math.min(monthsDiff, 12); i++) {
    const milestoneDate = new Date(now.getFullYear(), now.getMonth() + i, 1);
    const monthLabel = `${milestoneDate.getMonth() + 1}月`;
    const monthKey = `${milestoneDate.getFullYear()}-${String(milestoneDate.getMonth() + 1).padStart(2, '0')}`;

    // Linear projection: each month should complete ~1/monthsDiff of remaining
    const progressRatio = i / monthsDiff;
    const targetDone = Math.min(totalTasks, doneCount + Math.round(remaining.length * progressRatio));
    const targetPct = Math.round((targetDone / totalTasks) * 100);

    let phase = '';
    if (progressRatio <= 0.35) phase = '基础阶段';
    else if (progressRatio <= 0.65) phase = '强化阶段';
    else if (progressRatio <= 0.85) phase = '冲刺阶段';
    else phase = '查漏补缺';

    milestones.push({
      month: monthLabel,
      monthKey,
      targetDone,
      targetPct,
      phase,
    });
  }

  return { milestones, totalDays, dailyBudget };
}

function monthDiff(a: Date, b: Date): number {
  return (b.getFullYear() - a.getFullYear()) * 12 + (b.getMonth() - a.getMonth());
}
