import { createContext, useContext, useState, ReactNode } from "react";

export type UserRole = "admin" | "director" | "profesor" | "cliente";

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  avatar?: string;
}

export const testUsers: User[] = [
  { id: "1", name: "Admin Principal", email: "admin@danceflow.com", role: "admin" },
  { id: "2", name: "Director Martínez", email: "director@danceflow.com", role: "director" },
  { id: "3", name: "María García", email: "maria@danceflow.com", role: "profesor" },
  { id: "4", name: "Carlos Fuentes", email: "carlos@danceflow.com", role: "profesor" },
  { id: "5", name: "Laura Pérez", email: "laura@danceflow.com", role: "cliente" },
  { id: "6", name: "Juan Torres", email: "juan@danceflow.com", role: "cliente" },
];

// All test users use password: "dance123"
const TEST_PASSWORD = "dance123";

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => { success: boolean; error?: string };
  register: (name: string, email: string, password: string) => { success: boolean; error?: string };
  logout: () => void;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(() => {
    const saved = localStorage.getItem("danceflow_user");
    return saved ? JSON.parse(saved) : null;
  });

  const login = (email: string, password: string) => {
    if (password !== TEST_PASSWORD) {
      return { success: false, error: "Contraseña incorrecta" };
    }
    const found = testUsers.find((u) => u.email === email);
    if (!found) {
      return { success: false, error: "Usuario no encontrado" };
    }
    setUser(found);
    localStorage.setItem("danceflow_user", JSON.stringify(found));
    return { success: true };
  };

  const register = (name: string, email: string, _password: string) => {
    if (testUsers.find((u) => u.email === email)) {
      return { success: false, error: "Este correo ya está registrado" };
    }
    const newUser: User = {
      id: Date.now().toString(),
      name,
      email,
      role: "cliente",
    };
    setUser(newUser);
    localStorage.setItem("danceflow_user", JSON.stringify(newUser));
    return { success: true };
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem("danceflow_user");
  };

  return (
    <AuthContext.Provider value={{ user, login, register, logout, isAuthenticated: !!user }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
