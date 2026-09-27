import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import {
  getSession,
  signIn as signInApi,
  signOut as signOutApi,
  signUp as signUpApi,
  type AuthUser,
} from "@/lib/auth";

interface AuthContextValue {
  user: AuthUser | null;
  /** True until the session has been checked with the backend on the client. */
  isLoading: boolean;
  login: (email: string, password: string) => Promise<AuthUser>;
  register: (name: string, email: string, password: string) => Promise<AuthUser>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    getSession().then((session) => {
      if (!cancelled) {
        setUser(session);
        setIsLoading(false);
      }
    });
    return () => {
      cancelled = true;
    };
  }, []);

  const login = async (email: string, password: string) => {
    const loggedInUser = await signInApi({ email, password });
    setUser(loggedInUser);
    return loggedInUser;
  };

  const register = async (name: string, email: string, password: string) => {
    const newUser = await signUpApi({ name, email, password });
    setUser(newUser);
    return newUser;
  };

  const logout = async () => {
    await signOutApi();
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, isLoading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return ctx;
}
