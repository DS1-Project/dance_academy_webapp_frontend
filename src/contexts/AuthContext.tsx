import { createContext, useContext, useState, ReactNode } from "react";
import {
  getMeRequest,
  loginRequest,
  mapBackendUserToUser,
  registerRequest,
  updateMeRequest,
} from "@/services/authService";
import { getApiErrorMessage, tokenStorage } from "@/lib/api";
import type { User, UserRole } from "@/types/auth";

export type { User, UserRole };

interface AuthContextType {
  user: User | null;
  login: (
    email: string,
    password: string,
    captchaToken: string
  ) => Promise<{ success: boolean; error?: string; user?: { role?: string } }>;
  register: (
    name: string,
    email: string,
    password: string,
    passwordConfirm: string,
    role?: "client" | "teacher"
  ) => Promise<{ success: boolean; error?: string; pendingApproval?: boolean }>;
  updateProfile: (payload: {
    firstName: string;
    lastName: string;
  }) => Promise<{ success: boolean; error?: string }>;
  refreshUser: () => Promise<void>;
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

  const persistUser = (mappedUser: User) => {
    setUser(mappedUser);
    localStorage.setItem("danceflow_user", JSON.stringify(mappedUser));
  };

  const login = async (email: string, password: string, captchaToken: string) => {
    setIsLoading(true);
    try {
      const data = await loginRequest({
        email,
        password,
        captcha_token: captchaToken,
      });

      tokenStorage.setTokens(data.access, data.refresh);
      const mappedUser = mapBackendUserToUser(data.user);
      persistUser(mappedUser);

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
    passwordConfirm: string,
    role: "client" | "teacher" = "client"
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
        role,
      });

      return { success: true, pendingApproval: role === "teacher" };
    } catch (error) {
      return { success: false, error: getApiErrorMessage(error, "Error al registrarse") };
    } finally {
      setIsLoading(false);
    }
  };

  const updateProfile = async (payload: { firstName: string; lastName: string }) => {
    setIsLoading(true);
    try {
      const data = await updateMeRequest({
        first_name: payload.firstName,
        last_name: payload.lastName,
      });
      persistUser(mapBackendUserToUser(data));
      return { success: true };
    } catch (error) {
      return { success: false, error: getApiErrorMessage(error, "No se pudo actualizar el perfil") };
    } finally {
      setIsLoading(false);
    }
  };

  const refreshUser = async () => {
    try {
      const data = await getMeRequest();
      persistUser(mapBackendUserToUser(data));
    } catch {
      // Session may be stale; keep cached user until next explicit login/logout.
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem("danceflow_user");
    tokenStorage.clear();
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        login,
        register,
        updateProfile,
        refreshUser,
        logout,
        isAuthenticated: !!user,
        isLoading,
      }}
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
