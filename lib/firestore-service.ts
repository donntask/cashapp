import {
  doc,
  setDoc,
  getDoc,
  updateDoc,
  addDoc,
  collection,
  query,
  where,
  getDocs,
  Timestamp,
  arrayUnion,
} from 'firebase/firestore';
import { db } from './firebase-config';

export interface UserProfile {
  uid: string;
  email: string;
  firstName: string;
  lastName: string;
  cashtag: string;
  zipCode: string;
  phoneNumber?: string;
  bankAccount?: {
    cardNumber: string;
    expiryDate: string;
    bankName: string;
  };
  createdAt: Timestamp;
  updatedAt: Timestamp;
  isNewUser: boolean;
}

export interface Account {
  uid: string;
  cashBalance: number;
  savingsBalance: number;
  totalTransactions: number;
  updatedAt: Timestamp;
}

export interface Transaction {
  id?: string;
  uid: string;
  type: 'payment-sent' | 'payment-received' | 'deposit' | 'withdrawal';
  amount: number;
  recipient: string;
  recipientId?: string;
  note: string;
  timestamp: Timestamp;
  status: 'completed' | 'pending' | 'failed';
}

export interface Contact {
  id?: string;
  uid: string;
  contactName: string;
  cashtag: string;
  phoneNumber?: string;
  email?: string;
  totalSent: number;
  totalReceived: number;
  lastTransaction: Timestamp | null;
  addedAt: Timestamp;
}

/**
 * Create a new user profile and account structure in Firestore
 */
export async function createUserProfile(
  uid: string,
  email: string,
  firstName: string,
  lastName: string,
  cashtag: string,
  zipCode: string
): Promise<UserProfile> {
  const now = Timestamp.now();

  const userProfile: UserProfile = {
    uid,
    email,
    firstName,
    lastName,
    cashtag,
    zipCode,
    createdAt: now,
    updatedAt: now,
    isNewUser: true,
  };

  const userAccountRef = doc(db, 'users', uid);
  await setDoc(userAccountRef, userProfile);

  // Initialize account balances
  const accountData: Account = {
    uid,
    cashBalance: 0,
    savingsBalance: 0,
    totalTransactions: 0,
    updatedAt: now,
  };

  const accountRef = doc(db, 'accounts', uid);
  await setDoc(accountRef, accountData);

  // Create empty transactions subcollection
  const transactionsRef = collection(db, 'users', uid, 'transactions');
  // Subcollection is created implicitly when first document is added

  // Create empty contacts subcollection
  const contactsRef = collection(db, 'users', uid, 'contacts');
  // Subcollection is created implicitly when first document is added

  return userProfile;
}

/**
 * Get user profile by UID
 */
export async function getUserProfile(uid: string): Promise<UserProfile | null> {
  try {
    const userRef = doc(db, 'users', uid);
    const userSnap = await getDoc(userRef);

    if (userSnap.exists()) {
      return userSnap.data() as UserProfile;
    }
    return null;
  } catch (error) {
    console.error('[v0] Error getting user profile:', error);
    throw error;
  }
}

/**
 * Get user account (balances and stats)
 */
export async function getUserAccount(uid: string): Promise<Account | null> {
  try {
    const accountRef = doc(db, 'accounts', uid);
    const accountSnap = await getDoc(accountRef);

    if (accountSnap.exists()) {
      return accountSnap.data() as Account;
    }
    return null;
  } catch (error) {
    console.error('[v0] Error getting user account:', error);
    throw error;
  }
}

/**
 * Add a transaction to user's transaction history
 */
export async function addTransaction(
  uid: string,
  transaction: Omit<Transaction, 'id'>
): Promise<string> {
  try {
    const transactionsRef = collection(db, 'users', uid, 'transactions');
    const docRef = await addDoc(transactionsRef, transaction);

    // Update account's total transactions count
    const accountRef = doc(db, 'accounts', uid);
    await updateDoc(accountRef, {
      totalTransactions: arrayUnion(docRef.id),
      updatedAt: Timestamp.now(),
    });

    return docRef.id;
  } catch (error) {
    console.error('[v0] Error adding transaction:', error);
    throw error;
  }
}

/**
 * Get all transactions for a user
 */
export async function getUserTransactions(uid: string): Promise<Transaction[]> {
  try {
    const transactionsRef = collection(db, 'users', uid, 'transactions');
    const q = query(transactionsRef);
    const querySnapshot = await getDocs(q);

    return querySnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    })) as Transaction[];
  } catch (error) {
    console.error('[v0] Error getting transactions:', error);
    throw error;
  }
}

/**
 * Update user's cash balance
 */
export async function updateCashBalance(uid: string, amount: number): Promise<void> {
  try {
    const accountRef = doc(db, 'accounts', uid);
    await updateDoc(accountRef, {
      cashBalance: amount,
      updatedAt: Timestamp.now(),
    });
  } catch (error) {
    console.error('[v0] Error updating cash balance:', error);
    throw error;
  }
}

/**
 * Update user's savings balance
 */
export async function updateSavingsBalance(uid: string, amount: number): Promise<void> {
  try {
    const accountRef = doc(db, 'accounts', uid);
    await updateDoc(accountRef, {
      savingsBalance: amount,
      updatedAt: Timestamp.now(),
    });
  } catch (error) {
    console.error('[v0] Error updating savings balance:', error);
    throw error;
  }
}

/**
 * Add or update a contact
 */
export async function addContact(
  uid: string,
  contact: Omit<Contact, 'id'>
): Promise<string> {
  try {
    const contactsRef = collection(db, 'users', uid, 'contacts');

    // Check if contact already exists by cashtag
    const q = query(contactsRef, where('cashtag', '==', contact.cashtag));
    const existingDocs = await getDocs(q);

    if (existingDocs.size > 0) {
      const existingDoc = existingDocs.docs[0];
      await updateDoc(existingDoc.ref, {
        ...contact,
      });
      return existingDoc.id;
    }

    const docRef = await addDoc(contactsRef, contact);
    return docRef.id;
  } catch (error) {
    console.error('[v0] Error adding contact:', error);
    throw error;
  }
}

/**
 * Get all contacts for a user
 */
export async function getUserContacts(uid: string): Promise<Contact[]> {
  try {
    const contactsRef = collection(db, 'users', uid, 'contacts');
    const q = query(contactsRef);
    const querySnapshot = await getDocs(q);

    return querySnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    })) as Contact[];
  } catch (error) {
    console.error('[v0] Error getting contacts:', error);
    throw error;
  }
}

/**
 * Search user by cashtag (for payments)
 */
export async function searchUserByCashtag(cashtag: string): Promise<UserProfile | null> {
  try {
    const usersRef = collection(db, 'users');
    const q = query(usersRef, where('cashtag', '==', cashtag));
    const querySnapshot = await getDocs(q);

    if (querySnapshot.size > 0) {
      return querySnapshot.docs[0].data() as UserProfile;
    }
    return null;
  } catch (error) {
    console.error('[v0] Error searching user by cashtag:', error);
    throw error;
  }
}

/**
 * Update user profile
 */
export async function updateUserProfile(
  uid: string,
  updates: Partial<UserProfile>
): Promise<void> {
  try {
    const userRef = doc(db, 'users', uid);
    await updateDoc(userRef, {
      ...updates,
      updatedAt: Timestamp.now(),
    });
  } catch (error) {
    console.error('[v0] Error updating user profile:', error);
    throw error;
  }
}
