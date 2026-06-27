import { NextRequest, NextResponse } from 'next/server';
import { doc, updateDoc, setDoc, Timestamp } from 'firebase/firestore';
import { db } from '@/lib/firebase-config';

interface AdminAction {
  type: 'block_account' | 'block_transaction' | 'send_notification' | 'request_fee';
  userId: string;
  adminId: string;
  reason?: string;
  amount?: number;
  details?: string;
}

export async function POST(request: NextRequest) {
  try {
    const action: AdminAction = await request.json();

    if (!action.type || !action.userId || !action.adminId) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    switch (action.type) {
      case 'block_account': {
        const userRef = doc(db, 'users', action.userId);
        await updateDoc(userRef, {
          isBlocked: true,
          blockedAt: Timestamp.now(),
          blockedBy: action.adminId,
          blockReason: action.reason || 'No reason provided',
          updatedAt: Timestamp.now(),
        });
        break;
      }

      case 'block_transaction': {
        // This would typically update a transaction or add to a blocked list
        const userRef = doc(db, 'users', action.userId);
        await updateDoc(userRef, {
          transactionsBlocked: true,
          blockedAt: Timestamp.now(),
          blockedBy: action.adminId,
          blockReason: action.reason || 'Suspicious activity',
          updatedAt: Timestamp.now(),
        });
        break;
      }

      case 'send_notification': {
        // Store notification record for the user using setDoc (creates if not exists)
        const notificationRef = doc(db, 'notifications', `${action.userId}_${Date.now()}`);
        await setDoc(notificationRef, {
          userId: action.userId,
          message: action.details || 'Admin notification',
          sentBy: action.adminId,
          sentAt: Timestamp.now(),
          read: false,
        });
        break;
      }

      case 'request_fee': {
        // Store fee request using setDoc (creates if not exists)
        const feeRef = doc(db, 'fee_requests', `${action.userId}_${Date.now()}`);
        await setDoc(feeRef, {
          userId: action.userId,
          amount: action.amount || 0,
          reason: action.reason || 'Admin fee request',
          requestedBy: action.adminId,
          requestedAt: Timestamp.now(),
          status: 'pending',
        });
        break;
      }

      default:
        return NextResponse.json(
          { error: 'Unknown action type' },
          { status: 400 }
        );
    }

    return NextResponse.json({
      success: true,
      message: `Action ${action.type} completed successfully`,
    });
  } catch (error) {
    console.error('[v0] Admin action error:', error);
    return NextResponse.json(
      { error: 'Failed to execute admin action' },
      { status: 500 }
    );
  }
}
