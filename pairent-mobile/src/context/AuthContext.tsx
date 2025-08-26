// src/context/AuthContext.tsx
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
  console.log("A0: AuthProvider mounted");

  const [user, setUser] = useState<User>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    console.log("A1: checking existing session…");
    (async () => {
      try {
        const current = await getCurrentUser();
        console.log("A2: getCurrentUser OK:", current);
        const attrs = await fetchUserAttributes();
        console.log("A3: fetchUserAttributes OK:", attrs);
        setUser({ email: attrs.email ?? "", name: attrs.name ?? "", birthdate: attrs.birthdate ?? "" });
        console.log("A4: session restored for:", attrs.email);
      } catch (err) {
        console.log("A2x: no session / restore failed:", err);
        setUser(null);
      } finally {
        setLoading(false);
        console.log("A5: session check done. loading=false");
      }
    })();
  }, []);

  const signUpHandler = useCallback(async (email: string, password: string, name: string, birthdate: string) => {
    console.log("B1: signUp called", { email, name, birthdate });
    try {
      await signUp({ username: email, password, options: { userAttributes: { email, name, birthdate } } });
      console.log("B2: signUp OK:", email);
    } catch (e) {
      console.error("B2x: signUp failed:", e);
      throw e;
    }
  }, []);

  const confirmHandler = useCallback(async (email: string, code: string) => {
    console.log("C1: confirmSignUp called", email);
    try {
      await confirmSignUp({ username: email, confirmationCode: code });
      console.log("C2: confirmSignUp OK:", email);
    } catch (e) {
      console.error("C2x: confirmSignUp failed:", e);
      throw e;
    }
  }, []);

  const signInHandler = useCallback(async (email: string, password: string) => {
    console.log("D1: signIn called", email);
    try {
      await signIn({ username: email, password });
      console.log("D2: signIn OK");
      const attrs = await fetchUserAttributes();
      console.log("D3: fetchUserAttributes after signIn:", attrs);
      setUser({ email: attrs.email ?? "", name: attrs.name ?? "", birthdate: attrs.birthdate ?? "" });
      console.log("D4: user set:", attrs.email);
    } catch (e) {
      console.error("D2x: signIn failed:", e);
      throw e;
    }
  }, []);

  const signOutHandler = useCallback(async () => {
    console.log("E1: signOut called");
    try {
      await signOut();
      console.log("E2: signOut OK");
    } catch (e) {
      console.error("E2x: signOut failed:", e);
    } finally {
      setUser(null);
      console.log("E3: user cleared");
    }
  }, []);

  const value = useMemo(() => {
    console.log("Z1: useMemo compute. user =", user, "loading =", loading);
    return { user, signUp: signUpHandler, confirmSignUp: confirmHandler, signIn: signInHandler, signOut: signOutHandler, loading };
  }, [user, signUpHandler, confirmHandler, signInHandler, signOutHandler, loading]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    console.error("Zx: useAuth outside AuthProvider!");
    throw new Error("useAuth must be used within AuthProvider");
  }
  console.log("Z2: useAuth consumed. user =", ctx.user);
  return ctx;
}
