import nodemailer from 'nodemailer';
import { NextRequest, NextResponse } from 'next/server';
import { otpStore } from '@/lib/otp-store';

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
    // Validate environment variables first
    if (!process.env.SMTP_HOST || !process.env.SMTP_USER || !process.env.SMTP_PASS || !process.env.SMTP_FROM) {
      console.error('[v0] SMTP configuration missing:', {
        host: !!process.env.SMTP_HOST,
        user: !!process.env.SMTP_USER,
        pass: !!process.env.SMTP_PASS,
        from: !!process.env.SMTP_FROM,
      });
      return NextResponse.json(
        { error: 'Email service not configured. Please contact support.' },
        { status: 500 }
      );
    }

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
    
    console.log('[v0] Generating OTP for email:', email, 'OTP:', otp);

    // Store OTP in memory (in production, use a database or Redis)
    const otpData = {
      email,
      otp,
      timestamp: Date.now(),
      expiresAt: Date.now() + 10 * 60 * 1000, // 10 minutes
    };

    // Create email transporter
    const transporter = createTransporter();

    console.log('[v0] SMTP config:', {
      host: process.env.SMTP_HOST,
      port: process.env.SMTP_PORT,
      secure: process.env.SMTP_PORT === '465',
      from: process.env.SMTP_FROM,
    });

    try {
      console.log('[v0] Verifying SMTP connection...');
      await transporter.verify();
      console.log('[v0] SMTP connection verified');
    } catch (verifyError) {
      console.error('[v0] SMTP verification failed:', verifyError);
      return NextResponse.json(
        { error: 'Email service connection failed. Please check SMTP configuration.' },
        { status: 500 }
      );
    }

    // Send OTP email
    try {
      console.log('[v0] Sending OTP email to:', email);
      // Use the SMTP user email if SMTP_FROM is not a valid email address
      const fromAddress = process.env.SMTP_FROM?.includes('@') 
        ? process.env.SMTP_FROM 
        : `${process.env.SMTP_FROM || 'noreply'} <${process.env.SMTP_USER}>`;
      
      const result = await transporter.sendMail({
        from: fromAddress,
        to: email,
        subject: 'Your Cash App Login Code',
        html: `
          <div style="font-family: Arial, sans-serif; padding: 20px;">
            <h2>Your Cash App Login Code</h2>
            <p>Use this code to log in to your Cash App account. This code expires in 10 minutes.</p>
            <div style="background-color: #f0f0f0; padding: 20px; margin: 20px 0; text-align: center; border-radius: 8px;">
              <h1 style="font-size: 32px; letter-spacing: 5px; margin: 0; color: #00D632;">${otp}</h1>
            </div>
            <p style="color: #666; font-size: 14px;">
              If you didn't request this code, you can safely ignore this email.
            </p>
            <p style="color: #999; font-size: 12px; margin-top: 30px;">
              Cash App Team
            </p>
          </div>
        `,
      });
      console.log('[v0] Email sent successfully:', result.messageId);
    } catch (sendError) {
      console.error('[v0] Email sending failed:', sendError);
      return NextResponse.json(
        { error: `Failed to send OTP: ${sendError instanceof Error ? sendError.message : 'Unknown error'}` },
        { status: 500 }
      );
    }

    // Store OTP using persistent store
    otpStore.setOTP(email, otp, 10 * 60 * 1000); // 10 minutes

    return NextResponse.json({
      success: true,
      message: 'OTP sent to email',
      expiresIn: 600, // 10 minutes in seconds
    });
  } catch (error) {
    console.error('[v0] OTP endpoint error:', error);
    return NextResponse.json(
      { error: `Server error: ${error instanceof Error ? error.message : 'Unknown error'}` },
      { status: 500 }
    );
  }
}
