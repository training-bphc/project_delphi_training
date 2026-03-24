import React, { createContext, useState, useEffect } from "react";
import type { ReactNode } from "react";

export type UserRole = "student" | "admin";

export interface User {
  id: string;
  email: string;
  role: UserRole;
  name?: string;
}

export interface AuthContextType {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  login: (idToken: string, role: UserRole) => Promise<void>;
  devLogin: (email: string, role: UserRole) => Promise<void>;
  logout: () => void;
}

export const AuthContext = createContext<AuthContextType | undefined>(
  undefined,
);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Load auth state from localStorage on mount
  useEffect(() => {
    const savedToken = localStorage.getItem("auth_token");
    const savedUser = localStorage.getItem("auth_user");

    if (savedToken && savedUser) {
      try {
        const parsed = JSON.parse(savedUser) as Partial<User> & {
          roll_number?: string;
          student_name?: string;
          admin_name?: string;
        };

        const inferredRole: UserRole =
          parsed.role ?? (parsed.admin_name ? "admin" : "student");

        const normalizedUser: User = {
          id: parsed.id || parsed.roll_number || parsed.email || "",
          email: parsed.email || "",
          role: inferredRole,
          name: parsed.name || parsed.student_name || parsed.admin_name,
        };

        if (normalizedUser.email && normalizedUser.id) {
          setToken(savedToken);
          setUser(normalizedUser);
          localStorage.setItem("auth_user", JSON.stringify(normalizedUser));
        } else {
          localStorage.removeItem("auth_token");
          localStorage.removeItem("auth_user");
        }
      } catch {
        localStorage.removeItem("auth_token");
        localStorage.removeItem("auth_user");
      }
    }

    setIsLoading(false);
  }, []);

  const parseJsonSafely = async (response: Response): Promise<any | null> => {
    const responseText = await response.text();

    if (!responseText) {
      return null;
    }

    try {
      return JSON.parse(responseText);
    } catch {
      return { message: responseText };
    }
  };

  const getErrorMessage = (response: Response, data: any): string => {
    if (data?.message) {
      return data.message;
    }

    if (response.status >= 500) {
      return "Backend is unavailable. Start the server (npm run dev in /server) and try again.";
    }

    return `Request failed: ${response.status} ${response.statusText}`;
  };

  const login = async (idToken: string, role: UserRole) => {
    setIsLoading(true);
    try {
      const response = await fetch("/api/auth/google", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id_token: idToken, role }),
      });

      const data = await parseJsonSafely(response);

      if (!response.ok || !data?.success) {
        throw new Error(getErrorMessage(response, data));
      }

      const { token: jwtToken, user: userData } = data;

      if (!jwtToken || !userData) {
        throw new Error("Invalid response from server");
      }

      const normalizedUser: User = {
        id: userData.roll_number || userData.email,
        email: userData.email,
        role,
        name: userData.student_name || userData.admin_name,
      };

      // Store token and normalized user
      localStorage.setItem("auth_token", jwtToken);
      localStorage.setItem("auth_user", JSON.stringify(normalizedUser));

      setToken(jwtToken);
      setUser(normalizedUser);
    } catch (error) {
      console.error("Login error:", error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    localStorage.removeItem("auth_token");
    localStorage.removeItem("auth_user");
    setToken(null);
    setUser(null);
  };

  const devLogin = async (email: string, role: UserRole) => {
    setIsLoading(true);
    try {
      const response = await fetch("/api/auth/dev-login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, role }),
      });

      const data = await parseJsonSafely(response);

      if (!response.ok || !data?.success) {
        throw new Error(getErrorMessage(response, data));
      }

      const { token: jwtToken, user: userData } = data;

      if (!jwtToken || !userData) {
        throw new Error("Invalid response from server");
      }

      const normalizedUser: User = {
        id: userData.roll_number || userData.email,
        email: userData.email,
        role,
        name: userData.student_name || userData.admin_name,
      };

      localStorage.setItem("auth_token", jwtToken);
      localStorage.setItem("auth_user", JSON.stringify(normalizedUser));

      setToken(jwtToken);
      setUser(normalizedUser);
    } catch (error) {
      console.error("Dev login error:", error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AuthContext.Provider
      value={{ user, token, isLoading, login, devLogin, logout }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = React.useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return context;
}
