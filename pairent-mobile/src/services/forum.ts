// src/services/forum.ts

export type Reply = {
  rid: string;
  parentId: string | null;   // null for top-level; otherwise parent's rid
  name: string;              // author display name
  body: string;
  created_at: string;        // ISO
  likes: number;
};

export type QuestionDetail = {
  qid: string;
  title: string;
  name: string;              // author's display name
  child_age_label: string;
  likes: number;
  body: string;
};

// ---------- MOCKS (replace with real API) ----------
const MOCK_Q: QuestionDetail = {
  qid: "q1",
  title: "My baby wakes up at night, how can I make him sleep better?",
  name: "janedoe_87",
  child_age_label: "2 yrs",
  likes: 120,
  body:
    "He keeps waking up every 2–3 hours. We tried white noise and feeding before bed. Any advice?",
};

let MOCK_REPLIES: Reply[] = [
  { rid: "r1",   parentId: null, name: "Alice", body: "Try a dream feed before midnight.", created_at: new Date().toISOString(), likes: 3 },
  { rid: "r1-1", parentId: "r1", name: "Bob",   body: "This worked for us too!", created_at: new Date().toISOString(), likes: 1 },
  { rid: "r1-2", parentId: "r1", name: "Carol", body: "Didn't help my baby, but worth a try.", created_at: new Date().toISOString(), likes: 0 },
  { rid: "r2",   parentId: null, name: "Bob",   body: "7–8mo regression is normal. It passes!", created_at: new Date().toISOString(), likes: 2 },
  { rid: "r2-1", parentId: "r2", name: "Alice", body: "Thanks Bob, that's reassuring.", created_at: new Date().toISOString(), likes: 0 },
];

// saved/bookmarked discussions mock
let MOCK_SAVED: Record<string, boolean> = {};

// ---------- SERVICE (swap to real HTTP later) ----------
export async function getQuestion(qid: string): Promise<QuestionDetail> {
  // TODO: fetch(`/api/questions/${qid}`)
  await wait(200);
  return { ...MOCK_Q, qid };
}

export async function listReplies(params: {
  qid: string;
  parentId: string | null; // null => top-level
}): Promise<{ items: Reply[] }> {
  // TODO: GET /api/questions/:qid/replies?parentId=...
  await wait(200);
  const items = MOCK_REPLIES.filter((r) => r.parentId === params.parentId);
  return { items };
}

export async function createReply(params: {
  qid: string;
  parentId: string | null;
  body: string;
  name: string; // display name
}): Promise<Reply> {
  // TODO: POST /api/questions/:qid/replies
  await wait(120);
  const rid = `${params.parentId ?? "r"}-${Math.random().toString(36).slice(2, 7)}`;
  const reply: Reply = {
    rid,
    parentId: params.parentId,
    name: params.name,
    body: params.body,
    created_at: new Date().toISOString(),
    likes: 0,
  };
  MOCK_REPLIES = [...MOCK_REPLIES, reply];
  return reply;
}

export async function likeQuestion(qid: string, liked: boolean): Promise<number> {
  // TODO: POST /api/questions/:qid/like { liked }
  await wait(100);
  return MOCK_Q.likes + (liked ? 1 : 0);
}

export async function likeReply(rid: string, liked: boolean): Promise<number> {
  // TODO: POST /api/replies/:rid/like { liked }
  await wait(100);
  const idx = MOCK_REPLIES.findIndex((r) => r.rid === rid);
  if (idx >= 0) {
    const base = MOCK_REPLIES[idx].likes;
    const val = Math.max(0, base + (liked ? 1 : -1));
    MOCK_REPLIES[idx] = { ...MOCK_REPLIES[idx], likes: val };
    return val;
  }
  return liked ? 1 : 0;
}

// ---- NEW: delete a reply (and any of its children if loaded on backend) ----
export async function deleteReply(rid: string): Promise<void> {
  // TODO: DELETE /api/replies/:rid
  await wait(100);
  // mock: remove rid and all descendants
  const toDelete = new Set<string>([rid]);
  let grew = true;
  while (grew) {
    grew = false;
    for (const r of MOCK_REPLIES) {
      if (r.parentId && toDelete.has(r.parentId) && !toDelete.has(r.rid)) {
        toDelete.add(r.rid);
        grew = true;
      }
    }
  }
  MOCK_REPLIES = MOCK_REPLIES.filter((r) => !toDelete.has(r.rid));
}

// ---- NEW: saved/bookmark state ----
export async function getSaved(qid: string): Promise<{ saved: boolean }> {
  // TODO: GET /api/questions/:qid/save
  await wait(80);
  return { saved: !!MOCK_SAVED[qid] };
}

export async function saveDiscussion(qid: string): Promise<void> {
  // TODO: POST /api/questions/:qid/save
  await wait(80);
  MOCK_SAVED[qid] = true;
}

export async function unsaveDiscussion(qid: string): Promise<void> {
  // TODO: DELETE /api/questions/:qid/save
  await wait(80);
  delete MOCK_SAVED[qid];
}

function wait(ms: number) {
  return new Promise((res) => setTimeout(res, ms));
}