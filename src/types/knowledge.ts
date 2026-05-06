export interface KnowledgeDetail {
  task_id: string;
  tree_id: string;
  detail: string;
  last_updated: string;
}

export interface KnowledgeReference {
  id: number;
  task_id: string;
  tree_id: string;
  title: string;
  url: string;
  note: string;
  sort_order: number;
}

export interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
}

export interface KnowledgeContext {
  taskId: string;
  taskTitle: string;
  category: string;
  module: string;
  chapter: string;
  detail: string;
  references: KnowledgeReference[];
}
