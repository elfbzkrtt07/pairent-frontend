import React, { createContext, useContext, useState, useEffect, useMemo, useCallback } from "react";
import {
  signUp,
  confirmSignUp,
  signIn,
  signOut,
  getCurrentUser,
  fetchAuthSession,
  fetchUserAttributes,
} from "aws-amplify/auth";

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
        console.log("Restored session for:", attrs.email);
      } catch {
        setUser(null);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const signUpHandler = useCallback(
    async (email: string, password: string, name: string, birthdate: string) => {
      await signUp({
        username: email,
        password,
        options: {
          userAttributes: { email, name, birthdate },
        },
      });
      console.log("SignUp success:", email);
    },
    []
  );

  const confirmHandler = useCallback(async (email: string, code: string) => {
    await confirmSignUp({ username: email, confirmationCode: code });
    console.log("Confirmed:", email);
  }, []);

  const signInHandler = useCallback(async (email: string, password: string) => {
    await signIn({ username: email, password });
    const attrs = await fetchUserAttributes();
    setUser({
      email: attrs.email ?? "",
      name: attrs.name ?? "",
      birthdate: attrs.birthdate ?? "",
    });
    console.log("Signed in:", attrs.email);
  }, []);

  const signOutHandler = useCallback(async () => {
    await signOut();
    setUser(null);
    console.log("Signed out");
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
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
