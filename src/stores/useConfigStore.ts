import { create } from 'zustand';
import { AppConfig, DEFAULT_CONFIG } from '../types/config';
import { loadConfig, saveApiKey, saveModel, saveThinkingMode, saveActiveTrees, toggleTree } from '../services/configService';

interface ConfigState extends AppConfig {
  loading: boolean;
  load: () => Promise<void>;
  setApiKey: (key: string) => Promise<void>;
  setModel: (model: string) => Promise<void>;
  setThinkingMode: (mode: string) => Promise<void>;
  toggleTree: (treeId: string) => Promise<void>;
}

export const useConfigStore = create<ConfigState>((set, get) => ({
  ...DEFAULT_CONFIG,
  api_key: '',
  loading: true,

  load: async () => {
    const config = await loadConfig();
    set({ ...config, loading: false });
  },

  setApiKey: async (key: string) => {
    await saveApiKey(key);
    set({ api_key: key, llm_enabled: !!key });
  },

  setModel: async (model: string) => {
    await saveModel(model);
    set({ model });
  },

  setThinkingMode: async (mode: string) => {
    await saveThinkingMode(mode);
    set({ thinking_mode: mode as AppConfig['thinking_mode'] });
  },

  toggleTree: async (treeId: string) => {
    const active = await toggleTree(treeId, get().active_trees);
    set({ active_trees: active });
  },
}));
