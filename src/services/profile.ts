// src/services/profile.ts
import { fetchAuthSession } from "aws-amplify/auth";

// ---------- Types ----------
export type Child = {
  id: string;
  name: string;
  dob?: string;
};

export type GrowthRecord = {
  id?: string;
  date: string;
  height: number;
  weight: number;
};

export type VaccineRecord = {
  id?: string;
  name: string;
  date: string;
  status: "done" | "pending" | "skipped";
};

export type PrivacyLevel = "public" | "private" | "friends";

export type ExtendedUser = {
  id: string;
  bio?: string;
  children?: Child[];
  privacy?: Record<string, PrivacyLevel>;
  friends?: string[];
  name?: string;
  email?: string;
  dob?: string;
};

const API_URL = "http://127.0.0.1:5000";

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
  const res = await authFetch(`${API_URL}/profile/me`);
  if (!res.ok) throw new Error("Failed to fetch profile");
  return res.json();
}

export async function updateMyProfile(payload: Partial<ExtendedUser>) {
  const res = await authFetch(`${API_URL}/profile/me`, {
    method: "PUT",
    body: JSON.stringify(payload),
  });
  if (!res.ok) throw new Error("Failed to update profile");
  return res.json();
}

export async function getUserProfile(userId: string): Promise<ExtendedUser> {
  const res = await authFetch(`${API_URL}/profile/${userId}`);
  if (!res.ok) throw new Error("Failed to fetch user profile");
  return res.json();
}

// ---------- Public User ----------
export async function getPublicUser(userId: string) {
  const res = await authFetch(`${API_URL}/profile/${userId}`);
  if (!res.ok) throw new Error("Failed to fetch public user");
  return res.json();
}

// ---------- Children ----------
export async function addChild(payload: { name: string; dob: string }): Promise<Child> {
  const res = await authFetch(`${API_URL}/profile/me/children`, {
    method: "POST",
    body: JSON.stringify(payload),
  });
  if (!res.ok) throw new Error("Failed to add child");
  return res.json(); // backend returns the created child
}

export async function listChildren(): Promise<Child[]> {
  const res = await authFetch(`${API_URL}/profile/me`);
  if (!res.ok) throw new Error("Failed to list children");
  const me = await res.json();
  return me.children ?? []; // always return an array
}

export async function updateChild(childId: string, payload: Partial<Child>): Promise<Child> {
  const res = await authFetch(`${API_URL}/profile/me/children/${childId}`, {
    method: "PUT",
    body: JSON.stringify(payload),
  });
  if (!res.ok) throw new Error("Failed to update child");
  return res.json();
}

export async function deleteChild(childId: string): Promise<void> {
  const res = await authFetch(`${API_URL}/profile/me/children/${childId}`, {
    method: "DELETE",
  });
  if (!res.ok) throw new Error("Failed to delete child");
}

// ---------- Milestones ----------
export type Milestone = { id: string; name: string; typical: string; done: boolean };

export async function listMilestones(childId: string): Promise<{ items: Milestone[] }> {
  const res = await authFetch(`${API_URL}/milestones/${childId}`);
  if (!res.ok) throw new Error("Failed to fetch milestones");
  return res.json();
}

export async function toggleMilestone(childId: string, milestoneId: string) {
  const res = await authFetch(`${API_URL}/milestones/${childId}/${milestoneId}`, {
    method: "PATCH",
    body: JSON.stringify({ toggle: true }),
  });
  if (!res.ok) throw new Error("Failed to toggle milestone");
}

// ---------- Growth ----------
export async function addGrowth(childId: string, payload: GrowthRecord) {
  const res = await authFetch(`${API_URL}/profile/me/children/${childId}/growth`, {
    method: "POST",
    body: JSON.stringify(payload),
  });
  if (!res.ok) throw new Error("Failed to add growth record");
  return res.json();
}

export async function listGrowth(childId: string): Promise<{ items: GrowthRecord[] }> {
  const res = await authFetch(`${API_URL}/profile/me/children/${childId}/growth`);
  if (!res.ok) throw new Error("Failed to list growth records");
  return res.json();
}

// ---------- Vaccines ----------
export async function addVaccine(childId: string, payload: VaccineRecord) {
  const res = await authFetch(`${API_URL}/profile/me/children/${childId}/vaccine`, {
    method: "POST",
    body: JSON.stringify(payload),
  });
  if (!res.ok) throw new Error("Failed to add vaccine record");
  return res.json();
}

export async function listVaccines(childId: string): Promise<{ items: VaccineRecord[] }> {
  const res = await authFetch(`${API_URL}/profile/me/children/${childId}/vaccine`);
  if (!res.ok) throw new Error("Failed to list vaccine records");
  return res.json();
}


// ---------- Friends ----------
export async function sendFriendRequest(userId: string) {
  const res = await authFetch(`${API_URL}/friends/request/${userId}`, {
    method: "POST",
  });
  if (!res.ok) throw new Error("Failed to send friend request");
  return res.json();
}

export async function acceptFriendRequest(userId: string) {
  const res = await authFetch(`${API_URL}/friends/accept/${userId}`, {
    method: "POST",
  });
  if (!res.ok) throw new Error("Failed to accept friend request");
  return res.json();
}

export async function listFriendRequests() {
  const res = await authFetch(`${API_URL}/friends/requests`);
  if (!res.ok) throw new Error("Failed to list friend requests");
  return res.json();
}

export async function removeFriend(userId: string) {
  const res = await authFetch(`${API_URL}/friends/${userId}`, {
    method: "DELETE",
  });
  if (!res.ok) throw new Error("Failed to remove friend");
}
