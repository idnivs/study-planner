import {
  getTasksByTrees, getTask, addCustomTask as addTaskToDb,
  deleteCustomTask as deleteTaskFromDb, updateTask,
  getPrerequisites, addPrerequisite, getSubtasks, addSubtasks,
} from '../db/repositories/taskRepo';
import {
  getCompletedByTree, setCompleted, resetAllProgress,
} from '../db/repositories/progressRepo';
import { Task, TaskWithMeta, CustomTaskInput } from '../types/task';
import { getTaskAdjustedEstimate, getTaskStats } from './timeTracker';

let cachedCompleted: Record<string, boolean> = {};

export function clearCache() {
  cachedCompleted = {};
}

export async function loadTasks(treeIds: string[]): Promise<{
  tasks: Task[];
  completed: Record<string, boolean>;
}> {
  const tasks = await getTasksByTrees(treeIds);
  cachedCompleted = await getCompletedByTree(treeIds);
  return { tasks, completed: { ...cachedCompleted } };
}

export function isCompleted(taskId: string): boolean {
  return cachedCompleted[taskId] || false;
}

export function isUnlocked(taskId: string, tasks: Task[]): boolean {
  const task = tasks.find(t => t.id === taskId);
  if (!task) return false;

  const prereqIds = task.prerequisites;
  if (!prereqIds || prereqIds.length === 0) return true;

  return prereqIds.every(pid => isCompleted(pid));
}

export async function markComplete(
  taskId: string, treeId: string, done: boolean
): Promise<void> {
  await setCompleted(taskId, treeId, done);
  if (done) {
    cachedCompleted[taskId] = true;
  } else {
    delete cachedCompleted[taskId];
  }
}

export async function addCustomTask(
  input: CustomTaskInput, treeId: string
): Promise<string> {
  const tasks = await getTasksByTrees([treeId]);
  const existingIds = new Set(tasks.map(t => t.id));

  let idx = 1;
  while (existingIds.has(`CUSTOM-${String(idx).padStart(4, '0')}`)) {
    idx++;
  }

  const id = `CUSTOM-${String(idx).padStart(4, '0')}`;
  const task: Task = {
    id,
    tree_id: treeId,
    category: input.category,
    module: input.module || '',
    chapter: input.chapter || '',
    title: input.title,
    minutes: input.minutes,
    priority: input.priority || 3,
    decomposable: false,
    trigger_type: null,
    is_custom: true,
    created_at: new Date().toISOString(),
  };

  await addTaskToDb(task);

  if (input.prerequisites) {
    for (const prereqId of input.prerequisites) {
      await addPrerequisite(id, treeId, prereqId);
    }
  }

  return id;
}

export async function deleteCustomTask(
  taskId: string, treeId: string
): Promise<boolean> {
  if (!taskId.startsWith('CUSTOM-')) return false;
  await deleteTaskFromDb(taskId, treeId);
  delete cachedCompleted[taskId];
  return true;
}

export async function decomposeTask(
  taskId: string, treeId: string, subtaskDescs?: string[]
): Promise<string[]> {
  const task = await getTask(taskId, treeId);
  if (!task) return [];

  const descriptions = subtaskDescs || await getSubtasks(taskId, treeId);
  if (descriptions.length === 0) return [];

  const tasks = await getTasksByTrees([treeId]);
  const existingIds = new Set(tasks.map(t => t.id));

  const newTasks: string[] = [];
  for (let i = 0; i < descriptions.length; i++) {
    const nid = `${taskId}-${String(i + 1).padStart(2, '0')}`;
    if (existingIds.has(nid)) continue;

    const nt: Task = {
      id: nid,
      tree_id: treeId,
      category: task.category,
      module: task.module,
      chapter: task.chapter,
      title: `[分解] ${descriptions[i]}`,
      minutes: Math.max(15, Math.floor(task.minutes / descriptions.length)),
      priority: task.priority,
      decomposable: false,
      trigger_type: null,
      is_custom: true,
      created_at: new Date().toISOString(),
    };

    await addTaskToDb(nt);
    await addPrerequisite(nid, treeId, taskId);
    newTasks.push(nid);
  }

  return newTasks;
}

export function getAvailableTasks(tasks: Task[], category?: string): Task[] {
  return tasks.filter(t =>
    !isCompleted(t.id) &&
    isUnlocked(t.id, tasks) &&
    (!category || t.category === category)
  );
}

export function getLockedTasks(tasks: Task[], category?: string): Task[] {
  return tasks.filter(t =>
    !isCompleted(t.id) &&
    !isUnlocked(t.id, tasks) &&
    (!category || t.category === category)
  );
}

export function shouldTrigger(
  task: Task, today: Date = new Date()
): boolean {
  const trigger = task.trigger_type;
  if (!trigger) return false;

  if (trigger === 'daily') return true;

  if (trigger.startsWith('weekly,')) {
    const day = parseInt(trigger.split(',')[1], 10);
    // 0=Mon, 6=Sun in Python; JS getDay() 0=Sun, so convert
    const jsDow = today.getDay();
    const pyDow = jsDow === 0 ? 6 : jsDow - 1;
    return pyDow === day;
  }

  if (trigger.startsWith('monthly,')) {
    const dom = parseInt(trigger.split(',')[1], 10);
    return today.getDate() === dom;
  }

  return false;
}

export async function getTaskWithMeta(
  task: Task, treeId: string
): Promise<TaskWithMeta> {
  const adj = await getTaskAdjustedEstimate(task.id, treeId, task.minutes);
  return {
    ...task,
    completed: isCompleted(task.id),
    unlocked: isUnlocked(task.id, [task]),
    adjusted_minutes: adj,
    triggered: shouldTrigger(task),
  };
}

export async function getContextSummary(tasks: Task[]): Promise<string> {
  const total = tasks.length;
  const done = tasks.filter(t => isCompleted(t.id)).length;
  const unlocked = tasks.filter(t => isUnlocked(t.id, tasks) && !isCompleted(t.id)).length;
  const locked = total - done - unlocked;

  const byCat: Record<string, { total: number; done: number; unlocked: number; locked: number }> = {};
  for (const t of tasks) {
    const cat = t.category;
    if (!byCat[cat]) byCat[cat] = { total: 0, done: 0, unlocked: 0, locked: 0 };
    byCat[cat].total++;
    if (isCompleted(t.id)) byCat[cat].done++;
    else if (isUnlocked(t.id, tasks)) byCat[cat].unlocked++;
    else byCat[cat].locked++;
  }

  let summary = `知识树总任务：${total} 已完成：${done} 可用：${unlocked} 锁定：${locked}`;
  for (const [cat, s] of Object.entries(byCat)) {
    summary += `\n  ${cat}：共${s.total} ✓${s.done} ◉${s.unlocked} 🔒${s.locked}`;
  }
  return summary;
}
