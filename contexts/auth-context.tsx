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
  completeAuthWithFirestore: (uid: string) => Promise<void>;
  isOtpVerified: boolean;
  setIsOtpVerified: (verified: boolean) => void;
  isNewUser: boolean;
  setIsNewUser: (isNew: boolean) => void;
  verifiedEmail: string;
  setVerifiedEmail: (email: string) => void;
  userId: string;
  setUserId: (id: string) => void;
  isAdmin: boolean;
  setIsAdmin: (admin: boolean) => void;
  sessionPersisted: boolean;
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

// Try to restore session from localStorage immediately
const getInitialAuthState = () => {
  if (typeof window === 'undefined') return { authenticated: false, persisted: false };
  
  try {
    const stored = localStorage.getItem('cashapp_auth_data');
    const devSession = localStorage.getItem('cashapp_dev_session');
    
    if (stored) {
      return { authenticated: true, persisted: true };
    }
    
    if (devSession === 'true') {
      return { authenticated: true, persisted: true };
    }
  } catch (error) {
    console.error('[v0] Failed to load auth data:', error);
  }
  
  return { authenticated: window.location.hash === '#dev', persisted: false };
};

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const initialState = getInitialAuthState();
  
  const [authData, setAuthData] = useState<AuthState>(initialAuthState);
  const [isAuthenticated, setIsAuthenticated] = useState(initialState.authenticated);
  const [isOtpVerified, setIsOtpVerified] = useState(false);
  const [isNewUser, setIsNewUser] = useState(true);
  const [verifiedEmail, setVerifiedEmail] = useState('');
  const [userId, setUserId] = useState('');
  const [isAdmin, setIsAdmin] = useState(false);
  const [sessionPersisted, setSessionPersisted] = useState(initialState.persisted);

  // Load auth data from localStorage on mount and restore session
  useEffect(() => {
    try {
      const stored = localStorage.getItem('cashapp_auth_data');
      const adminStatus = localStorage.getItem('cashapp_admin');
      const userIdStored = localStorage.getItem('cashapp_user_id');
      
      if (stored) {
        const parsed = JSON.parse(stored);
        setAuthData(parsed);
        setIsAuthenticated(true);
        setSessionPersisted(true);
      }
      
      if (adminStatus === 'true') {
        setIsAdmin(true);
      }
      
      if (userIdStored) {
        setUserId(userIdStored);
      }
    } catch (error) {
      console.error('[v0] Failed to load auth data:', error);
    }
  }, []);

  // Check for dev hash changes and save dev session immediately
  useEffect(() => {
    const saveDevSession = () => {
      if (typeof window !== 'undefined' && window.location.hash === '#dev') {
        setIsAuthenticated(true);
        setSessionPersisted(true);
        // Save mock auth data for dev mode
        try {
          const mockAuthData = {
            firstName: 'Dev',
            lastName: 'User',
            email: 'dev@example.com',
            cashtag: 'devuser',
            contact: '5551234567',
            zipCode: '10001'
          };
          localStorage.setItem('cashapp_auth_data', JSON.stringify(mockAuthData));
          localStorage.setItem('cashapp_dev_session', 'true');
        } catch (error) {
          console.error('[v0] Failed to save dev session:', error);
        }
      }
    };
    
    // Save on mount
    saveDevSession();
    
    // Also listen for hash changes
    window.addEventListener('hashchange', saveDevSession);
    return () => window.removeEventListener('hashchange', saveDevSession);
  }, []);

  const updateAuthData = (data: Partial<AuthState>) => {
    setAuthData((prev) => {
      const updated = { ...prev, ...data };
      // Persist to localStorage immediately
      try {
        localStorage.setItem('cashapp_auth_data', JSON.stringify(updated));
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
      localStorage.removeItem('cashapp_auth_data');
    } catch (error) {
      console.error('[v0] Failed to clear auth data:', error);
    }
  };

  const completeAuth = () => {
    setIsAuthenticated(true);
    setSessionPersisted(true);
    // Persist user data to app data storage
    try {
      const appData = localStorage.getItem('cashapp_app_data');
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
      localStorage.setItem('cashapp_app_data', JSON.stringify(data));
      localStorage.setItem('cashapp_auth_data', JSON.stringify(authData));
    } catch (error) {
      console.error('[v0] Failed to save app data:', error);
    }
  };

  const completeAuthWithFirestore = async (uid: string, isAdminUser: boolean = false) => {
    try {
      // Create user profile in Firestore
      const response = await fetch('/api/auth/setup-user', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          uid,
          email: authData.email,
          firstName: authData.firstName,
          lastName: authData.lastName,
          cashtag: authData.cashtag,
          zipCode: authData.zipCode,
          isAdmin: isAdminUser,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to setup user in Firestore');
      }

      setUserId(uid);
      setIsAdmin(isAdminUser);
      
      // Persist admin status and user ID
      localStorage.setItem('cashapp_user_id', uid);
      if (isAdminUser) {
        localStorage.setItem('cashapp_admin', 'true');
      }
      
      completeAuth();
    } catch (error) {
      console.error('[v0] Failed to complete auth with Firestore:', error);
      throw error;
    }
  };

  const value: AuthContextType = {
    authData,
    updateAuthData,
    resetAuth,
    isAuthenticated,
    completeAuth,
    completeAuthWithFirestore,
    isOtpVerified,
    setIsOtpVerified,
    isNewUser,
    setIsNewUser,
    verifiedEmail,
    setVerifiedEmail,
    userId,
    setUserId,
    isAdmin,
    setIsAdmin,
    sessionPersisted,
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
