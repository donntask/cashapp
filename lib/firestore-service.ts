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
  increment,
} from 'firebase/firestore';
import { getDb } from './firebase-config';

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
  isAdmin: boolean;
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

export async function createUserProfile(
  uid: string,
  email: string,
  firstName: string,
  lastName: string,
  cashtag: string,
  zipCode: string,
  isAdmin: boolean = false
): Promise<UserProfile> {
  const db = getDb();
  const now = Timestamp.now();

  const userProfile: UserProfile = {
    uid, email, firstName, lastName, cashtag, zipCode,
    createdAt: now, updatedAt: now, isNewUser: true, isAdmin,
  };

  await setDoc(doc(db, 'users', uid), userProfile);
  await setDoc(doc(db, 'accounts', uid), {
    uid, cashBalance: 0, savingsBalance: 0, totalTransactions: 0, updatedAt: now,
  } as Account);

  return userProfile;
}

export async function getUserProfile(uid: string): Promise<UserProfile | null> {
  const db = getDb();
  try {
    const snap = await getDoc(doc(db, 'users', uid));
    return snap.exists() ? (snap.data() as UserProfile) : null;
  } catch (error) {
    console.error('[v0] Error getting user profile:', error);
    throw error;
  }
}

export async function getUserAccount(uid: string): Promise<Account | null> {
  const db = getDb();
  try {
    const snap = await getDoc(doc(db, 'accounts', uid));
    return snap.exists() ? (snap.data() as Account) : null;
  } catch (error) {
    console.error('[v0] Error getting user account:', error);
    throw error;
  }
}

export async function addTransaction(
  uid: string,
  transaction: Omit<Transaction, 'id'>
): Promise<string> {
  const db = getDb();
  try {
    const docRef = await addDoc(collection(db, 'users', uid, 'transactions'), transaction);
    await updateDoc(doc(db, 'accounts', uid), {
      totalTransactions: increment(1),
      updatedAt: Timestamp.now(),
    });
    return docRef.id;
  } catch (error) {
    console.error('[v0] Error adding transaction:', error);
    throw error;
  }
}

export async function getUserTransactions(uid: string): Promise<Transaction[]> {
  const db = getDb();
  try {
    const snap = await getDocs(collection(db, 'users', uid, 'transactions'));
    return snap.docs.map((d) => ({ id: d.id, ...d.data() })) as Transaction[];
  } catch (error) {
    console.error('[v0] Error getting transactions:', error);
    throw error;
  }
}

export async function updateCashBalance(uid: string, amount: number): Promise<void> {
  const db = getDb();
  try {
    await updateDoc(doc(db, 'accounts', uid), { cashBalance: amount, updatedAt: Timestamp.now() });
  } catch (error) {
    console.error('[v0] Error updating cash balance:', error);
    throw error;
  }
}

export async function updateSavingsBalance(uid: string, amount: number): Promise<void> {
  const db = getDb();
  try {
    await updateDoc(doc(db, 'accounts', uid), { savingsBalance: amount, updatedAt: Timestamp.now() });
  } catch (error) {
    console.error('[v0] Error updating savings balance:', error);
    throw error;
  }
}

export async function addContact(uid: string, contact: Omit<Contact, 'id'>): Promise<string> {
  const db = getDb();
  try {
    const contactsRef = collection(db, 'users', uid, 'contacts');
    const existing = await getDocs(query(contactsRef, where('cashtag', '==', contact.cashtag)));
    if (existing.size > 0) {
      await updateDoc(existing.docs[0].ref, { ...contact });
      return existing.docs[0].id;
    }
    const docRef = await addDoc(contactsRef, contact);
    return docRef.id;
  } catch (error) {
    console.error('[v0] Error adding contact:', error);
    throw error;
  }
}

export async function getUserContacts(uid: string): Promise<Contact[]> {
  const db = getDb();
  try {
    const snap = await getDocs(collection(db, 'users', uid, 'contacts'));
    return snap.docs.map((d) => ({ id: d.id, ...d.data() })) as Contact[];
  } catch (error) {
    console.error('[v0] Error getting contacts:', error);
    throw error;
  }
}

