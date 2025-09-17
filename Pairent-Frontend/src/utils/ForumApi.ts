import { getIdToken } from "../context/AuthContext";

export type QuestionSummary = {
  qid: string;
  title: string;
  author_name: string;
  child_age_label: string;  
  likes: number;
  reply_count: number;      
  created_at: string;
};

export type QuestionDetail = QuestionSummary & {
  body: string;
};

async function api<T>(path: string, init?: RequestInit): Promise<T> {
  const token = await getIdToken(); 
  const res = await fetch(`${process.env.EXPO_PUBLIC_API_BASE}${path}`, {
    ...init,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(init?.headers || {}),
    },
  });
  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(`${res.status} ${res.statusText}${text ? " — " + text : ""}`);
  }
  //@ts-ignore
  return res.status === 204 ? undefined : await res.json();
}

export const ForumApi = {
  listQuestions: (limit = 20) =>
    api<QuestionSummary[]>(`/questions?limit=${limit}`),

  getQuestion: (qid: string) =>
    api<QuestionDetail>(`/questions/${qid}`),

  postQuestion: (title: string, body: string) =>
    api<QuestionDetail>(`/questions`, {
      method: "POST",
      body: JSON.stringify({ title, body }),
    }),

  like: (qid: string) =>
    api<void>(`/questions/${qid}/like`, { method: "POST" }),

  unlike: (qid: string) =>
    api<void>(`/questions/${qid}/like`, { method: "DELETE" }),

  getLike: (qid: string) =>
    api<{ liked: boolean }>(`/questions/${qid}/like`),
};
