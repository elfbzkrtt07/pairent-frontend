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

export type Question = {
  qid: string;
  title: string;
  body: string;
  author_name: string;
  child_age_label: string;
  likes: number;
  reply_count: number;
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
  sort?: string;
}): Promise<{ items: Question[] }> {
  const limit = params.limit ?? 10;
  const sort = params.sort ?? "new";
  const res = await fetch(`${API_URL}/questions?limit=${limit}&sort=${sort}`, {
    headers: await authHeaders(),
  });
  if (!res.ok) throw new Error("Failed to list questions");
  const data = await res.json();

  return {
    items: data.items.map((it: any) => {
      const qid = it.qid ?? (it.PK?.startsWith("QUESTION#") ? it.PK.slice("QUESTION#".length) : "");
      return {
        qid,
        title: it.title ?? "",
        body: it.body ?? "",
        author_name: it.author_name ?? it.author ?? "",
        child_age_label: it.child_age_label ?? "",
        likes: Number(it.likes ?? 0),
        reply_count: Number(it.replies ?? 0),
      };
    }),
  };
}

// forum.ts
export async function searchQuestions(params: {
  q: string;
  limit?: number;
  direction?: "ascending" | "descending";
  after?: any; // backend sends ExclusiveStartKey object
}): Promise<{ items: Question[]; pageInfo?: any }> {
  if (!params.q) throw new Error("Missing search query");

  const url = new URL(`${API_URL}/questions/search`);
  url.searchParams.set("q", params.q);
  if (params.limit) url.searchParams.set("limit", String(params.limit));
  if (params.direction) url.searchParams.set("direction", params.direction);
  if (params.after) url.searchParams.set("after", JSON.stringify(params.after));

  const res = await fetch(url.toString(), {
    headers: await authHeaders(),
  });
  if (!res.ok) throw new Error("Failed to search questions");
  const data = await res.json();

  return {
    items: data.items.map((it: any) => {
      const qid =
        it.qid ??
        (it.PK?.startsWith("QUESTION#") ? it.PK.slice("QUESTION#".length) : "");
      return {
        qid,
        title: it.title ?? "",
        body: it.body ?? "",
        author_name: it.author_name ?? it.author ?? "",
        child_age_label: it.child_age_label ?? "",
        likes: Number(it.likes ?? 0),
        reply_count: Number(it.replies ?? 0),
      };
    }),
    pageInfo: data.pageInfo,
  };
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

export async function getQuestion(qid: string): Promise<Question> {
  const res = await fetch(`${API_URL}/questions/${qid}`);
  if (!res.ok) throw new Error("Failed to fetch question");
  const data = await res.json();

  const q = data.Question ?? data; // unwrap if wrapped
  return {
    qid: q.qid,
    title: q.title,
    body: q.body,
    author_name: q.author_name ?? "",
    child_age_label: q.child_age_label ?? "",
    likes: Number(q.likes ?? 0),
    reply_count: Number(q.replies ?? q.reply_count ?? 0),
  };
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
  const data = await r2.json();

  // Backend wraps question data inside { "Question": { ... } }
  return data.Question.likes;
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
