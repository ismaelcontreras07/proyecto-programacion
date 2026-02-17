"use client";

import React, { createContext, useContext, useSyncExternalStore } from "react";
import { useRouter } from "next/navigation";

type Role = "admin" | "user";

interface User {
  id: string;
  username: string;
  full_name: string;
  role: Role;
  student_id?: string | null;
  career?: string | null;
  semester?: number | null;
}

interface AuthSession {
  accessToken: string;
  user: User;
}

interface AuthContextType {
  user: User | null;
  accessToken: string | null;
  login: (session: AuthSession) => void;
  logout: () => void;
  isAuthenticated: boolean;
  isLoading: boolean;
}

const AUTH_STORAGE_KEY = "auth_session";
const AUTH_SESSION_CHANGED_EVENT = "auth-session-changed";

const AuthContext = createContext<AuthContextType | undefined>(undefined);

let cachedSessionRaw: string | null | undefined;
let cachedSessionValue: AuthSession | null = null;

function readStoredSession(): AuthSession | null {
  if (typeof window === "undefined") return null;

  const raw = window.localStorage.getItem(AUTH_STORAGE_KEY);
  if (raw === cachedSessionRaw) {
    return cachedSessionValue;
  }

  cachedSessionRaw = raw;
  if (!raw) {
    cachedSessionValue = null;
    return null;
  }

  try {
    const parsed = JSON.parse(raw) as AuthSession;
    if (!parsed?.accessToken || !parsed?.user) {
      cachedSessionValue = null;
      return null;
    }
    cachedSessionValue = parsed;
    return parsed;
  } catch {
    cachedSessionValue = null;
    return null;
  }
}

function emitAuthSessionChanged(): void {
  if (typeof window === "undefined") return;
  window.dispatchEvent(new Event(AUTH_SESSION_CHANGED_EVENT));
}

function subscribeAuthSession(callback: () => void): () => void {
  if (typeof window === "undefined") {
    return () => {};
  }

  const onStorage = (event: StorageEvent) => {
    if (event.key === AUTH_STORAGE_KEY) {
      callback();
    }
  };

  const onSessionChanged = () => callback();

  window.addEventListener("storage", onStorage);
  window.addEventListener(AUTH_SESSION_CHANGED_EVENT, onSessionChanged);

  return () => {
    window.removeEventListener("storage", onStorage);
    window.removeEventListener(AUTH_SESSION_CHANGED_EVENT, onSessionChanged);
  };
}

function getAuthSessionSnapshot(): AuthSession | null {
  return readStoredSession();
}

function getAuthSessionServerSnapshot(): AuthSession | null {
  return null;
}

function subscribeNoop(): () => void {
  return () => {};
}

function getClientReadySnapshot(): boolean {
  return true;
}

function getClientReadyServerSnapshot(): boolean {
  return false;
}

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const session = useSyncExternalStore(
    subscribeAuthSession,
    getAuthSessionSnapshot,
    getAuthSessionServerSnapshot,
  );
  const isClientReady = useSyncExternalStore(
    subscribeNoop,
    getClientReadySnapshot,
    getClientReadyServerSnapshot,
  );
  const router = useRouter();

  const login = (newSession: AuthSession) => {
    localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(newSession));
    emitAuthSessionChanged();
    if (newSession.user.role === "admin") {
      router.push("/dashboard");
      return;
    }
    router.push("/");
  };

  const logout = () => {
    localStorage.removeItem(AUTH_STORAGE_KEY);
    emitAuthSessionChanged();
    router.push("/login");
  };

  return (
    <AuthContext.Provider
      value={{
        user: session?.user ?? null,
        accessToken: session?.accessToken ?? null,
        login,
        logout,
        isAuthenticated: !!session?.user,
        isLoading: !isClientReady,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
