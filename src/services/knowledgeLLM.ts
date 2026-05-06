import { LLMAction } from '../types/llm';
import { ChatMessage, KnowledgeContext } from '../types/knowledge';
import { getApiKey } from './configService';
import { getConfig } from '../db/repositories/configRepo';

const KNOWLEDGE_SYSTEM_PROMPT = `你是考研11408知识答疑助手。你的职责：
1. 解答用户关于当前知识点的任何问题，深入浅出，逻辑清晰
2. 根据讨论内容主动总结、更新知识详情
3. 根据讨论推荐参考资料（书籍章节、视频、文章等）

你可以输出以下操作（可组合）：
- reply: 纯文本答疑回复，message 字段
- update_detail: 将讨论中的要点整理成知识详情，content 字段放完整 markdown 文本
- add_reference: 添加参考资料，需要 title, url, note 三个字段
- remove_reference: 删除参考资料，需要 index 字段（从0开始）

严格按此 JSON 格式回复（不要额外文字）：
\`\`\`json
{"actions": [{"type": "...", ...}]}
\`\`\``;

function buildContext(ctx: KnowledgeContext): string {
  let text = `知识点ID: ${ctx.taskId}\n`;
  text += `标题: ${ctx.taskTitle}\n`;
  text += `分类: ${ctx.category} / ${ctx.module} / ${ctx.chapter}\n`;
  text += `知识详情:\n${ctx.detail || '(暂无)'}\n`;
  text += `参考资料 (${ctx.references.length}条):\n`;
  for (let i = 0; i < ctx.references.length; i++) {
    const r = ctx.references[i];
    text += `  [${i}] ${r.title} | ${r.url} | ${r.note}\n`;
  }
  return text;
}

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

export async function knowledgeChat(
  knowledgeContext: KnowledgeContext,
  chatHistory: ChatMessage[],
  userMsg: string
): Promise<LLMAction[]> {
  const apiKey = await getApiKey();
  if (!apiKey) {
    return [{ type: 'reply', message: '请先配置 API Key。' }];
  }

  const model = await getConfig('model') || 'deepseek-v4-flash';
  const temperature = parseFloat(await getConfig('temperature') || '1.0');
  const maxTokens = parseInt(await getConfig('max_tokens') || '2048', 10);
  const baseUrl = await getConfig('base_url') || 'https://api.deepseek.com/v1/chat/completions';

  const messages: { role: string; content: string }[] = [
    { role: 'system', content: KNOWLEDGE_SYSTEM_PROMPT },
    { role: 'user', content: `当前知识点信息：\n${buildContext(knowledgeContext)}\n\n开始答疑。` },
  ];

  for (const h of chatHistory.slice(-20)) {
    messages.push(h);
  }
  messages.push({ role: 'user', content: userMsg });

  const body = JSON.stringify({
    model,
    thinking_mode: 'thinking',
    temperature,
    top_p: 1.0,
    max_tokens: maxTokens,
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
    return [{ type: 'reply', message: `LLM 错误：${e.message}` }];
  }
}
