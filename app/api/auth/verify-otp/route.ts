import { NextRequest, NextResponse } from 'next/server';
import { otpStore } from '@/lib/otp-store';

export async function POST(request: NextRequest) {
  try {
    const { email, otp } = await request.json();

    if (!email || !otp) {
      return NextResponse.json(
        { error: 'Email and OTP are required' },
        { status: 400 }
      );
    }

    // Verify OTP using the store
    const storedOTPData = otpStore.getOTP(email);
    const isValidOTP = storedOTPData && storedOTPData.otp === otp;

    if (!isValidOTP) {
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

    return NextResponse.json({
      success: true,
      message: 'OTP verified successfully',
      email,
      token: `user_${email}_${Date.now()}`,
    });
  } catch (error) {
    console.error('[v0] OTP verification error:', error);
    return NextResponse.json(
      { error: 'Failed to verify OTP. Please try again.' },
      { status: 500 }
    );
  }
}
