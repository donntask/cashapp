import { NextRequest, NextResponse } from 'next/server';
import { collection, query, where, getDocs, limit } from 'firebase/firestore';
import { db } from '@/lib/firebase-config';

export async function POST(request: NextRequest) {
  try {
    const { cashtag, includeTransactions = false } = await request.json();

    if (!cashtag || cashtag.trim().length === 0) {
      return NextResponse.json(
        { error: 'Cashtag is required' },
        { status: 400 }
      );
    }

    // Search for user by cashtag (case-insensitive)
    const usersRef = collection(db, 'users');
    const searchTerm = cashtag.toLowerCase().replace(/^\$/, ''); // Remove $ if present and lowercase
    
    const q = query(
      usersRef,
      where('cashtag', '==', searchTerm),
      limit(5)
    );
    
    const querySnapshot = await getDocs(q);
    const users = querySnapshot.docs.map(doc => {
      const data = doc.data();
      return {
        uid: doc.id,
        firstName: data.firstName,
        lastName: data.lastName,
        cashtag: data.cashtag,
        email: data.email,
        isAdmin: data.isAdmin || false,
      };
    });

    return NextResponse.json({
      success: true,
      users,
      count: users.length,
    });
  } catch (error) {
    console.error('[v0] User search error:', error);
    return NextResponse.json(
      { error: 'Failed to search users' },
      { status: 500 }
    );
  }
}
