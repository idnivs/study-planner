import {
  getKnowledgeDetail, saveKnowledgeDetail,
  getReferences, addReference, updateReference,
  removeReference, getReferenceById,
} from '../db/repositories/knowledgeRepo';
import { KnowledgeDetail, KnowledgeReference } from '../types/knowledge';

export async function getDetail(
  taskId: string, treeId: string
): Promise<{ detail: string; references: KnowledgeReference[]; lastUpdated: string }> {
  const detail = await getKnowledgeDetail(taskId, treeId);
  const references = await getReferences(taskId, treeId);
  return {
    detail: detail?.detail || '',
    references,
    lastUpdated: detail?.last_updated || '',
  };
}

export async function saveDetail(
  taskId: string, treeId: string, detail: string
): Promise<void> {
  await saveKnowledgeDetail(taskId, treeId, detail);
}

export async function addRef(
  taskId: string, treeId: string,
  title: string, url: string, note: string
): Promise<number> {
  return addReference(taskId, treeId, title, url, note);
}

export async function updateRef(
  refId: number, title: string, url: string, note: string
): Promise<void> {
  await updateReference(refId, title, url, note);
}

export async function removeRef(refId: number): Promise<void> {
  await removeReference(refId);
}

export async function getRefById(refId: number): Promise<KnowledgeReference | null> {
  return getReferenceById(refId);
}
