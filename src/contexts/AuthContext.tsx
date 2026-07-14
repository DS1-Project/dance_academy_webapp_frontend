import { createContext, useContext, useState, ReactNode } from "react";
import { loginRequest, registerRequest, mapBackendUserToUser } from "@/services/authService";
import { getApiErrorMessage, tokenStorage } from "@/lib/api";
import type { User, UserRole } from "@/types/auth";

export type { User, UserRole };

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string; user?: { role?: string } }>;
  register: (
    name: string,
    email: string,
    password: string,
    passwordConfirm: string
  ) => Promise<{ success: boolean; error?: string; pendingApproval?: boolean }>;
  logout: () => void;
  isAuthenticated: boolean;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(() => {
    const saved = localStorage.getItem("danceflow_user");
    return saved ? JSON.parse(saved) : null;
  });
  const [isLoading, setIsLoading] = useState(false);

  const login = async (email: string, password: string) => {
    setIsLoading(true);
    try {
      const data = await loginRequest({
        email,
        password,
        captcha_token: import.meta.env.VITE_CAPTCHA_DEV_TOKEN ?? "dev-bypass",
      });

      tokenStorage.setTokens(data.access, data.refresh);
      const mappedUser = mapBackendUserToUser(data.user);
      setUser(mappedUser);
      localStorage.setItem("danceflow_user", JSON.stringify(mappedUser));

      return { success: true, user: data.user };
    } catch (error) {
      return { success: false, error: getApiErrorMessage(error, "Error al iniciar sesión") };
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (
    name: string,
    email: string,
    password: string,
    passwordConfirm: string
  ) => {
    setIsLoading(true);
    try {
      const [firstName, ...rest] = name.trim().split(/\s+/);
      const lastName = rest.join(" ");

      await registerRequest({
        email,
        password,
        password_confirm: passwordConfirm,
        first_name: firstName,
        last_name: lastName,
      });

      return { success: true, pendingApproval: true };
    } catch (error) {
      return { success: false, error: getApiErrorMessage(error, "Error al registrarse") };
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem("danceflow_user");
    tokenStorage.clear();
  };

  return (
    <AuthContext.Provider
      value={{ user, login, register, logout, isAuthenticated: !!user, isLoading }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
