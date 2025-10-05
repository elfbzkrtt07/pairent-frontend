import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useMemo,
  useCallback,
} from "react";
import {
  signUp,
  confirmSignUp,
  signIn,
  signOut,
  getCurrentUser,
  fetchUserAttributes,
  fetchAuthSession,
} from "aws-amplify/auth";

type User = {
  sub: string;
  email: string;
  name?: string;
  birthdate?: string;
} | null;

type AuthCtx = {
  user: User;
  signUp: (
    email: string,
    password: string,
    name: string,
    birthdate: string
  ) => Promise<void>;
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
        // check if already logged in
        const current = await getCurrentUser();
        if (current) {
          const attrs = await fetchUserAttributes();
          setUser({
            sub: attrs.sub ?? "",
            email: attrs.email ?? "",
            name: attrs.name ?? "",
            birthdate: attrs.birthdate ?? "",
          });
        }
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
        console.error("SignUp failed:", e);
        if (!name) throw new Error("Name cannot be empty");
        if (!email) throw new Error("Email cannot be empty");
        if (!password) throw new Error("Password cannot be empty");
        if (!email.includes("@") || !email.includes("."))
          throw new Error("Invalid email address");
        if (
          password.length < 8 ||
          !/\d/.test(password) ||
          !/[a-zA-Z]/.test(password)
        ) {
          throw new Error(
            "Password must be at least 8 characters long and include both letters and numbers"
          );
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
      console.error("ConfirmSignUp failed:", e);
      throw e;
    }
  }, []);

  const signInHandler = useCallback(async (email: string, password: string) => {
    try {
      await signIn({ username: email, password });

      const attrs = await fetchUserAttributes();
      const userId = attrs.sub ?? "";

      setUser({
        sub: userId,
        email: attrs.email ?? "",
        name: attrs.name ?? "",
        birthdate: attrs.birthdate ?? "",
      });

      // optional: create user in backend
      await fetch("http://127.0.0.1:5000/profile", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId,
          name: attrs.name,
          email: attrs.email,
          dob: attrs.birthdate,
        }),
      });
    } catch (e: any) {
      console.error("SignIn failed:", e);
      throw e;
    }
  }, []);

  const signOutHandler = useCallback(async () => {
    try {
      await signOut();
    } catch (e) {
      console.error("SignOut failed:", e);
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

  return (
    <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    console.error("UseAuth outside AuthProvider!");
    throw new Error("useAuth must be used within AuthProvider");
  }
  return ctx;
}

// helper to get raw id token if needed
export async function getIdToken(): Promise<string | null> {
  try {
    const session = await fetchAuthSession();
    return session.tokens?.idToken?.toString() ?? null;
  } catch (err) {
    console.error("Failed to fetch ID token:", err);
    return null;
  }
}
