export interface TreeMeta {
  id: string;
  name: string;
  description: string;
  version: string;
  created_at: string;
  updated_at: string;
}

export interface Category {
  id: number;
  tree_id: string;
  name: string;
  daily_budget_min: number;
  icon: string;
  color: string;
  sort_order: number;
}

export interface CategoryStyle {
  color: string;
  bg: string;
  icon: string;
}
