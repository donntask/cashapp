'use client';

import { useEffect, useState } from 'react';
import { AppData, DEFAULT_APP_DATA } from '@/types/app-data';

const STORAGE_KEY = 'bushfi_app_data';

export function useAppData() {
  const [data, setData] = useState<AppData>(DEFAULT_APP_DATA);
  const [isLoaded, setIsLoaded] = useState(false);

  // Load data from localStorage on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        setData(parsed);
      }
      setIsLoaded(true);
    } catch (error) {
      console.error('[v0] Failed to load app data from localStorage:', error);
      setIsLoaded(true);
    }
  }, []);

  // Save data to localStorage whenever it changes
  const saveData = (newData: AppData) => {
    try {
      const updated = { ...newData, lastUpdated: Date.now() };
      setData(updated);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    } catch (error) {
      console.error('[v0] Failed to save app data to localStorage:', error);
    }
  };

  return {
    data,
    isLoaded,
    saveData,
  };
}
