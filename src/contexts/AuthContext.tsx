import { createContext, useContext, useState, useCallback, useEffect, type ReactNode } from "react";
import { getSavedSession, signUp, signIn, signOut } from "../api/client";

interface User {
  id: string;
  name: string;
  username: string;
  email: string;
}

interface AuthContextType {
  user: User | null;
  isAuthPageOpen: boolean;
  openAuthPage: () => void;
  closeAuthPage: () => void;
  login: (username: string, password: string) => Promise<boolean>;
  register: (name: string, username: string, password: string) => Promise<boolean>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType>({} as AuthContextType);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isAuthPageOpen, setIsAuthPageOpen] = useState(false);
  const [loading, setLoading] = useState(true);

  // Restore session from localStorage on mount
  useEffect(() => {
    const saved = getSavedSession();
    if (saved) setUser(saved as User);
    setLoading(false);
  }, []);

  const openAuthPage = useCallback(() => setIsAuthPageOpen(true), []);
  const closeAuthPage = useCallback(() => setIsAuthPageOpen(false), []);

  const login = useCallback(async (username: string, password: string): Promise<boolean> => {
    const { user: u } = await signIn(username, password);
    setUser(u as User);
    return true;
  }, []);

  const register = useCallback(async (name: string, username: string, password: string): Promise<boolean> => {
    const { user: u } = await signUp(name, username, password);
    setUser(u as User);
    return true;
  }, []);

  const logout = useCallback(async () => {
    await signOut();
    setUser(null);
  }, []);

  if (loading) {
    return <>{children}</>;
  }

  return (
    <AuthContext.Provider
      value={{ user, isAuthPageOpen, openAuthPage, closeAuthPage, login, register, logout }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
