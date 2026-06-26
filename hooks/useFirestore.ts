'use client';

import { useAuth } from '@/contexts/auth-context';
import {
  getUserProfile,
  getUserAccount,
  getUserTransactions,
  getUserContacts,
  addTransaction,
  addContact,
  updateCashBalance,
  updateSavingsBalance,
  updateUserProfile,
  searchUserByCashtag,
  type Transaction,
  type Contact,
  type UserProfile,
  type Account,
} from '@/lib/firestore-service';

export function useFirestore() {
  const { userId } = useAuth();

  if (!userId) {
    throw new Error('useFirestore must be used within authenticated context');
  }

  return {
    userId,
    getUserProfile: () => getUserProfile(userId),
    getUserAccount: () => getUserAccount(userId),
    getUserTransactions: () => getUserTransactions(userId),
    getUserContacts: () => getUserContacts(userId),
    addTransaction: (transaction: Omit<Transaction, 'id'>) =>
      addTransaction(userId, transaction),
    addContact: (contact: Omit<Contact, 'id'>) => addContact(userId, contact),
    updateCashBalance: (amount: number) => updateCashBalance(userId, amount),
    updateSavingsBalance: (amount: number) => updateSavingsBalance(userId, amount),
    updateUserProfile: (updates: Partial<UserProfile>) =>
      updateUserProfile(userId, updates),
    searchUserByCashtag,
  };
}
