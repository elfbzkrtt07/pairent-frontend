// src/services/forum.ts
import { fetchAuthSession } from "aws-amplify/auth";

export type Reply = {
  rid: string;
  parent_id: string | null;
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

const API_URL = "http://127.0.0.1:5000";

async function authHeaders(includeContent = false) {
  const session = await fetchAuthSession();
  const token = session.tokens?.accessToken?.toString();
  return {
    Authorization: token ? `Bearer ${token}` : "",
    ...(includeContent ? { "Content-Type": "application/json" } : {}),
  };
}

// ✅ helper to normalize child age label
function mapChildAge(it: any): string {
  if (it.child_age_label) return it.child_age_label;
  if (it.age !== undefined && it.age !== null) {
    return `${parseInt(it.age)} yrs`;
  }
  return "";
}

// ---- Listing and creation ----
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
    items: (data.items || []).map((it: any) => {
      const qid =
        it.qid ??
        (it.PK?.startsWith("QUESTION#") ? it.PK.slice("QUESTION#".length) : "");
      return {
        qid,
        title: it.title ?? "",
        body: it.body ?? "",
        author_name: it.author_name ?? it.author ?? "",
        child_age_label: mapChildAge(it),
        likes: Number(it.likes ?? 0),
        reply_count: Number(it.replies ?? 0),
      };
    }),
  };
}

export async function searchQuestions(params: {
  q: string;
  limit?: number;
  direction?: "ascending" | "descending";
  after?: any;
}): Promise<{ items: Question[]; pageInfo?: any }> {
  if (!params.q) throw new Error("Missing search query");

  const url = new URL(`${API_URL}/questions/search`);
  url.searchParams.set("q", params.q);
  if (params.limit) url.searchParams.set("limit", String(params.limit));
  if (params.direction) url.searchParams.set("direction", params.direction);
  if (params.after) {
    url.searchParams.set("after", encodeURIComponent(JSON.stringify(params.after)));
  }

  const res = await fetch(url.toString(), {
    headers: await authHeaders(),
  });

  if (!res.ok) {
    const msg = await res.text().catch(() => "Failed to search questions");
    throw new Error(`Search failed: ${msg}`);
  }

  const data = await res.json();

  const itemsRaw = data.items || data.Items || [];

  return {
    items: itemsRaw.map((it: any) => {
      const qid =
        it.qid ??
        (it.PK?.startsWith("QUESTION#") ? it.PK.slice("QUESTION#".length) : "");
      return {
        qid,
        title: it.title ?? "",
        body: it.body ?? "",
        author_name: it.author_name ?? it.author ?? "",
        child_age_label: mapChildAge(it),
        likes: Number(it.likes ?? 0),
        reply_count: Number(it.replies ?? 0),
      };
    }),
    pageInfo: data.pageInfo ?? data.LastEvaluatedKey ?? null,
  };
}

