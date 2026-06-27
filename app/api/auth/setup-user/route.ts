import { NextRequest, NextResponse } from 'next/server';
import { createUserProfile } from '@/lib/firestore-service';

export async function POST(request: NextRequest) {
  try {
    const { uid, email, firstName, lastName, cashtag, zipCode, isAdmin } = await request.json();

    if (!uid || !email || !firstName || !lastName || !cashtag || !zipCode) {
      return NextResponse.json(
        { error: 'Missing required fields: uid, email, firstName, lastName, cashtag, zipCode' },
        { status: 400 }
      );
    }

    // Store cashtag lowercased so searches always match regardless of input casing
    const normalizedCashtag = cashtag.toLowerCase().trim();

    // Create user profile and account structure in Firestore
    const userProfile = await createUserProfile(
      uid,
      email,
      firstName,
      lastName,
      normalizedCashtag,
      zipCode,
      isAdmin || false
    );

    return NextResponse.json({
      success: true,
      message: 'User profile created successfully',
      userProfile,
    });
  } catch (error) {
    console.error('[v0] User setup error:', error);
    return NextResponse.json(
      { error: 'Failed to create user profile. Please try again.' },
      { status: 500 }
    );
  }
}
