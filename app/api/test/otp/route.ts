import { NextResponse } from 'next/server';

export async function GET() {
  const otpStore = (global as any).otpStore || {};
  const registeredUsers = (global as any).registeredUsers || [];
  
  return NextResponse.json({
    otpStore: Object.entries(otpStore).map(([email, data]: [string, any]) => ({
      email,
      otp: data.otp,
    })),
    registeredUsers,
  });
}
