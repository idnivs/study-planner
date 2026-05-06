export interface LLMAction {
  type: string;
  message?: string;
  task_id?: string;
  task_ids?: string[];
  task?: Record<string, unknown>;
  changes?: Record<string, unknown>;
  subtasks?: string[];
  preferences?: string;
  content?: string;
  title?: string;
  url?: string;
  note?: string;
  index?: number;
}

export interface LLMResponse {
  actions: LLMAction[];
}
