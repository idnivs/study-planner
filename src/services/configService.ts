import * as SecureStore from 'expo-secure-store';
import { getConfig, setConfig, getAllConfig } from '../db/repositories/configRepo';
import { AppConfig, DEFAULT_CONFIG } from '../types/config';

const API_KEY_KEY = 'api_key';

export async function loadConfig(): Promise<AppConfig> {
  const raw = await getAllConfig();
  const apiKey = (await SecureStore.getItemAsync(API_KEY_KEY)) || '';

  return {
    api_key: apiKey,
    model: raw.model || DEFAULT_CONFIG.model,
    thinking_mode: (raw.thinking_mode || DEFAULT_CONFIG.thinking_mode) as AppConfig['thinking_mode'],
    temperature: parseFloat(raw.temperature || String(DEFAULT_CONFIG.temperature)),
    max_tokens: parseInt(raw.max_tokens || String(DEFAULT_CONFIG.max_tokens), 10),
    base_url: raw.base_url || DEFAULT_CONFIG.base_url,
    active_trees: JSON.parse(raw.active_trees || JSON.stringify(DEFAULT_CONFIG.active_trees)),
    llm_enabled: raw.llm_enabled === 'true' || !!apiKey,
    countdown_date: raw.countdown_date || DEFAULT_CONFIG.countdown_date,
    countdown_label: raw.countdown_label || DEFAULT_CONFIG.countdown_label,
    notify_enabled: raw.notify_enabled === 'true',
    notify_time: raw.notify_time || DEFAULT_CONFIG.notify_time,
  };
}

export async function saveApiKey(key: string): Promise<void> {
  await SecureStore.setItemAsync(API_KEY_KEY, key);
  await setConfig('llm_enabled', key ? 'true' : 'false');
}

export async function getApiKey(): Promise<string> {
  const key = await SecureStore.getItemAsync(API_KEY_KEY);
  return key || '';
}

export async function saveModel(model: string): Promise<void> {
  await setConfig('model', model);
}

export async function saveThinkingMode(mode: string): Promise<void> {
  await setConfig('thinking_mode', mode);
}

export async function saveActiveTrees(treeIds: string[]): Promise<void> {
  await setConfig('active_trees', JSON.stringify(treeIds));
}

export async function saveCountdown(date: string, label: string): Promise<void> {
  await setConfig('countdown_date', date);
  await setConfig('countdown_label', label);
}

export async function saveNotificationConfig(enabled: boolean, time: string): Promise<void> {
  await setConfig('notify_enabled', enabled ? 'true' : 'false');
  await setConfig('notify_time', time);
}

export async function toggleTree(treeId: string, currentActive: string[]): Promise<string[]> {
  let trees = [...currentActive];
  if (trees.includes(treeId)) {
    if (trees.length > 1) {
      trees = trees.filter(t => t !== treeId);
    }
  } else {
    trees.push(treeId);
  }
  await saveActiveTrees(trees);
  return trees;
}
