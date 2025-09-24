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

export async function getQuestion(qid: string): Promise<QuestionDetail> {
  const res = await fetch(`${API_URL}/questions/${qid}`);
  if (!res.ok) throw new Error("Failed to fetch question");
  return res.json();
}

export async function listReplies(params: {
  qid: string;
  parentId: string | null;
}): Promise<{ items: Reply[] }> {
  //  You’ll need to implement this endpoint in Flask
  const url = params.parentId
    ? `${API_URL}/questions/${params.qid}/replies?parentId=${params.parentId}`
    : `${API_URL}/questions/${params.qid}/replies`;

  const res = await fetch(url, { headers: await authHeaders() });
  if (!res.ok) throw new Error("Failed to fetch replies");
  return res.json();
}

export async function createReply(params: {
  qid: string;
  parentId: string | null;
  body: string;
  name: string;
}): Promise<Reply> {
  const res = await fetch(`${API_URL}/questions/${params.qid}/reply`, {
    method: "POST",
    headers: await authHeaders(true),
    body: JSON.stringify({
      parentId: params.parentId,
      body: params.body,
      name: params.name,
    }),
  });
  if (!res.ok) throw new Error("Failed to create reply");
  return res.json();
}

export async function likeQuestion(qid: string, liked: boolean): Promise<number> {
  const res = await fetch(`${API_URL}/questions/${qid}/like`, {
    method: liked ? "POST" : "DELETE",
    headers: await authHeaders(),
  });
  if (!res.ok) throw new Error("Failed to toggle like");
  // Backend returns 204 No Content, so re-fetch current like count:
  const r2 = await fetch(`${API_URL}/questions/${qid}`);
  if (!r2.ok) throw new Error("Failed to fetch question after like");
  const q = await r2.json();
  return q.likes;
}

export async function likeReply(rid: string, liked: boolean): Promise<number> {
  // Not in backend yet. You’d need /replies/<rid>/like
  throw new Error("likeReply endpoint not implemented in backend");
}

export async function deleteReply(rid: string): Promise<void> {
  // Not in backend yet. You’d need DELETE /replies/<rid>
  throw new Error("deleteReply endpoint not implemented in backend");
}

export async function getSaved(qid: string): Promise<{ saved: boolean }> {
  // Backend has POST save, but no GET
  return { saved: false };
}

export async function saveDiscussion(qid: string): Promise<void> {
  const res = await fetch(`${API_URL}/questions/${qid}/save`, {
    method: "POST",
    headers: await authHeaders(),
  });
  if (!res.ok) throw new Error("Failed to save discussion");
}

export async function unsaveDiscussion(qid: string): Promise<void> {
  // No DELETE /save in backend yet
  throw new Error("unsaveDiscussion not implemented in backend");
}
