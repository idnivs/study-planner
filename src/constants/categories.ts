import { CategoryStyle } from '../types/tree';

export const CAT_STYLE: Record<string, CategoryStyle> = {
  '数学': { color: '#6366f1', bg: '#eef2ff', icon: '📐' },
  '408': { color: '#10b981', bg: '#ecfdf5', icon: '💻' },
  '英语': { color: '#f59e0b', bg: '#fffbeb', icon: '📝' },
  '运动': { color: '#ec4899', bg: '#fdf2f8', icon: '🏃' },
  '复盘': { color: '#8b5cf6', bg: '#f5f3ff', icon: '📋' },
};

export function getCatStyle(category: string): CategoryStyle {
  return CAT_STYLE[category] || { color: '#6366f1', bg: '#eef2ff', icon: '📚' };
}
