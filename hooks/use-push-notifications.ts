'use client';

import { useEffect, useRef } from 'react';

export function usePushNotifications() {
  const permissionRef = useRef<NotificationPermission | null>(null);

  useEffect(() => {
    if (typeof window === 'undefined' || !('Notification' in window)) return;
    permissionRef.current = Notification.permission;

    if (Notification.permission === 'default') {
      // Request on first interaction rather than on load — just store the state
      Notification.requestPermission().then((perm) => {
        permissionRef.current = perm;
      });
    }
  }, []);

  const notify = (title: string, body: string, icon = '/icon-192.png') => {
    if (typeof window === 'undefined' || !('Notification' in window)) return;
    if (Notification.permission === 'granted') {
      try {
        new Notification(title, { body, icon });
      } catch {
        // Safari on iOS doesn't support new Notification()
      }
    }
  };

  const requestPermission = async (): Promise<boolean> => {
    if (typeof window === 'undefined' || !('Notification' in window)) return false;
    if (Notification.permission === 'granted') return true;
    const perm = await Notification.requestPermission();
    permissionRef.current = perm;
    return perm === 'granted';
  };

  return { notify, requestPermission };
}
