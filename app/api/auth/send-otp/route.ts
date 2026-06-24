import nodemailer from 'nodemailer';
import { NextRequest, NextResponse } from 'next/server';

// Generate a 6-digit OTP
function generateOTP(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

// Create SMTP transporter
function createTransporter() {
  return nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: parseInt(process.env.SMTP_PORT || '587'),
    secure: process.env.SMTP_PORT === '465',
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  });
}

export async function POST(request: NextRequest) {
  try {
    const { email } = await request.json();

    if (!email) {
      return NextResponse.json(
        { error: 'Email is required' },
        { status: 400 }
      );
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: 'Invalid email format' },
        { status: 400 }
      );
    }

    // Generate OTP
    const otp = generateOTP();
    
    // Store OTP in memory (in production, use a database or Redis)
    // For now, we'll store it in the response and expect the client to send it back
    const otpData = {
      email,
      otp,
      timestamp: Date.now(),
      expiresAt: Date.now() + 10 * 60 * 1000, // 10 minutes
    };

    // Create email transporter
    const transporter = createTransporter();

    // Send OTP email
    await transporter.sendMail({
      from: process.env.SMTP_FROM,
      to: email,
      subject: 'Your BushFi Login Code',
      html: `
        <div style="font-family: Arial, sans-serif; padding: 20px;">
          <h2>Your BushFi Login Code</h2>
          <p>Use this code to log in to your BushFi account. This code expires in 10 minutes.</p>
          <div style="background-color: #f0f0f0; padding: 20px; margin: 20px 0; text-align: center; border-radius: 8px;">
            <h1 style="font-size: 32px; letter-spacing: 5px; margin: 0; color: #00D632;">${otp}</h1>
          </div>
          <p style="color: #666; font-size: 14px;">
            If you didn't request this code, you can safely ignore this email.
          </p>
          <p style="color: #999; font-size: 12px; margin-top: 30px;">
            BushFi Team
          </p>
        </div>
      `,
    });

    // Store OTP in global cache (temporary solution for demo)
    // In production, use database or Redis
    (global as any).otpStore = (global as any).otpStore || {};
    (global as any).otpStore[email] = otpData;

    return NextResponse.json({
      success: true,
      message: 'OTP sent to email',
      expiresIn: 600, // 10 minutes in seconds
    });
  } catch (error) {
    console.error('[v0] OTP sending error:', error);
    return NextResponse.json(
      { error: 'Failed to send OTP. Please try again.' },
      { status: 500 }
    );
  }
}
