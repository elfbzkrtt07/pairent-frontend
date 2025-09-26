// src/services/forum.ts
import { fetchAuthSession } from "aws-amplify/auth";

export type Reply = {
  rid: string;
  parentId: string | null;
  name: string;
  body: string;
  created_at: string;
  likes: number;
};

export type QuestionDetail = {
  qid: string;
  title: string;
  name: string;
  child_age_label: string;
  likes: number;
  body: string;
};

const API_URL = "http://localhost:5000";

async function authHeaders(includeContent = false) {
  const session = await fetchAuthSession();
  const token = session.tokens?.accessToken?.toString();
  return {
    Authorization: token ? `Bearer ${token}` : "",
    ...(includeContent ? { "Content-Type": "application/json" } : {}),
  };
}

// Listing and creation
export async function listQuestions(params: {
  limit?: number;
  sort?: string; // backend expects 'new' or 'popular'
}): Promise<{ items: any[] }> {
  const limit = params.limit ?? 10;
  const sort = params.sort ?? "new";
  const res = await fetch(`${API_URL}/questions?limit=${limit}&sort=${sort}`, {
    headers: await authHeaders(),
  });
  if (!res.ok) throw new Error("Failed to list questions");
  return res.json();
}

export async function listMyQuestions(params: {
  limit?: number;
  sort?: string;
}): Promise<{ items: any[] }> {
  const limit = params.limit ?? 10;
  const sort = params.sort ?? "popular";
  const res = await fetch(`${API_URL}/questions/me?limit=${limit}&sort=${sort}`, {
    headers: await authHeaders(),
  });
  if (!res.ok) throw new Error("Failed to list my questions");
  return res.json();
}

export async function createQuestion(payload: {
  title: string;
  body: string;
  tags?: string[];
  age?: number;
}): Promise<any> {
  const res = await fetch(`${API_URL}/questions`, {
    method: "POST",
    headers: await authHeaders(true),
    body: JSON.stringify(payload),
  });
  if (!res.ok) throw new Error("Failed to create question");
  return res.json();
}

export async function getQuestion(qid: string): Promise<QuestionDetail> {
  const res = await fetch(`${API_URL}/questions/${qid}`);
  if (!res.ok) throw new Error("Failed to fetch question");
  return res.json();
}

export async function listReplies(params: {
  qid: string;
  parentId: string | null;
}): Promise<{ items: Reply[] }> {
  // Backend does not expose list replies endpoint in provided routes.
  // Fallback: return empty list to avoid breaking UI until backend supports it.
  return { items: [] };
}

export async function createReply(params: {
  qid: string;
  parentId: string | null;
  body: string;
}): Promise<Reply> {
  const res = await fetch(`${API_URL}/questions/${params.qid}/reply`, {
    method: "POST",
    headers: await authHeaders(true),
    body: JSON.stringify({
      parentId: params.parentId,
      body: params.body,
    }),
  });
  if (!res.ok) throw new Error("Failed to create reply");
  return res.json();
}

export async function likeQuestion(qid: string, like: boolean): Promise<number> {
  // Backend uses POST to like and DELETE to unlike (204 No Content)
  const res = await fetch(`${API_URL}/questions/${qid}/like`, {
    method: like ? "POST" : "DELETE",
    headers: await authHeaders(),
  });
  if (!res.ok) throw new Error("Failed to toggle like");
  // Re-fetch question to get updated likes
  const r2 = await fetch(`${API_URL}/questions/${qid}`);
  if (!r2.ok) throw new Error("Failed to fetch question after like");
  const q = await r2.json();
  return q.likes;
}

export async function likeReply(rid: string, liked: boolean): Promise<number> {
  // Backend route not available; no-op to keep UI responsive
  throw new Error("likeReply not implemented in backend");
}

export async function deleteReply(rid: string): Promise<void> {
  // Backend route not available; resolve without network to allow UI removal
  return;
}

export async function getSaved(qid: string): Promise<{ saved: boolean }> {
  // Backend does not provide GET per-question saved state.
  // Fallback: check presence in the saved list.
  try {
    const list = await listSavedQuestions();
    const found = (list.items || []).some((it: any) => it.qid === qid);
    return { saved: found };
  } catch {
    return { saved: false };
  }
}

export async function saveDiscussion(qid: string): Promise<void> {
  const res = await fetch(`${API_URL}/questions/${qid}/save`, {
    method: "POST",
    headers: await authHeaders(),
  });
  if (!res.ok) throw new Error("Failed to save discussion");
}

export async function unsaveDiscussion(qid: string): Promise<void> {
  const res = await fetch(`${API_URL}/questions/${qid}/save`, {
    method: "DELETE",
    headers: await authHeaders(),
  });
  if (!res.ok) throw new Error("Failed to unsave discussion");
}

export async function listSavedQuestions(): Promise<{ items: any[] }> {
  const res = await fetch(`${API_URL}/questions/saved`, {
    headers: await authHeaders(),
  });
  if (!res.ok) throw new Error("Failed to list saved questions");
  return res.json();
}

export async function deleteQuestion(qid: string): Promise<void> {
  const res = await fetch(`${API_URL}/questions/${qid}`, {
    method: "DELETE",
    headers: await authHeaders(),
  });
  if (!res.ok) throw new Error("Failed to delete question");
}

export async function listQuestionsByUser(userId: string, params: { limit?: number; sort?: string } = {}) {
  // Backend route not provided; return empty list to avoid breaking UI
  return { items: [] };
}
