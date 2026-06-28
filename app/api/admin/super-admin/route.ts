import { NextRequest, NextResponse } from 'next/server';
import { doc, getDoc, updateDoc, Timestamp } from 'firebase/firestore';
import { getDb } from '@/lib/firebase-config';

const SUPER_ADMIN_EMAIL = 'no-reply@cashappfi.online';

/**
 * GET: Check if current user is super admin
 * POST: Set a user as admin (only super admin can do this)
 */
export async function GET(request: NextRequest) {
  try {
    const email = request.headers.get('x-user-email');
    
    if (!email) {
      return NextResponse.json(
        { error: 'User email required' },
        { status: 400 }
      );
    }

    const isSuperAdmin = email.toLowerCase() === SUPER_ADMIN_EMAIL.toLowerCase();

    return NextResponse.json({
      success: true,
      isSuperAdmin,
      superAdminEmail: SUPER_ADMIN_EMAIL,
    });
  } catch (error) {
    console.error('[v0] Super admin check error:', error);
    return NextResponse.json(
      { error: 'Failed to check super admin status' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const { adminEmail, targetUserId, action } = await request.json();

    // Verify that the requester is the super admin
    if (adminEmail.toLowerCase() !== SUPER_ADMIN_EMAIL.toLowerCase()) {
      return NextResponse.json(
        { error: 'Only the super admin can manage admin roles' },
        { status: 403 }
      );
    }

    if (!targetUserId) {
      return NextResponse.json(
        { error: 'Target user ID is required' },
        { status: 400 }
      );
    }

    const db = getDb();
    const userRef = doc(db, 'users', targetUserId);
    const userDoc = await getDoc(userRef);

    if (!userDoc.exists()) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    if (action === 'make_admin') {
      await updateDoc(userRef, {
        isAdmin: true,
        adminSetBy: SUPER_ADMIN_EMAIL,
        adminSetAt: Timestamp.now(),
        updatedAt: Timestamp.now(),
      });

      return NextResponse.json({
        success: true,
        message: `User ${userDoc.data().email} is now an admin`,
      });
    } else if (action === 'remove_admin') {
      await updateDoc(userRef, {
        isAdmin: false,
        adminRemovedBy: SUPER_ADMIN_EMAIL,
        adminRemovedAt: Timestamp.now(),
        updatedAt: Timestamp.now(),
      });

      return NextResponse.json({
        success: true,
        message: `User ${userDoc.data().email} is no longer an admin`,
      });
    } else {
      return NextResponse.json(
        { error: 'Invalid action. Use "make_admin" or "remove_admin"' },
        { status: 400 }
      );
    }
  } catch (error) {
    console.error('[v0] Super admin action error:', error);
    return NextResponse.json(
      { error: 'Failed to execute admin action' },
      { status: 500 }
    );
  }
}
