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
    const searchTerm = cashtag.toLowerCase().replace(/^\$/, '').trim(); // Remove $ if present and lowercase
    
    let users: any[] = [];
    
    // Try exact match first (case-insensitive comparison in Firebase)
    try {
      const exactQuery = query(
        usersRef,
        where('cashtag', '==', searchTerm),
        limit(5)
      );
      const exactSnapshot = await getDocs(exactQuery);
      
      if (!exactSnapshot.empty) {
        users = exactSnapshot.docs.map(doc => {
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
      }
    } catch (e) {
      // Try partial match if exact match fails
    }
    
    // If no exact match, get all users and filter client-side for partial match
    if (users.length === 0) {
      try {
        const allUsersQuery = query(usersRef, limit(100));
        const allUsersSnapshot = await getDocs(allUsersQuery);
        
        users = allUsersSnapshot.docs
          .map(doc => {
            const data = doc.data();
            return {
              uid: doc.id,
              firstName: data.firstName,
              lastName: data.lastName,
              cashtag: data.cashtag || '',
              email: data.email,
              isAdmin: data.isAdmin || false,
            };
          })
          .filter(user => user.cashtag && user.cashtag.toLowerCase().includes(searchTerm))
          .slice(0, 5);
      } catch (e) {
        console.error('[v0] Search failed:', e);
      }
    }

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
