import { create } from 'zustand';
import { TreeMeta, Category } from '../types/tree';
import { getAllTrees, getCategories } from '../db/repositories/treeRepo';

interface TreeState {
  trees: TreeMeta[];
  categories: Category[];
  loading: boolean;
  load: (activeTreeIds: string[]) => Promise<void>;
}

export const useTreeStore = create<TreeState>((set) => ({
  trees: [],
  categories: [],
  loading: false,

  load: async (activeTreeIds: string[]) => {
    set({ loading: true });
    const [trees, categories] = await Promise.all([
      getAllTrees(),
      getCategories(activeTreeIds),
    ]);
    set({ trees, categories, loading: false });
  },
}));
