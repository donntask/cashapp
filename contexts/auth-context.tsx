'use client';

import React, { createContext, useContext, useState } from 'react';

export interface AuthState {
  contact: string;
  email: string;
  firstName: string;
  lastName: string;
  cashtag: string;
  zipCode: string;
  cardNumber: string;
}

export interface AuthContextType {
  authData: AuthState;
  updateAuthData: (data: Partial<AuthState>) => void;
  resetAuth: () => void;
  isAuthenticated: boolean;
  completeAuth: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const initialAuthState: AuthState = {
  contact: '',
  email: '',
  firstName: '',
  lastName: '',
  cashtag: '',
  zipCode: '',
  cardNumber: '',
};

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [authData, setAuthData] = useState<AuthState>(initialAuthState);
  const [isAuthenticated, setIsAuthenticated] = useState(
    typeof window !== 'undefined' && window.location.hash === '#dev'
  );

  const updateAuthData = (data: Partial<AuthState>) => {
    setAuthData((prev) => ({ ...prev, ...data }));
  };

  const resetAuth = () => {
    setAuthData(initialAuthState);
    setIsAuthenticated(false);
  };

  const completeAuth = () => {
    setIsAuthenticated(true);
  };

  const value: AuthContextType = {
    authData,
    updateAuthData,
    resetAuth,
    isAuthenticated,
    completeAuth,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
}
