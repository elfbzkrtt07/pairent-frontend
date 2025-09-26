// src/services/tips.ts
import { fetchAuthSession } from "aws-amplify/auth";

// Attempts real backend, falls back to local mock if unavailable
export async function getDailyTip(): Promise<{ text: string }> {
  try {
    const session = await fetchAuthSession();
    const token = session.tokens?.accessToken?.toString();
    const res = await fetch("http://localhost:5000/bibi/daily-tip", {
      headers: { Authorization: token ? `Bearer ${token}` : "" },
    });
    if (res.ok) {
      const data = await res.json();
      if (typeof data?.text === "string") return { text: data.text };
    }
  } catch {}

  // Fallback mock
  return {
    text:
      "Tip unavailable. Check back later while we connect to the tips service.",
  };
}