export async function listMyQuestions(params: {
  limit?: number;
  sort?: string;
}): Promise<{ items: Question[] }> {
  const limit = params.limit ?? 10;
  const sort = params.sort ?? "popular";
  const res = await fetch(`${API_URL}/questions/me?limit=${limit}&sort=${sort}`, {
    headers: await authHeaders(),
  });
  if (!res.ok) throw new Error("Failed to list my questions");
  const data = await res.json();
  return {
    items: (data.items || []).map((it: any) => {
      const qid =
        it.qid ??
        (it.PK?.startsWith("QUESTION#") ? it.PK.slice("QUESTION#".length) : "");
      return {
        qid,
        title: it.title ?? "",
        body: it.body ?? "",
        author_name: it.author_name ?? it.author ?? "",
        child_age_label: mapChildAge(it),
        likes: Number(it.likes ?? 0),
        reply_count: Number(it.replies ?? 0),
      };
    }),
  };
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

export async function getQuestion(qid: string): Promise<Question & { Replies: Reply[] }> {
  const res = await fetch(`${API_URL}/questions/${qid}`);
  if (!res.ok) throw new Error("Failed to fetch question");
  const data = await res.json();

  const q = data.Question ?? data;
  const question: Question = {
    qid: q.qid,
    title: q.title,
    body: q.body,
    author_name: q.author_name ?? q.author ?? "",
    child_age_label: mapChildAge(q),
    likes: Number(q.likes ?? 0),
    reply_count: Number(q.replies ?? q.reply_count ?? 0),
  };

  const repliesRaw = data.Replies ?? [];
  const replies: Reply[] = repliesRaw.map((r: any) => ({
    rid: r.SK?.startsWith("REPLY#")
      ? r.SK.slice("REPLY#".length)
      : r.rid ?? "",
    parent_id: r.parent ?? null,
    name: r.name ?? r.user ?? "Anonymous",
    body: r.body ?? "",
    created_at: r.date ?? "",
    likes: Number(r.likes ?? 0),
  }));

  return { ...question, Replies: replies };
}


export async function createReply(params: {
  qid: string;
  parent_id: string | null;
  body: string;
}): Promise<Reply> {
  const payload = {
    body: params.body,
    parent_id: params.parent_id ?? params.qid,
  };

  const res = await fetch(`${API_URL}/questions/${params.qid}/reply`, {
    method: "POST",
    headers: await authHeaders(true),
    body: JSON.stringify(payload),
  });

  if (!res.ok) {
    const errText = await res.text();
    throw new Error(`Failed to create reply: ${res.status} ${errText}`);
  }

  return res.json();
}

// ---- Question Like APIs ----
export async function getLikeStatus(qid: string): Promise<{ liked: boolean }> {
  const res = await fetch(`${API_URL}/questions/${qid}/like`, {
    headers: await authHeaders(),
  });
  if (!res.ok) throw new Error("Failed to fetch like status");
  return res.json();
}

export async function likeQuestion(qid: string): Promise<void> {
  const res = await fetch(`${API_URL}/questions/${qid}/like`, {
    method: "POST",
    headers: await authHeaders(),
  });
  if (!res.ok) throw new Error("Failed to like question");
}

export async function unlikeQuestion(qid: string): Promise<void> {
  const res = await fetch(`${API_URL}/questions/${qid}/like`, {
    method: "DELETE",
    headers: await authHeaders(),
  });
  if (!res.ok) throw new Error("Failed to unlike question");
}

export async function likeReply(qid: string, rid: string): Promise<number> {
  const res = await fetch(`${API_URL}/questions/${qid}/reply/${rid}/like`, {
    method: "POST",
    headers: await authHeaders(),
  });
  if (!res.ok) throw new Error("Failed to like reply");
  return 1;
}

export async function unlikeReply(qid: string, rid: string): Promise<number> {
  const res = await fetch(`${API_URL}/questions/${qid}/reply/${rid}/like`, {
    method: "DELETE",
    headers: await authHeaders(),
  });
  if (!res.ok) throw new Error("Failed to unlike reply");
  return -1;
}

export async function getReplyLikeStatus(
  qid: string,
  rid: string
): Promise<{ liked: boolean }> {
  const res = await fetch(`${API_URL}/questions/${qid}/reply/${rid}/like`, {
    headers: await authHeaders(),
  });
  if (!res.ok) throw new Error("Failed to fetch reply like status");
  return res.json();
}

export async function deleteReply(qid: string, rid: string): Promise<void> {
  const res = await fetch(`${API_URL}/questions/${qid}/reply/${rid}`, {
    method: "DELETE",
    headers: await authHeaders(),
  });

  if (!res.ok) {
    const errText = await res.text();
    throw new Error(`Failed to delete reply: ${res.status} ${errText}`);
  }
}

export async function getSaved(qid: string): Promise<{ saved: boolean }> {
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

  if (!res.ok) {
    const errText = await res.text();
    throw new Error(`Failed to delete question: ${res.status} ${errText}`);
  }
}

export async function listQuestionsByUser(
  userId: string,
  params: { limit?: number; sort?: string } = {}
) {
  return { items: [] };
}

export async function editQuestion(
  qid: string,
  payload: { title?: string; body?: string; tags?: string[] }
): Promise<{ message: string }> {
  const res = await fetch(`${API_URL}/questions/${qid}`, {
    method: "PUT",
    headers: await authHeaders(true),
    body: JSON.stringify(payload),
  });

  if (!res.ok) {
    const errText = await res.text();
    throw new Error(`Failed to update question: ${res.status} ${errText}`);
  }

  return res.json();
}
