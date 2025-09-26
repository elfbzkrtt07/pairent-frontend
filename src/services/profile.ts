// src/services/profile.ts
import { fetchAuthSession } from "aws-amplify/auth";

// ---------- Types ----------
export type Child = {
  id: string;
  name: string;
  dob?: string;
  age?: number;
};

export type GrowthRecord = {
  date: string;
  height: number;
  weight: number;
};

export type VaccineRecord = {
  name: string;
  date: string;
  status: "done" | "pending" | "skipped";
};

export type ExtendedUser = {
  id: string;
  bio?: string;
  children?: Child[];
  privacy?: Record<string, "public" | "private">;
  friends?: string[];
  name?: string;
  email?: string;
  dob?: string;
};

// ---------- Helpers ----------
async function authFetch(url: string, options: RequestInit = {}) {
  const session = await fetchAuthSession();
  const token = session.tokens?.accessToken?.toString();
  return fetch(url, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(options.headers || {}),
      Authorization: token ? `Bearer ${token}` : "",
    },
  });
}

// ---------- Profile ----------
export async function getMyProfile(): Promise<ExtendedUser> {
  const res = await authFetch("http://localhost:5000/profile/me");
  if (!res.ok) throw new Error("Failed to fetch profile");
  return res.json();
}

export async function updateMyProfile(payload: Partial<ExtendedUser>) {
  const res = await authFetch("http://localhost:5000/profile/me", {
    method: "PUT",
    body: JSON.stringify(payload),
  });
  if (!res.ok) throw new Error("Failed to update profile");
  return res.json();
}

export async function getUserProfile(userId: string): Promise<ExtendedUser> {
  const res = await authFetch(`http://localhost:5000/profile/${userId}`);
  if (!res.ok) throw new Error("Failed to fetch user profile");
  return res.json();
}

// ---------- Public User (unauth parts proxied via service) ----------
export async function getPublicUser(userId: string) {
  // Backend does not expose /users/<id> in provided routes.
  // Fallback to privacy-filtered profile endpoint if suitable.
  const res = await authFetch(`http://localhost:5000/profile/${userId}`);
  if (!res.ok) throw new Error("Failed to fetch public user");
  return res.json();
}

// ---------- Children ----------
export async function addChild(payload: { name: string; dob: string }) {
  const res = await authFetch("http://localhost:5000/profile/me/children", {
    method: "POST",
    body: JSON.stringify(payload),
  });
  if (!res.ok) throw new Error("Failed to add child");
  return res.json();
}

export async function listChildren(): Promise<{ items: Child[] }> {
  // Backend does not provide /profile/children; read from /profile/me
  const res = await authFetch("http://localhost:5000/profile/me");
  if (!res.ok) throw new Error("Failed to list children");
  const me = await res.json();
  return { items: me.children || [] };
}

export async function updateChild(childId: string, payload: Partial<Child>) {
  const res = await authFetch(`http://localhost:5000/profile/me/children/${childId}`, {
    method: "PUT",
    body: JSON.stringify(payload),
  });
  if (!res.ok) throw new Error("Failed to update child");
  return res.json();
}

export async function deleteChild(childId: string) {
  const res = await authFetch(`http://localhost:5000/profile/me/children/${childId}`, {
    method: "DELETE",
  });
  if (!res.ok) throw new Error("Failed to delete child");
}

// ---------- Milestones ----------
export type Milestone = { id: string; name: string; typical: string; done: boolean };

export async function listMilestones(childId: string): Promise<{ items: Milestone[] }> {
  const res = await authFetch(`http://localhost:5000/milestones/${childId}`);
  if (!res.ok) throw new Error("Failed to fetch milestones");
  return res.json();
}

export async function toggleMilestone(childId: string, milestoneId: string) {
  const res = await authFetch(`http://localhost:5000/milestones/${childId}/${milestoneId}`, {
    method: "PATCH",
    body: JSON.stringify({ toggle: true }),
  });
  if (!res.ok) throw new Error("Failed to toggle milestone");
}

// ---------- Growth & Vaccines ----------
export async function addGrowth(childId: string, payload: GrowthRecord) {
  const res = await authFetch(`http://localhost:5000/profile/me/children/${childId}/growth`, {
    method: "POST",
    body: JSON.stringify(payload),
  });
  if (!res.ok) throw new Error("Failed to add growth record");
  return res.json();
}

export async function addVaccine(childId: string, payload: VaccineRecord) {
  const res = await authFetch(`http://localhost:5000/profile/me/children/${childId}/vaccine`, {
    method: "POST",
    body: JSON.stringify(payload),
  });
  if (!res.ok) throw new Error("Failed to add vaccine record");
  return res.json();
}

// ---------- Friends ----------
export async function sendFriendRequest(userId: string) {
  const res = await authFetch(`http://localhost:5000/friends/request/${userId}`, {
    method: "POST",
  });
  if (!res.ok) throw new Error("Failed to send friend request");
  return res.json();
}

export async function acceptFriendRequest(userId: string) {
  const res = await authFetch(`http://localhost:5000/friends/accept/${userId}`, {
    method: "POST",
  });
  if (!res.ok) throw new Error("Failed to accept friend request");
  return res.json();
}

export async function listFriendRequests() {
  const res = await authFetch("http://localhost:5000/friends/requests");
  if (!res.ok) throw new Error("Failed to list friend requests");
  return res.json();
}

export async function removeFriend(userId: string) {
  const res = await authFetch(`http://localhost:5000/friends/${userId}`, {
    method: "DELETE",
  });
  if (!res.ok) throw new Error("Failed to remove friend");
}
