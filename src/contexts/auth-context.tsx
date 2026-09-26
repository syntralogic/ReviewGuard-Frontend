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
  /** True until the session has been read from localStorage on the client. */
  isLoading: boolean;
  login: (email: string, password: string) => AuthUser;
  register: (name: string, email: string, password: string) => AuthUser;
  logout: () => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    setUser(getSession());
    setIsLoading(false);
  }, []);

  const login = (email: string, password: string) => {
    const loggedInUser = signInApi({ email, password });
    setUser(loggedInUser);
    return loggedInUser;
  };

  const register = (name: string, email: string, password: string) => {
    const newUser = signUpApi({ name, email, password });
    setUser(newUser);
    return newUser;
  };

  const logout = () => {
    signOutApi();
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
