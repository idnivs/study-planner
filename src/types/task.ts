export interface Task {
  id: string;
  tree_id: string;
  category: string;
  module: string;
  chapter: string;
  title: string;
  minutes: number;
  priority: number;
  decomposable: boolean;
  trigger_type: string | null;
  is_custom: boolean;
  prerequisites?: string[];
  created_at: string;
}

export interface TaskWithMeta extends Task {
  completed: boolean;
  unlocked: boolean;
  adjusted_minutes: number;
  triggered: boolean;
}

export interface CustomTaskInput {
  category: string;
  module?: string;
  chapter?: string;
  title: string;
  minutes: number;
  priority?: number;
  prerequisites?: string[];
  tree_id?: string;
}

export interface Prerequisite {
  task_id: string;
  tree_id: string;
  prereq_id: string;
}

export interface SubTask {
  parent_id: string;
  tree_id: string;
  sort_order: number;
  description: string;
}
