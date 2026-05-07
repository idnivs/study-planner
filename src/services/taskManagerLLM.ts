import { getApiKey } from './configService';
import { getConfig } from '../db/repositories/configRepo';
import { useTaskStore } from '../stores/useTaskStore';
import { useTreeStore } from '../stores/useTreeStore';
import { useConfigStore } from '../stores/useConfigStore';

const SYSTEM_PROMPT = `你是考研学习计划管理助手。你可以帮用户管理任务树（添加、删除、修改任务）。

当前系统中的任务树和类别：
{TREE_INFO}

用户可以通过对话让你执行以下操作：
- list: 列出任务
- add_task: 添加自定义任务 (需要: title, category, module, chapter, minutes, tree_id, priority, prerequisites)
- delete_task: 删除自定义任务 (需要: task_id, tree_id)
- decompose_task: 分解任务为子任务 (需要: task_id, tree_id)
- reply: 纯文本回复

你可以列出任务供用户参考，帮助用户管理学习计划。

严格按此 JSON 格式回复（不要额外文字）：
\`\`\`json
{"actions": [{"type": "reply", "message": "..."}, ...]}
\`\`\`

或者包含具体操作：
\`\`\`json
{"actions": [
  {"type": "reply", "message": "好的，我来帮你添加这个任务..."},
  {"type": "add_task", "title": "...", "category": "...", "module": "...", "chapter": "...", "minutes": 30, "tree_id": "11408", "priority": 5}
]}
\`\`\`

注意：tree_id 默认使用用户当前活跃的知识树。category 必须是已存在的类别之一。`;

interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
}

export interface TaskAction {
  type: 'reply' | 'list' | 'add_task' | 'delete_task' | 'decompose_task';
  message?: string;
  title?: string;
  task_id?: string;
  tree_id?: string;
  category?: string;
  module?: string;
  chapter?: string;
  minutes?: number;
  priority?: number;
}

async function buildTreeInfo(): Promise<string> {
  const trees = useTreeStore.getState().trees;
  const categories = useTreeStore.getState().categories;
  const tasks = useTaskStore.getState().tasks;
  const activeTrees = useConfigStore.getState().active_trees;

  let info = '';
  for (const t of trees) {
    if (!activeTrees.includes(t.id)) continue;
    info += `知识树: ${t.name} (id: ${t.id})\n`;
    const catNames = categories.filter(c => c.tree_id === t.id).map(c => c.name);
    info += `  类别: ${catNames.join(', ')}\n`;
    const treeTasks = tasks.filter(tk => tk.tree_id === t.id);
    info += `  任务数: ${treeTasks.length}\n`;
    info += `  最近任务示例:\n`;
    for (const tk of treeTasks.slice(-10)) {
      info += `    - [${tk.id}] ${tk.title} | ${tk.category}/${tk.module}/${tk.chapter} | ${tk.minutes}min | 优先级${tk.priority}\n`;
    }
  }
  return info || '暂无活跃知识树';
}

function parseResponse(raw: string): TaskAction[] {
  try {
    let json = raw;
    if (json.includes('```json')) {
      json = json.split('```json')[1].split('```')[0];
    } else if (json.includes('```')) {
      json = json.split('```')[1].split('```')[0];
    }
    return JSON.parse(json.trim()).actions || [];
  } catch {
    return [{ type: 'reply', message: raw.slice(0, 500) }];
  }
}

export async function taskManagerChat(
  chatHistory: ChatMessage[],
  userMsg: string
): Promise<TaskAction[]> {
  const apiKey = await getApiKey();
  if (!apiKey) {
    return [{ type: 'reply', message: '请先配置 API Key。' }];
  }

  const treeInfo = await buildTreeInfo();
  const model = await getConfig('model') || 'deepseek-v4-flash';
  const baseUrl = await getConfig('base_url') || 'https://api.deepseek.com/v1/chat/completions';

  const messages: { role: string; content: string }[] = [
    { role: 'system', content: SYSTEM_PROMPT.replace('{TREE_INFO}', treeInfo) },
  ];

  for (const h of chatHistory.slice(-20)) {
    messages.push(h);
  }
  messages.push({ role: 'user', content: userMsg });

  const body = JSON.stringify({
    model,
    thinking_mode: 'thinking',
    temperature: 0.7,
    max_tokens: 4096,
    messages,
  });

  try {
    const resp = await fetch(baseUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
      },
      body,
    });
    const data = await resp.json();
    const content = data?.choices?.[0]?.message?.content || '';
    return parseResponse(content);
  } catch (e: any) {
    return [{ type: 'reply', message: `请求失败：${e.message}` }];
  }
}
