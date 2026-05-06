import { Task } from '../types/task';

export interface CategoryTarget {
  category: string;
  done: number;
  total: number;
  pct: number;
  expectedPct: number;
  ahead: boolean;
  behind: boolean;
  targetTask: { title: string; module: string; chapter: string } | null;
}

export function calcMonthlyTargets(
  tasks: Task[],
  completed: Record<string, boolean>,
  countdownDate?: string,
): { month: string; targets: CategoryTarget[] } | null {
  const now = new Date();
  const month = `${now.getMonth() + 1}月`;

  const expectedPct = calcExpectedPct(countdownDate);

  const byCat: Record<string, Task[]> = {};
  for (const t of tasks) {
    if (!byCat[t.category]) byCat[t.category] = [];
    byCat[t.category].push(t);
  }

  const targets: CategoryTarget[] = [];
  for (const [cat, catTasks] of Object.entries(byCat)) {
    const doneCount = catTasks.filter(t => completed[t.id]).length;
    const total = catTasks.length;
    const pct = total > 0 ? doneCount / total : 0;
    const ahead = pct > expectedPct + 0.05;
    const behind = pct < expectedPct - 0.05;

    // Find the reference task: the one at expected progress position
    const targetIdx = Math.min(total - 1, Math.floor(expectedPct * total));
    const targetTask = catTasks[targetIdx] || catTasks[catTasks.length - 1] || null;

    // If there are done tasks ahead of target, find the next undone one
    let refTask: { title: string; module: string; chapter: string } | null = null;
    if (targetTask) {
      refTask = {
        title: targetTask.title,
        module: targetTask.module,
        chapter: targetTask.chapter,
      };
    }

    targets.push({
      category: cat,
      done: doneCount,
      total,
      pct,
      expectedPct,
      ahead,
      behind,
      targetTask: refTask,
    });
  }

  return { month, targets };
}

function calcExpectedPct(countdownDate?: string): number {
  if (!countdownDate) return 0;
  const target = new Date(countdownDate);
  const now = new Date();
  const start = new Date(target);
  start.setMonth(start.getMonth() - 6);
  if (start > now) return 0;
  const totalDays = target.getTime() - start.getTime();
  const elapsedDays = now.getTime() - start.getTime();
  if (totalDays <= 0 || elapsedDays <= 0) return 0;
  return Math.min(1, elapsedDays / totalDays);
}
