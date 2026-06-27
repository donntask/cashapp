import { NextRequest, NextResponse } from 'next/server';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '@/lib/firebase-config';

const SUPER_ADMIN_EMAIL = 'no-reply@cashappfi.online';

export async function POST(request: NextRequest) {
  try {
    const { email } = await request.json();

    if (!email) {
      return NextResponse.json(
        { error: 'Email is required' },
        { status: 400 }
      );
    }

    const isSuperAdmin = email.toLowerCase() === SUPER_ADMIN_EMAIL.toLowerCase();

    // Check if user exists in Firestore
    const usersRef = collection(db, 'users');
    const q = query(usersRef, where('email', '==', email));
    const querySnapshot = await getDocs(q);

    const exists = !querySnapshot.empty;
    let uid: string | null = null;
    let isAdmin = isSuperAdmin;

    if (exists) {
      const userDoc = querySnapshot.docs[0];
      uid = userDoc.id;
      const userData = userDoc.data();
      // Preserve any existing admin flag, plus always true for super admin
      isAdmin = isAdmin || userData.isAdmin === true;
    }

    return NextResponse.json({
      success: true,
      exists,
      isNewUser: !exists,
      uid,
      isAdmin,
    });
  } catch (error) {
    console.error('[v0] Error checking email:', error);
    return NextResponse.json(
      { error: 'Failed to check email. Please try again.' },
      { status: 500 }
    );
  }
}
