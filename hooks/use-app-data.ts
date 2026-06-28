'use client';

import { useEffect, useState, useCallback } from 'react';
import { getUserAccount, getUserProfile } from '@/lib/firestore-service';
import { useAuth } from '@/contexts/auth-context';

export interface AppData {
  cashBalance: number;
  savingsBalance: number;
  firstName: string;
  lastName: string;
  cashtag: string;
  email: string;
}

const DEFAULT_APP_DATA: AppData = {
  cashBalance: 0,
  savingsBalance: 0,
  firstName: '',
  lastName: '',
  cashtag: '',
  email: '',
};

export function useAppData() {
  const { userId } = useAuth();
  const [data, setData] = useState<AppData>(DEFAULT_APP_DATA);
  const [isLoaded, setIsLoaded] = useState(false);

  const loadData = useCallback(async () => {
    if (!userId) {
      setIsLoaded(true);
      return;
    }
    try {
      const [account, profile] = await Promise.all([
        getUserAccount(userId),
        getUserProfile(userId),
      ]);
      setData({
        cashBalance: account?.cashBalance ?? 0,
        savingsBalance: account?.savingsBalance ?? 0,
        firstName: profile?.firstName ?? '',
        lastName: profile?.lastName ?? '',
        cashtag: profile?.cashtag ?? '',
        email: profile?.email ?? '',
      });
    } catch (error) {
      console.error('[v0] useAppData: failed to load from Firestore:', error);
    } finally {
      setIsLoaded(true);
    }
  }, [userId]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  return { data, isLoaded, reload: loadData };
}
