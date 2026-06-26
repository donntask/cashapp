import { NextRequest, NextResponse } from 'next/server';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '@/lib/firebase-config';

export async function POST(request: NextRequest) {
  try {
    const { email } = await request.json();

    if (!email) {
      return NextResponse.json(
        { error: 'Email is required' },
        { status: 400 }
      );
    }

    // Check if user exists in Firestore
    const usersRef = collection(db, 'users');
    const q = query(usersRef, where('email', '==', email));
    const querySnapshot = await getDocs(q);
    
    const exists = !querySnapshot.empty;

    return NextResponse.json({
      success: true,
      exists,
      isNewUser: !exists,
    });
  } catch (error) {
    console.error('[v0] Error checking email:', error);
    return NextResponse.json(
      { error: 'Failed to check email. Please try again.' },
      { status: 500 }
    );
  }
}
