export type ThinkingMode = 'non-thinking' | 'thinking' | 'thinking_max';

export interface AppConfig {
  api_key: string;
  model: string;
  thinking_mode: ThinkingMode;
  temperature: number;
  max_tokens: number;
  base_url: string;
  active_trees: string[];
  llm_enabled: boolean;
}

export const DEFAULT_CONFIG: Omit<AppConfig, 'api_key'> = {
  model: 'deepseek-v4-flash',
  thinking_mode: 'non-thinking',
  temperature: 1.0,
  max_tokens: 2048,
  base_url: 'https://api.deepseek.com/v1/chat/completions',
  active_trees: ['11408'],
  llm_enabled: false,
};
