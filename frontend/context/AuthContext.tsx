"use client";

import React, { createContext, useContext, useState } from "react";
import { useRouter } from "next/navigation";

type Role = "admin" | "user";

interface User {
  id: string;
  username: string;
  full_name: string;
  email: string;
  role: Role;
  student_id?: string | null;
  career?: string | null;
  semester?: number | null;
  phone?: string | null;
  phone_verified?: boolean;
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

const AuthContext = createContext<AuthContextType | undefined>(undefined);

function readStoredSession(): AuthSession | null {
  if (typeof window === "undefined") return null;

  const raw = window.localStorage.getItem(AUTH_STORAGE_KEY);
  if (!raw) return null;

  try {
    const parsed = JSON.parse(raw) as AuthSession;
    if (!parsed?.accessToken || !parsed?.user) return null;
    return parsed;
  } catch {
    return null;
  }
}

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [session, setSession] = useState<AuthSession | null>(() => readStoredSession());
  const router = useRouter();

  const login = (newSession: AuthSession) => {
    setSession(newSession);
    localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(newSession));
    router.push("/");
  };

  const logout = () => {
    setSession(null);
    localStorage.removeItem(AUTH_STORAGE_KEY);
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
        isLoading: false,
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
