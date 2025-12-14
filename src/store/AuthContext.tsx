import React, { createContext, useContext, useState, useEffect, type ReactNode } from "react";
import type { UserResponse } from "../types/auth.types";
import api from "../lib/axios";

interface AuthContextType {
  isAuthenticated: boolean;
  user: UserResponse | null;
  token: string | null;
  loading: boolean;              
  login: (token: string, user: UserResponse) => void;
  logout: () => void;
  hasRole: (roleName: string) => boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<UserResponse | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);  // ⬅️ ADD loading

  useEffect(() => {
    // Load từ localStorage đúng cách
    const savedToken = localStorage.getItem("accessToken");
    const savedUser = localStorage.getItem("user");

    if (savedToken && savedUser) {
      setToken(savedToken);
      setUser(JSON.parse(savedUser));

      // gán vào axios
      api.defaults.headers.common["Authorization"] = `Bearer ${savedToken}`;
    }

    setLoading(false);  // ⬅️ Hoàn tất load
  }, []);

  const isAuthenticated = !!token;

  const login = (newToken: string, newUser: UserResponse) => {
    localStorage.setItem("accessToken", newToken);
    localStorage.setItem("user", JSON.stringify(newUser));

    setToken(newToken);
    setUser(newUser);

    api.defaults.headers.common["Authorization"] = `Bearer ${newToken}`;
  };

  const logout = () => {
    localStorage.removeItem("accessToken");
    localStorage.removeItem("user");

    setToken(null);
    setUser(null);

    delete api.defaults.headers.common["Authorization"];
  };

  const hasRole = (roleName: string): boolean => {
    if (!user || !user.roles) {
      return false;
    }
    // Kiểm tra xem mảng 'roles' của user có chứa 'roleName' không
    return user.roles.includes(roleName);
  };

  return (
    <AuthContext.Provider 
      value={{ 
        isAuthenticated, 
        user, 
        token, 
        loading, 
        login, 
        logout, 
        hasRole 
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used inside AuthProvider");
  return context;
};
