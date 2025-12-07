import React, { createContext, useContext, useState, useCallback } from "react";
import { ADMIN_CREDENTIALS, FLAT_RANGES } from "@/config/auth";

type UserRole = "admin" | "resident" | null;

interface AuthState {
  isAuthenticated: boolean;
  role: UserRole;
  flatNumber: string | null;
}

interface AuthContextType extends AuthState {
  loginAsAdmin: (username: string, password: string) => boolean;
  loginAsResident: (flatNumber: string) => boolean;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [authState, setAuthState] = useState<AuthState>({
    isAuthenticated: false,
    role: null,
    flatNumber: null,
  });

  const loginAsAdmin = useCallback((username: string, password: string): boolean => {
    if (
      username === ADMIN_CREDENTIALS.username &&
      password === ADMIN_CREDENTIALS.password
    ) {
      setAuthState({
        isAuthenticated: true,
        role: "admin",
        flatNumber: null,
      });
      return true;
    }
    return false;
  }, []);

  const loginAsResident = useCallback((flatNumber: string): boolean => {
    if (FLAT_RANGES.isValidFlat(flatNumber)) {
      setAuthState({
        isAuthenticated: true,
        role: "resident",
        flatNumber,
      });
      return true;
    }
    return false;
  }, []);

  const logout = useCallback(() => {
    setAuthState({
      isAuthenticated: false,
      role: null,
      flatNumber: null,
    });
  }, []);

  return (
    <AuthContext.Provider
      value={{
        ...authState,
        loginAsAdmin,
        loginAsResident,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
