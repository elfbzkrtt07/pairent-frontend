import React, { createContext, useContext, useState, useEffect, useMemo, useCallback } from "react";
import { signUp, confirmSignUp, signIn, signOut, getCurrentUser, fetchUserAttributes } from "aws-amplify/auth";

type User = { email: string; name?: string; birthdate?: string; username: string } | null;

type AuthCtx = {
  user: User;
  signUp: (email: string, password: string, name: string, birthdate: string, username: string) => Promise<void>;
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
        setUser({
          email: attrs.email ?? "",
          name: attrs.name ?? "",
          birthdate: attrs.birthdate ?? "",
          username: current.username // or attrs.preferred_username if you want
        });
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

  const signUpHandler = useCallback(
    async (email: string, password: string, name: string, birthdate: string, username: string) => {
      console.log("B1: signUp called", { email, name, birthdate, username });
      if (!username || username.length < 3) {
        throw new Error("Username must be at least 3 characters and unique");
      }
      try {
        await signUp({
          username,
          password,
          options: { userAttributes: { email, name, birthdate, preferred_username: username } },
        });
        console.log("B2: signUp OK:", email);
      } catch (e) {
        console.error("B2x: signUp failed:", e);
        if (name.length < 1) {
          throw new Error("Nickname cannot be empty");
        }
        else if (email.length < 1) {
          throw new Error("Email cannot be empty");
        }
        else if (password.length < 1) {
          throw new Error("Password cannot be empty");
        }
        else if(email.includes('@') === false || email.includes('.') === false) {
          throw new Error("Invalid email address");
        }
        else if (password.length < 8 || !/\d/.test(password) || !/[a-zA-Z]/.test(password)) {
          throw new Error("Password must be at least 8 characters long and include both letters and numbers");
        } 
        else throw new Error("Sign up failed");
      }
    },
    []
  );

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
        setUser({ 
          email: attrs.email ?? "", 
          name: attrs.name ?? "", 
          birthdate: attrs.birthdate ?? "", 
          username: attrs.preferred_username ?? attrs.email ?? "" 
        });
        console.log("D4: user set:", attrs.email);
    } catch (e: any) {
        console.error("D2x: signIn failed:", e);
        console.log("D2x: err.name:", e?.name);
        console.log("D2x: err.message:", e?.message);
        console.log("D2x: err.stack:", e?.stack);
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

  const value = useMemo(() => ({
    user,
    signUp: signUpHandler,
    confirmSignUp: confirmHandler,
    signIn: signInHandler,
    signOut: signOutHandler,
    loading,
  }), [user, signUpHandler, confirmHandler, signInHandler, signOutHandler, loading]);

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
