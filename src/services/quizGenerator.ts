import { getApiKey } from './configService';
import { getConfig } from '../db/repositories/configRepo';
import { Task } from '../types/task';
import { getDetail } from './knowledgeStore';

const QUIZ_PROMPT = `你是考研11408命题专家。根据提供的已完成学习任务，生成一道综合测验题。

要求：
1. 题目要有深度，考察理解而非记忆
2. 如果涉及多个知识点，要体现它们之间的联系
3. 题型多样：可以是计算题、证明题、简答题、概念辨析题
4. 给出题目后，简要标注考察的知识点（1-2句话）
5. 不要直接给出完整答案，而是给出"提示"引导用户思考

严格按此 JSON 格式回复：
\`\`\`json
{"question": "题目内容", "hint": "解题提示", "topics": "考察的知识点说明"}
\`\`\``;

interface QuizResult {
  question: string;
  hint: string;
  topics: string;
  sourceTasks: { id: string; title: string }[];
}

export async function generateQuiz(
  completedTasks: Task[],
  treeId: string,
): Promise<QuizResult | null> {
  const apiKey = await getApiKey();
  if (!apiKey) return null;

  // Pick 2-3 random tasks
  const shuffled = [...completedTasks].sort(() => Math.random() - 0.5);
  const selected = shuffled.slice(0, Math.min(3, shuffled.length));
  if (selected.length === 0) return null;

  // Fetch knowledge details for selected tasks
  let taskInfo = '';
  for (const t of selected) {
    const detail = await getDetail(t.id, treeId);
    taskInfo += `【任务】${t.title}\n`;
    taskInfo += `  分类: ${t.category} / ${t.module} / ${t.chapter}\n`;
    taskInfo += `  知识详情: ${detail.detail || '(无)'}\n\n`;
  }

  const model = await getConfig('model') || 'deepseek-v4-flash';
  const baseUrl = await getConfig('base_url') || 'https://api.deepseek.com/v1/chat/completions';

  const body = JSON.stringify({
    model,
    thinking_mode: 'thinking',
    temperature: 1.0,
    top_p: 1.0,
    max_tokens: 4096,
    messages: [
      { role: 'system', content: QUIZ_PROMPT },
      { role: 'user', content: `以下已掌握的知识点：\n\n${taskInfo}\n\n请生成一道综合测验题。` },
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
    return parseQuizResponse(content, selected);
  } catch {
    return null;
  }
}

function parseQuizResponse(raw: string, sourceTasks: Task[]): QuizResult {
  try {
    let json = raw;
    if (json.includes('```json')) {
      json = json.split('```json')[1].split('```')[0];
    } else if (json.includes('```')) {
      json = json.split('```')[1].split('```')[0];
    }
    const parsed = JSON.parse(json.trim());
    return {
      question: parsed.question || '生成失败',
      hint: parsed.hint || '',
      topics: parsed.topics || '',
      sourceTasks: sourceTasks.map(t => ({ id: t.id, title: t.title })),
    };
  } catch {
    return {
      question: raw.slice(0, 500),
      hint: '',
      topics: '',
      sourceTasks: sourceTasks.map(t => ({ id: t.id, title: t.title })),
    };
  }
}
