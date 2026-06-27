'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { getUserProfile } from '@/lib/firestore-service';

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

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [authData, setAuthData] = useState<AuthState>(initialAuthState);
  const [isAuthenticated, setIsAuthenticated] = useState(
    typeof window !== 'undefined' && window.location.hash === '#dev'
  );
  const [isOtpVerified, setIsOtpVerified] = useState(false);
  const [isNewUser, setIsNewUser] = useState(true);
  const [verifiedEmail, setVerifiedEmail] = useState('');
  const [userId, setUserId] = useState('');
  const [isAdmin, setIsAdmin] = useState(false);
  const [sessionPersisted, setSessionPersisted] = useState(false);

  // Load auth data from localStorage on mount and restore session
  useEffect(() => {
    const restoreSession = async () => {
      try {
        const userIdStored = localStorage.getItem('cashapp_user_id');
        const SUPER_ADMIN_EMAIL = 'no-reply@cashappfi.online';
        
        // If we have a user ID, fetch their profile from Firestore to get admin status
        if (userIdStored) {
          try {
            const userProfile = await getUserProfile(userIdStored);
            if (userProfile) {
              setUserId(userIdStored);
              
              // Restore auth data from localStorage
              const stored = localStorage.getItem('cashapp_auth_data');
              if (stored) {
                const parsed = JSON.parse(stored);
                setAuthData(parsed);
                
                // Check if email is super admin
                const isSuperAdmin = parsed.email?.toLowerCase() === SUPER_ADMIN_EMAIL.toLowerCase();
                setIsAdmin(userProfile.isAdmin || isSuperAdmin);
              }
              
              setIsAuthenticated(true);
              setSessionPersisted(true);
            }
          } catch (error) {
            console.error('[v0] Error fetching user profile from Firestore:', error);
            // Fallback to localStorage
            const stored = localStorage.getItem('cashapp_auth_data');
            const adminStatus = localStorage.getItem('cashapp_admin');
            
            if (stored) {
              const parsed = JSON.parse(stored);
              setAuthData(parsed);
              
              // Check if email is super admin
              const isSuperAdmin = parsed.email?.toLowerCase() === SUPER_ADMIN_EMAIL.toLowerCase();
              setIsAdmin(adminStatus === 'true' || isSuperAdmin);
              
              setIsAuthenticated(true);
              setSessionPersisted(true);
            }
          }
        }
      } catch (error) {
        console.error('[v0] Failed to load auth data:', error);
      }
    };

    restoreSession();
  }, []);

  // Check for dev hash changes
  useEffect(() => {
    const handleHashChange = () => {
      if (window.location.hash === '#dev') {
        setIsAuthenticated(true);
        setIsAdmin(true); // Enable admin mode in dev
      }
    }
    
    // Check initial hash on mount
    if (window.location.hash === '#dev') {
      setIsAuthenticated(true);
      setIsAdmin(true);
    }
    
    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
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
      // Check if email is super admin email
      const SUPER_ADMIN_EMAIL = 'no-reply@cashappfi.online';
      const isSuperAdmin = authData.email?.toLowerCase() === SUPER_ADMIN_EMAIL.toLowerCase();
      const finalIsAdmin = isAdminUser || isSuperAdmin;

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
          isAdmin: finalIsAdmin,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to setup user in Firestore');
      }

      setUserId(uid);
      setIsAdmin(finalIsAdmin);
      
      // Persist admin status and user ID
      localStorage.setItem('cashapp_user_id', uid);
      if (finalIsAdmin) {
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
