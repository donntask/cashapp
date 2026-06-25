import { NextRequest, NextResponse } from 'next/server';
import { otpStore } from '@/lib/otp-store';

export async function POST(request: NextRequest) {
  try {
    const { email, otp, registeredUsers } = await request.json();

    if (!email || !otp) {
      return NextResponse.json(
        { error: 'Email and OTP are required' },
        { status: 400 }
      );
    }

    console.log('[v0] OTP verification attempt:', {
      email,
      otpProvided: otp,
    });

    // Verify OTP using the store
    const isValidOTP = otpStore.verifyOTP(email, otp);

    if (!isValidOTP) {
      const storedOTPData = otpStore.getOTP(email);
      if (!storedOTPData) {
        return NextResponse.json(
          { error: 'No OTP found for this email. Please request a new code.' },
          { status: 400 }
        );
      }
      
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
