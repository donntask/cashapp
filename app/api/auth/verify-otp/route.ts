import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const { email, otp, registeredUsers } = await request.json();

    if (!email || !otp) {
      return NextResponse.json(
        { error: 'Email and OTP are required' },
        { status: 400 }
      );
    }

    // Retrieve OTP from global store
    const otpStore = (global as any).otpStore || {};
    const storedOtpData = otpStore[email];

    if (!storedOtpData) {
      return NextResponse.json(
        { error: 'No OTP found for this email. Please request a new code.' },
        { status: 400 }
      );
    }

    // Check if OTP has expired
    if (Date.now() > storedOtpData.expiresAt) {
      delete otpStore[email];
      return NextResponse.json(
        { error: 'OTP has expired. Please request a new code.' },
        { status: 400 }
      );
    }

    // Verify OTP
    if (storedOtpData.otp !== otp) {
      return NextResponse.json(
        { error: 'Invalid OTP. Please try again.' },
        { status: 400 }
      );
    }

    // OTP is valid - check if user is registered
    // Use the registeredUsers list passed from the client, or fall back to global
    const usersList = Array.isArray(registeredUsers) ? registeredUsers : ((global as any).registeredUsers || []);
    const isNewUser = !usersList.includes(email);

    // Store in global for future verification
    (global as any).registeredUsers = (global as any).registeredUsers || [];
    if (!isNewUser && !(global as any).registeredUsers.includes(email)) {
      (global as any).registeredUsers.push(email);
    }

    // Clean up used OTP
    delete otpStore[email];

    console.log('[v0] OTP verified - Email:', email, 'IsNewUser:', isNewUser);

    return NextResponse.json({
      success: true,
      message: 'OTP verified successfully',
      email,
      isNewUser,
      token: `user_${email}_${Date.now()}`, // Simple token for session management
    });
  } catch (error) {
    console.error('[v0] OTP verification error:', error);
    return NextResponse.json(
      { error: 'Failed to verify OTP. Please try again.' },
      { status: 500 }
    );
  }
}
