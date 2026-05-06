export interface Progress {
  task_id: string;
  tree_id: string;
  completed: boolean;
  completed_at: string | null;
}

export interface TimeRecord {
  id: number;
  task_id: string;
  tree_id: string;
  record_date: string;
  estimated_min: number;
  actual_min: number;
  created_at: string;
}

export interface TaskStats {
  total: number;
  done: number;
  unlocked: number;
  locked: number;
  by_category: Record<string, CategoryStats>;
}

export interface CategoryStats {
  total: number;
  done: number;
  unlocked: number;
  locked: number;
}

export interface TimeStats {
  sessions: number;
  hours: number;
}

export interface TimerState {
  taskId: string;
  taskTitle: string;
  estimatedMin: number;
  running: boolean;
  startTime: number;
  elapsed: number;
}
