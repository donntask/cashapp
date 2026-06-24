'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';

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

  // Load auth data from localStorage on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem('bushfi_auth_data');
      if (stored) {
        const parsed = JSON.parse(stored);
        setAuthData(parsed);
      }
    } catch (error) {
      console.error('[v0] Failed to load auth data:', error);
    }
  }, []);

  // Check for dev hash changes
  useEffect(() => {
    const handleHashChange = () => {
      if (window.location.hash === '#dev') {
        setIsAuthenticated(true);
      }
    };
    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  const updateAuthData = (data: Partial<AuthState>) => {
    setAuthData((prev) => {
      const updated = { ...prev, ...data };
      // Persist to localStorage immediately
      try {
        localStorage.setItem('bushfi_auth_data', JSON.stringify(updated));
      } catch (error) {
        console.error('[v0] Failed to save auth data:', error);
      }
      return updated;
    });
  };

  const resetAuth = () => {
    setAuthData(initialAuthState);
    setIsAuthenticated(false);
    try {
      localStorage.removeItem('bushfi_auth_data');
    } catch (error) {
      console.error('[v0] Failed to clear auth data:', error);
    }
  };

  const completeAuth = () => {
    setIsAuthenticated(true);
    // Also save user data to app data storage
    try {
      const appData = localStorage.getItem('bushfi_app_data');
      let data = appData ? JSON.parse(appData) : { user: null, cashBalance: 0, savingsBalance: 0, bankAccount: null, transactions: [], lastUpdated: Date.now() };
      data.user = {
        firstName: authData.firstName,
        lastName: authData.lastName,
        cashtag: authData.cashtag,
        phoneNumber: authData.contact,
        email: authData.email,
        zipCode: authData.zipCode,
      };
      data.lastUpdated = Date.now();
      localStorage.setItem('bushfi_app_data', JSON.stringify(data));
    } catch (error) {
      console.error('[v0] Failed to save app data:', error);
    }
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