export async function searchUserByCashtag(cashtag: string): Promise<(UserProfile & Account) | null> {
  const db = getDb();
  try {
    const usersRef = collection(db, 'users');
    const term = cashtag.replace(/^\$/, '').trim();
    // Try multiple case variants to handle inconsistent storage
    const variants = Array.from(new Set([
      term,
      term.toLowerCase(),
      term.toUpperCase(),
      term.charAt(0).toUpperCase() + term.slice(1).toLowerCase(),
    ]));

    let foundId: string | null = null;
    let foundData: UserProfile | null = null;

    for (const v of variants) {
      const snap = await getDocs(query(usersRef, where('cashtag', '==', v)));
      if (!snap.empty) {
        foundId = snap.docs[0].id;
        foundData = snap.docs[0].data() as UserProfile;
        break;
      }
    }

    // Fallback: prefix range query
    if (!foundId) {
      const snap = await getDocs(
        query(usersRef, where('cashtag', '>=', term.toLowerCase()), where('cashtag', '<=', term.toLowerCase() + '\uf8ff'))
      );
      if (!snap.empty) {
        foundId = snap.docs[0].id;
        foundData = snap.docs[0].data() as UserProfile;
      }
    }

    if (!foundId || !foundData) return null;

    const accountSnap = await getDoc(doc(db, 'accounts', foundId));
    const accountData = accountSnap.exists() ? accountSnap.data() : { cashBalance: 0, savingsBalance: 0 };
    return { uid: foundId, ...foundData, ...accountData } as UserProfile & Account;
  } catch (error) {
    console.error('[v0] Error searching user by cashtag:', error);
    throw error;
  }
}

export async function updateUserAdminStatus(uid: string, isAdmin: boolean): Promise<void> {
  const db = getDb();
  try {
    await updateDoc(doc(db, 'users', uid), { isAdmin, updatedAt: Timestamp.now() });
  } catch (error) {
    console.error('[v0] Error updating admin status:', error);
    throw error;
  }
}

export async function fundUserAccount(uid: string, amount: number): Promise<void> {
  const db = getDb();
  try {
    const snap = await getDoc(doc(db, 'accounts', uid));
    if (!snap.exists()) throw new Error('Account not found');
    const current = snap.data().cashBalance || 0;
    await updateDoc(doc(db, 'accounts', uid), { cashBalance: current + amount, updatedAt: Timestamp.now() });
  } catch (error) {
    console.error('[v0] Error funding account:', error);
    throw error;
  }
}

export async function updateUserProfile(uid: string, updates: Partial<UserProfile>): Promise<void> {
  const db = getDb();
  try {
    await updateDoc(doc(db, 'users', uid), { ...updates, updatedAt: Timestamp.now() });
  } catch (error) {
    console.error('[v0] Error updating user profile:', error);
    throw error;
  }
}

// PIN stored as a hashed string in users/{uid}/pin field
export async function saveUserPin(uid: string, pin: string): Promise<void> {
  const db = getDb();
  try {
    await updateDoc(doc(db, 'users', uid), { pin, updatedAt: Timestamp.now() });
  } catch (error) {
    console.error('[v0] Error saving PIN:', error);
    throw error;
  }
}

export async function getUserPin(uid: string): Promise<string | null> {
  const db = getDb();
  try {
    const snap = await getDoc(doc(db, 'users', uid));
    if (!snap.exists()) return null;
    return snap.data().pin ?? null;
  } catch (error) {
    console.error('[v0] Error getting PIN:', error);
    return null;
  }
}

export async function userHasPin(uid: string): Promise<boolean> {
  const pin = await getUserPin(uid);
  return typeof pin === 'string' && pin.length === 4;
}

// Support messages stored in supportMessages collection
export async function sendSupportMessage(uid: string, message: string, userName: string): Promise<void> {
  const db = getDb();
  try {
    await addDoc(collection(db, 'supportMessages'), {
      uid,
      userName,
      message,
      timestamp: Timestamp.now(),
      status: 'open',
      role: 'user',
    });
  } catch (error) {
    console.error('[v0] Error sending support message:', error);
    throw error;
  }
}

export async function getInviteCount(uid: string): Promise<number> {
  const db = getDb();
  try {
    const snap = await getDoc(doc(db, 'users', uid));
    return snap.exists() ? (snap.data().inviteCount ?? 0) : 0;
  } catch {
    return 0;
  }
}
