import React, { createContext, useContext, useState, useEffect, useMemo, useCallback } from "react";
import { signUp, confirmSignUp, signIn, signOut, getCurrentUser, fetchUserAttributes } from "aws-amplify/auth";

type User = { email: string; name?: string; birthdate?: string } | null;

type AuthCtx = {
  user: User;
  signUp: (email: string, password: string, name: string, birthdate: string) => Promise<void>;
  confirmSignUp: (email: string, code: string) => Promise<void>;
  signIn: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
  loading: boolean;
};

const AuthContext = createContext<AuthCtx | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const current = await getCurrentUser();
        const attrs = await fetchUserAttributes();
        setUser({
          email: attrs.email ?? "",
          name: attrs.name ?? "",
          birthdate: attrs.birthdate ?? "",
        });
      } catch (err) {
        setUser(null);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const signUpHandler = useCallback(
    async (email: string, password: string, name: string, birthdate: string) => {
      try {
        await signUp({
          username: email, 
          password,
          options: { userAttributes: { email, name, birthdate } },
        });
      } catch (e: any) {
        console.error("B2x: signUp failed:", e);
        if (!name) throw new Error("Name cannot be empty");
        if (!email) throw new Error("Email cannot be empty");
        if (!password) throw new Error("Password cannot be empty");
        if (!email.includes("@") || !email.includes(".")) {
          throw new Error("Invalid email address");
        }
        if (password.length < 8 || !/\d/.test(password) || !/[a-zA-Z]/.test(password)) {
          throw new Error("Password must be at least 8 characters long and include both letters and numbers");
        }
        throw new Error("Sign up failed");
      }
    },
    []
  );

  const confirmHandler = useCallback(async (email: string, code: string) => {
    try {
      await confirmSignUp({ username: email, confirmationCode: code });
    } catch (e) {
      console.error("C2x: confirmSignUp failed:", e);
      throw e;
    }
  }, []);

  const signInHandler = useCallback(async (email: string, password: string) => {
    try {
      await signIn({ username: email, password });
      const attrs = await fetchUserAttributes();
      setUser({
        email: attrs.email ?? "",
        name: attrs.name ?? "",
        birthdate: attrs.birthdate ?? "",
      });
    } catch (e: any) {
      console.error("D2x: signIn failed:", e);
      throw e;
    }
  }, []);

  const signOutHandler = useCallback(async () => {
    try {
      await signOut();
    } catch (e) {
      console.error("E2x: signOut failed:", e);
    } finally {
      setUser(null);
    }
  }, []);

  const value = useMemo(
    () => ({
      user,
      signUp: signUpHandler,
      confirmSignUp: confirmHandler,
      signIn: signInHandler,
      signOut: signOutHandler,
      loading,
    }),
    [user, signUpHandler, confirmHandler, signInHandler, signOutHandler, loading]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    console.error("Zx: useAuth outside AuthProvider!");
    throw new Error("useAuth must be used within AuthProvider");
  }
  return ctx;
}

import { fetchAuthSession } from "aws-amplify/auth";

export async function getIdToken(): Promise<string | null> {
  try {
    const session = await fetchAuthSession();
    return session.tokens?.idToken?.toString() ?? null;
  } catch (err) {
    console.error("Failed to fetch ID token:", err);
    return null;
  }
}
