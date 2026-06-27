import { NextRequest, NextResponse } from 'next/server';
import { collection, query, where, getDocs, limit } from 'firebase/firestore';
import { db } from '@/lib/firebase-config';

export async function POST(request: NextRequest) {
  try {
    const { cashtag } = await request.json();

    if (!cashtag || cashtag.trim().length === 0) {
      return NextResponse.json(
        { error: 'Cashtag is required' },
        { status: 400 }
      );
    }

    // Strip $ prefix and trim; keep both original and lowercase for matching
    const raw = cashtag.replace(/^\$/, '').trim();
    const lower = raw.toLowerCase();

    if (!lower) {
      return NextResponse.json({ success: true, users: [], count: 0 });
    }

    const usersRef = collection(db, 'users');
    const foundMap = new Map<string, any>();

    // 1. Exact match on stored cashtag (as-is)
    try {
      const snap = await getDocs(query(usersRef, where('cashtag', '==', raw), limit(10)));
      snap.docs.forEach((d) => foundMap.set(d.id, { uid: d.id, ...d.data() }));
    } catch {}

    // 2. Lowercase exact match (handles mixed-case stored values)
    if (foundMap.size === 0) {
      try {
        const snap = await getDocs(query(usersRef, where('cashtag', '==', lower), limit(10)));
        snap.docs.forEach((d) => foundMap.set(d.id, { uid: d.id, ...d.data() }));
      } catch {}
    }

    // 3. Partial / prefix scan — fetch up to 200 users and filter client-side
    if (foundMap.size === 0) {
      try {
        const snap = await getDocs(query(usersRef, limit(200)));
        snap.docs.forEach((d) => {
          const data = d.data();
          const stored = (data.cashtag || '').toLowerCase();
          if (stored.includes(lower)) {
            foundMap.set(d.id, { uid: d.id, ...data });
          }
        });
      } catch {}
    }

    const users = Array.from(foundMap.values())
      .slice(0, 8)
      .map((u) => ({
        uid: u.uid,
        firstName: u.firstName || '',
        lastName: u.lastName || '',
        cashtag: u.cashtag || '',
        email: u.email || '',
        isAdmin: u.isAdmin || false,
      }));

    return NextResponse.json({ success: true, users, count: users.length });
  } catch (error) {
    console.error('[v0] User search error:', error);
    return NextResponse.json({ error: 'Failed to search users' }, { status: 500 });
  }
}
