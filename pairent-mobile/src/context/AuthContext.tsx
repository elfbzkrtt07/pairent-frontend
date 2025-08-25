/**
 * AuthContext
 *
 * Frontend authentication state and actions for the Pairent app.
 * Stores { email, name } for the signed-in user.
 *
 * NOTE: This version keeps a local "email -> name" map so that after logging in
 * (without registering again) we can still display the user's name on Home.
 * This is device-local only; a real backend should return {email, name} on login.
 */

import React, {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  useCallback,
} from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

/** Required user shape kept on the client (null when signed out). */
type User = { email: string; name: string } | null;

/** The context value exposed to consumers. */
type AuthCtx = {
  user: User;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string, name: string) => Promise<void>;
  signOut: () => Promise<void>;
};

const STORAGE_KEY = '@pairent:user';   // current session (single user object)
const NAMES_KEY   = '@pairent:names';  // { [emailLower]: name } map (persists across sign-outs)

const AuthContext = createContext<AuthCtx | undefined>(undefined);

/** Lightweight, local validators (backend still re-validates). */
const isEmail = (s: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(s.trim());
const isStrongPwd = (s: string) => s.length >= 8;
const isNonEmpty = (s: string) => s.trim().length > 0;

/** Helpers to load/save the names map. */
async function loadNames(): Promise<Record<string, string>> {
  try {
    const raw = await AsyncStorage.getItem(NAMES_KEY);
    if (!raw) return {};
    const obj = JSON.parse(raw);
    return obj && typeof obj === 'object' ? (obj as Record<string, string>) : {};
  } catch {
    return {};
  }
}
async function saveNames(map: Record<string, string>) {
  await AsyncStorage.setItem(NAMES_KEY, JSON.stringify(map));
}

/**
 * Wrap your app with <AuthProvider> to make auth state/actions available.
 */
export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User>(null);
  const [loading, setLoading] = useState(true);

  // Rehydrate saved session on first mount (no deriving name from email).
  useEffect(() => {
    (async () => {
      try {
        const raw = await AsyncStorage.getItem(STORAGE_KEY);
        if (!raw) {
          setUser(null);
        } else {
          const parsed: any = JSON.parse(raw);
          if (parsed && typeof parsed.email === 'string') {
            const email = String(parsed.email).trim();
            const name =
              typeof parsed.name === 'string' ? String(parsed.name) : '';
            setUser({ email, name });
          } else {
            setUser(null);
          }
        }
      } catch (e) {
        console.warn('Auth: failed to read saved session', e);
        setUser(null);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  /** Login: validate, look up name by email (if previously registered), set session. */
  const signIn = useCallback(async (email: string, password: string) => {
    await new Promise((r) => setTimeout(r, 250)); // fake latency
    if (!isEmail(email)) throw new Error('Please enter a valid email address');
    if (!isStrongPwd(password))
      throw new Error('Password must be at least 8 characters');

    const trimmed = email.trim();
    const emailKey = trimmed.toLowerCase();

    // Pull any previously stored name for this email (if user registered earlier on this device).
    const names = await loadNames();
    const name = names[emailKey] ?? '';

    const u = { email: trimmed, name };
    setUser(u);
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(u));
  }, []);

  /** Registration: validate, save {email,name} to session AND remember the name in the names map. */
  const signUp = useCallback(
    async (email: string, password: string, name: string) => {
      await new Promise((r) => setTimeout(r, 250)); // fake latency
      if (!isEmail(email))
        throw new Error('Please enter a valid email address');
      if (!isStrongPwd(password))
        throw new Error('Password must be at least 8 characters');
      if (!isNonEmpty(name)) throw new Error('Please enter your name');

      const trimmedEmail = email.trim();
      const trimmedName = name.trim();
      const emailKey = trimmedEmail.toLowerCase();

      // Update the names map so future logins for this email show the registered name.
      const names = await loadNames();
      names[emailKey] = trimmedName;
      await saveNames(names);

      const u = { email: trimmedEmail, name: trimmedName };
      setUser(u);
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(u));
    },
    []
  );

  /** Sign out: clear only the current session; keep the names map. */
  const signOut = useCallback(async () => {
    setUser(null);
    await AsyncStorage.removeItem(STORAGE_KEY);
  }, []);

  const value = useMemo(
    () => ({ user, loading, signIn, signUp, signOut }),
    [user, loading, signIn, signUp, signOut]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

/** Access the auth context. Must be used under <AuthProvider>. */
export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
