"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode
} from "react";
import { useRouter } from "next/navigation";
import { refreshAuthSession, revokeAuthSession, type AuthSession } from "@/lib/supabase/auth-client";
import {
  clearStoredSession,
  persistSession,
  readStoredSession,
  type StoredSession
} from "@/lib/session/storage";
import { clearServerSession, syncServerSession } from "@/lib/supabase/browser";

interface SessionContextValue {
  session: StoredSession | null;
  ready: boolean;
  setAuthenticatedSession: (session: AuthSession) => Promise<void>;
  refresh: () => Promise<StoredSession | null>;
  signOut: () => Promise<void>;
}

const SessionContext = createContext<SessionContextValue | null>(null);

export function SessionProvider({ children }: { children: ReactNode }) {
  const router = useRouter();
  const [session, setSession] = useState<StoredSession | null>(null);
  const [ready, setReady] = useState(false);
  const activeRefresh = useRef<Promise<StoredSession | null> | null>(null);

  const setAuthenticatedSession = useCallback(async (authSession: AuthSession) => {
    const next = persistSession(authSession);
    try {
      await syncServerSession(next.accessToken);
      setSession(next);
    } catch (error) {
      clearStoredSession();
      throw error;
    }
  }, []);

  const refresh = useCallback(async (): Promise<StoredSession | null> => {
    if (activeRefresh.current) return activeRefresh.current;
    const stored = readStoredSession();
    if (!stored) return null;
    activeRefresh.current = refreshAuthSession(stored.refreshToken)
      .then(async (authSession) => {
        const next = persistSession(authSession);
        await syncServerSession(next.accessToken);
        setSession(next);
        return next;
      })
      .catch(async () => {
        clearStoredSession();
        await clearServerSession().catch(() => undefined);
        setSession(null);
        return null;
      })
      .finally(() => {
        activeRefresh.current = null;
      });
    return activeRefresh.current;
  }, []);

  const signOut = useCallback(async () => {
    const stored = readStoredSession();
    if (stored) await revokeAuthSession(stored.accessToken).catch(() => undefined);
    clearStoredSession();
    await clearServerSession().catch(() => undefined);
    setSession(null);
    router.replace("/login");
    router.refresh();
  }, [router]);

  useEffect(() => {
    let mounted = true;
    const restore = async () => {
      const stored = readStoredSession();
      if (!stored) {
        if (mounted) setReady(true);
        return;
      }
      try {
        const now = Math.floor(Date.now() / 1000);
        if (stored.expiresAt <= now + 60) await refresh();
        else {
          await syncServerSession(stored.accessToken);
          if (mounted) setSession(stored);
        }
      } catch {
        clearStoredSession();
        await clearServerSession().catch(() => undefined);
      } finally {
        if (mounted) setReady(true);
      }
    };
    void restore();
    return () => {
      mounted = false;
    };
  }, [refresh]);

  useEffect(() => {
    if (!session) return;
    const delay = Math.max(session.expiresAt * 1000 - Date.now() - 90_000, 5_000);
    const timer = window.setTimeout(() => void refresh(), delay);
    return () => window.clearTimeout(timer);
  }, [refresh, session]);

  const value = useMemo(
    () => ({ session, ready, setAuthenticatedSession, refresh, signOut }),
    [session, ready, setAuthenticatedSession, refresh, signOut]
  );
  return <SessionContext.Provider value={value}>{children}</SessionContext.Provider>;
}

export function useSession(): SessionContextValue {
  const context = useContext(SessionContext);
  if (!context) throw new Error("useSession должен использоваться внутри SessionProvider.");
  return context;
}
