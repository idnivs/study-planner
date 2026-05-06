import { LLMAction } from '../types/llm';
import { getApiKey } from './configService';
import { getConfig } from '../db/repositories/configRepo';

const SYSTEM_PROMPT = `你是学习计划管理助手。可执行以下操作：
1. add_task — 添加任务：{category, module, chapter, title, minutes, priority(1-5), prerequisites(string[])}
2. update_task — 修改任务：{task_id, changes: {...}}
3. delete_task — 删除自定义任务：{task_id}
4. mark_complete / mark_incomplete — 标记完成/未完成：{task_ids: string[]}
5. decompose_task — 分解：{task_id, subtasks: string[]}
6. adjust_plan — 调整今日计划偏好：{preferences: string}
7. reply — 纯文本回复
严格按此 JSON 格式回复（不要额外文字）：
\`\`\`json
{"actions": [{"type": "...", ...}]}
\`\`\``;

function parseResponse(raw: string): LLMAction[] {
  try {
    let json = raw;
    if (json.includes('```json')) {
      json = json.split('```json')[1].split('```')[0];
    } else if (json.includes('```')) {
      json = json.split('```')[1].split('```')[0];
    }
    return JSON.parse(json.trim()).actions || [];
  } catch {
    return [{ type: 'reply', message: `解析错误：${raw.slice(0, 200)}` }];
  }
}

export async function chat(
  userMsg: string, context: string
): Promise<LLMAction[]> {
  const apiKey = await getApiKey();
  if (!apiKey) {
    return [{ type: 'reply', message: '请先配置 API Key。' }];
  }

  const model = await getConfig('model') || 'deepseek-v4-flash';
  const thinkingMode = await getConfig('thinking_mode') || 'non-thinking';
  const temperature = parseFloat(await getConfig('temperature') || '1.0');
  const maxTokens = parseInt(await getConfig('max_tokens') || '2048', 10);
  const baseUrl = await getConfig('base_url') || 'https://api.deepseek.com/v1/chat/completions';

  const body = JSON.stringify({
    model,
    thinking_mode: thinkingMode,
    temperature,
    top_p: 1.0,
    max_tokens: maxTokens,
    messages: [
      { role: 'system', content: SYSTEM_PROMPT },
      { role: 'user', content: `任务库概况：\n${context}\n\n用户请求：${userMsg}` },
    ],
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
    return [{ type: 'reply', message: `LLM 错误：${e.message}` }];
  }
}
