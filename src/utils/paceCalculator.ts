import { Task } from '../types/task';

export interface PaceResult {
  done: number;
  total: number;
  pct: number;
  expectedPct: number;
  status: 'ahead' | 'behind' | 'on_track';
  label: string;
}

export function calcCategoryPace(
  tasks: Task[],
  doneCount: number,
  countdownDate?: string,
): PaceResult {
  const total = tasks.length;
  const pct = total > 0 ? doneCount / total : 0;
  const expectedPct = calcExpectedPct(countdownDate);

  const diff = pct - expectedPct;
  let status: PaceResult['status'] = 'on_track';
  let label = '进度正常';

  if (diff >= 0.05) {
    status = 'ahead';
    const days = Math.round(diff * (total > 0 ? total : 1));
    label = `超前约 ${Math.max(1, Math.abs(days))} 个任务`;
  } else if (diff <= -0.05) {
    status = 'behind';
    const days = Math.round(Math.abs(diff) * (total > 0 ? total : 1));
    label = `落后约 ${Math.max(1, Math.abs(days))} 个任务`;
  }

  return { done: doneCount, total, pct, expectedPct, status, label };
}

function calcExpectedPct(countdownDate?: string): number {
  if (!countdownDate) return 0;
  const target = new Date(countdownDate);
  const now = new Date();

  // Assume started 3 months before target, or now if less
  const start = new Date(target);
  start.setMonth(start.getMonth() - 6);
  if (start > now) return 0;

  const totalDays = target.getTime() - start.getTime();
  const elapsedDays = now.getTime() - start.getTime();

  if (totalDays <= 0 || elapsedDays <= 0) return 0;
  return Math.min(1, elapsedDays / totalDays);
}
