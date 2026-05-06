import { create } from 'zustand';
import { KnowledgeReference, ChatMessage } from '../types/knowledge';
import { LLMAction } from '../types/llm';
import { getDetail, saveDetail, addRef, updateRef, removeRef } from '../services/knowledgeStore';
import { knowledgeChat } from '../services/knowledgeLLM';

interface KnowledgeState {
  taskId: string;
  treeId: string;
  taskTitle: string;
  category: string;
  module: string;
  chapter: string;
  detail: string;
  references: KnowledgeReference[];
  chatHistory: ChatMessage[];
  lastUpdated: string;
  loading: boolean;
  sending: boolean;

  load: (taskId: string, treeId: string, taskTitle: string, category: string, module: string, chapter: string) => Promise<void>;
  saveDetail: (detail: string) => Promise<void>;
  addReference: (title: string, url: string, note: string) => Promise<void>;
  updateReference: (refId: number, title: string, url: string, note: string) => Promise<void>;
  removeReference: (refId: number) => Promise<void>;
  sendMessage: (message: string) => Promise<LLMAction[]>;
  clearChat: () => void;
}

export const useKnowledgeStore = create<KnowledgeState>((set, get) => ({
  taskId: '',
  treeId: '',
  taskTitle: '',
  category: '',
  module: '',
  chapter: '',
  detail: '',
  references: [],
  chatHistory: [],
  lastUpdated: '',
  loading: false,
  sending: false,

  load: async (taskId, treeId, taskTitle, category, module, chapter) => {
    set({ loading: true, taskId, treeId, taskTitle, category, module, chapter });
    const data = await getDetail(taskId, treeId);
    set({
      detail: data.detail,
      references: data.references,
      lastUpdated: data.lastUpdated,
      chatHistory: [],
      loading: false,
    });
  },

  saveDetail: async (detail) => {
    const { taskId, treeId } = get();
    await saveDetail(taskId, treeId, detail);
    set({ detail, lastUpdated: new Date().toISOString() });
  },

  addReference: async (title, url, note) => {
    const { taskId, treeId } = get();
    await addRef(taskId, treeId, title, url, note);
    const data = await getDetail(taskId, treeId);
    set({ references: data.references });
  },

  updateReference: async (refId, title, url, note) => {
    await updateRef(refId, title, url, note);
    const { taskId, treeId } = get();
    const data = await getDetail(taskId, treeId);
    set({ references: data.references });
  },

  removeReference: async (refId) => {
    await removeRef(refId);
    const { taskId, treeId } = get();
    const data = await getDetail(taskId, treeId);
    set({ references: data.references });
  },

  sendMessage: async (message) => {
    const { taskId, treeId, taskTitle, category, module, chapter, detail, references, chatHistory } = get();
    set({ sending: true });

    const ctx = { taskId, taskTitle, category, module, chapter, detail, references };
    const actions = await knowledgeChat(ctx, chatHistory, message);

    const newHistory = [...chatHistory, { role: 'user' as const, content: message }];

    // Process reply actions to add to chat history
    for (const a of actions) {
      if (a.type === 'reply' && a.message) {
        newHistory.push({ role: 'assistant' as const, content: a.message });
      } else if (a.type === 'update_detail' && a.content) {
        newHistory.push({ role: 'assistant' as const, content: `[已更新知识详情]\n${a.content.slice(0, 200)}...` });
      } else if (a.type === 'add_reference' && a.title) {
        newHistory.push({ role: 'assistant' as const, content: `[已添加参考资料] ${a.title}` });
      } else if (a.type === 'remove_reference') {
        newHistory.push({ role: 'assistant' as const, content: `[已删除参考资料 #${a.index}]` });
      }
    }

    set({ chatHistory: newHistory, sending: false });
    return actions;
  },

  clearChat: () => set({ chatHistory: [] }),
}));
