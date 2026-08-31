"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import { useRouter } from "next/navigation";
import { clearToken, getToken, onUnauthorized, setToken } from "@/services/api";
import { login as loginRequest, signup as signupRequest } from "@/services/authApi";
import type { PublicUser } from "@/types/api";
import type { LoginInput, SignupInput } from "@/services/authApi";

interface AuthContextValue {
  user: PublicUser | null;
  isLoading: boolean;
  login: (input: LoginInput) => Promise<void>;
  signup: (input: SignupInput) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

const USER_STORAGE_KEY = "ecotrack_user";

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<PublicUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  const logout = useCallback(() => {
    clearToken();
    window.localStorage.removeItem(USER_STORAGE_KEY);
    setUser(null);
    router.push("/login");
  }, [router]);

  useEffect(() => {
    const token = getToken();
    const storedUser = window.localStorage.getItem(USER_STORAGE_KEY);
    if (token && storedUser) {
      setUser(JSON.parse(storedUser) as PublicUser);
    }
    setIsLoading(false);
  }, []);

  useEffect(() => {
    onUnauthorized(() => {
      window.localStorage.removeItem(USER_STORAGE_KEY);
      setUser(null);
      router.push("/login");
    });
  }, [router]);

  const login = useCallback(async (input: LoginInput) => {
    const { token, user } = await loginRequest(input);
    setToken(token);
    window.localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(user));
    setUser(user);
  }, []);

  const signup = useCallback(async (input: SignupInput) => {
    const { token, user } = await signupRequest(input);
    setToken(token);
    window.localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(user));
    setUser(user);
  }, []);

  return (
    <AuthContext.Provider value={{ user, isLoading, login, signup, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextValue {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
