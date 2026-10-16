import { createContext, useContext, useState, type ReactNode } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { useMe } from '../hooks/useAuth';
import type { MeResponse } from '../api/auth.api';


interface AuthContextValue {
  token: string | null;
  user: MeResponse['data'] | undefined;
  isAuthLoading: boolean;
  login: (token: string) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  // Lazy initializer so we read localStorage once, not on every render.
  const [token, setToken] = useState<string | null>(() => localStorage.getItem('token'));
  const queryClient = useQueryClient();

 
  // Only fires the /me request once a token exists — logged-out visitors never call it.
  const { data, isLoading } = useMe(!!token);

    const login = (newToken: string) => {
    localStorage.setItem('token', newToken);
    setToken(newToken);
  };


   const logout = () => {
    localStorage.removeItem('token');
    setToken(null);
    queryClient.removeQueries({ queryKey: ['me'] });
  };

   return (
    <AuthContext.Provider
      value={{ token, user: data?.data, isAuthLoading: !!token && isLoading, login, logout }}
    >
      {children}
    </AuthContext.Provider>
  );
};


export const useAuthContext = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuthContext must be used within an AuthProvider');
  return ctx;
};










