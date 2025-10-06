// src/services/profile.ts
import { fetchAuthSession, signUp, fetchUserAttributes } from "aws-amplify/auth";

// ---------- Types ----------
export type Child = {
  child_id: string;
  name: string;
  dob?: string;
  user_id?: string;
  privacy?: Record<string, PrivacyLevel>;
  milestones?: Array<{ id: number; reached: boolean }>;
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

export type Milestone = {
  id: string;       // comes back as string from backend merge
  name: string;
  done: boolean;
  typical?: string; // backend may not provide this field yet
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
export async function createProfile(user_id: string, name: string, dob: string) {
  const res = await fetch(`${API_URL}/profile`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ user_id, name, dob }),
  });
  if (!res.ok) {
    const err = await res.text();
    throw new Error(`Profile creation failed: ${err}`);
  }
  return res.json();
}

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
  return res.json();
}

export async function listChildren(): Promise<Child[]> {
  const res = await authFetch(`${API_URL}/profile/me/children`);
  if (!res.ok) throw new Error("Failed to list children");
  const data = await res.json();
  return Array.isArray(data) ? data : [];
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
export async function listMilestones(childId: string): Promise<Milestone[]> {
  const res = await authFetch(`${API_URL}/milestones/${childId}`);
  if (!res.ok) throw new Error("Failed to fetch milestones");

  // Backend returns an array, not { items }. Make it robust to either shape.
  const data = await res.json();
  if (Array.isArray(data)) return data as Milestone[];
  if (Array.isArray(data?.items)) return data.items as Milestone[];
  return [];
}

/**
 * Toggle milestone by:
 * 1) fetching current merged milestones (with names),
 * 2) building the raw `{id:number, reached:boolean}` array expected in the Child item,
 * 3) PUT /profile/me/children/:childId with `milestones` update,
 * 4) re-fetch merged list for the UI.
 */
export async function toggleMilestone(childId: string, milestoneId: string) {
  // get merged milestones
  const merged = await listMilestones(childId);

  // compute updated
  const updated = merged.map((m) =>
    m.id === milestoneId ? { ...m, done: !m.done } : m
  );

  // convert to raw shape expected by backend child record
  const rawMilestones = updated.map((m) => ({
    id: Number(m.id),       // backend uses numeric ids
    reached: Boolean(m.done),
  }));

  // PUT the child update
  await updateChild(childId, { milestones: rawMilestones });

  // return fresh merged milestones
  return listMilestones(childId);
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

export async function listGrowth(childId: string): Promise<GrowthRecord[]> {
  const res = await authFetch(`${API_URL}/profile/me/children/${childId}/growth`);
  if (!res.ok) throw new Error("Failed to list growth records");
  const data = await res.json();
  return Array.isArray(data) ? (data as GrowthRecord[]) : Array.isArray(data?.items) ? data.items : [];
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

export async function listVaccines(childId: string): Promise<VaccineRecord[]> {
  const res = await authFetch(`${API_URL}/profile/me/children/${childId}/vaccine`);
  if (!res.ok) throw new Error("Failed to list vaccine records");
  const data = await res.json();
  return Array.isArray(data) ? (data as VaccineRecord[]) : Array.isArray(data?.items) ? data.items : [];
}

// ---------- Registration ----------
export async function registerUser(email: string, password: string, name: string, dob: string) {
  await signUp({
    username: email.trim(),
    password,
    options: {
      userAttributes: {
        name: name.trim(),
        birthdate: dob,
        email: email.trim(),
      },
    },
  });

  const attrs = await fetchUserAttributes();
  const userSub = attrs.sub;

  const profile = await createProfile(userSub, name.trim(), dob);
  return { userSub, profile };
}
