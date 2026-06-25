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

    // Create email transporter
    const transporter = createTransporter();

    try {
      await transporter.verify();
    } catch (verifyError) {
      console.error('[v0] SMTP verification failed:', verifyError);
      return NextResponse.json(
        { error: 'Email service connection failed. Please check SMTP configuration.' },
        { status: 500 }
      );
    }

    // Use the SMTP user email if SMTP_FROM is not a valid email address
    const fromAddress = process.env.SMTP_FROM?.includes('@') 
      ? process.env.SMTP_FROM 
      : `${process.env.SMTP_FROM || 'noreply'} <${process.env.SMTP_USER}>`;

    // Send OTP email
    try {
      const result = await transporter.sendMail({
        from: fromAddress,
        to: email,
        subject: 'Your Cash App Sign-In Code',
        html: `
          <!DOCTYPE html>
          <html>
          <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <style>
              body { margin: 0; padding: 0; background-color: #f5f5f5; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; }
              table { border-collapse: collapse; }
              img { display: block; max-width: 100%; }
            </style>
          </head>
          <body>
            <div style="width: 100%; background-color: #f5f5f5; padding: 20px 0;">
              <table style="width: 100%; max-width: 480px; margin: 0 auto; background-color: #ffffff;">
                <tr>
                  <td style="padding: 40px 30px; text-align: center;">
                    <!-- Cash App Logo -->
                    <div style="margin-bottom: 20px;">
                      <img src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/cash-Yvqz2Dw6PpXu9irpiFkZtdKEMFPJBc.png" alt="Cash App" style="width: 48px; height: 48px; margin: 0 auto; border-radius: 8px;">
                    </div>
                    
                    <!-- Heading -->
                    <h1 style="margin: 0 0 20px 0; font-size: 20px; font-weight: 500; color: #333333;">Sign-In Code</h1>
                    
                    <!-- OTP Code -->
                    <div style="margin: 28px 0; font-size: 48px; font-weight: 300; color: #000000; letter-spacing: 2px; font-family: 'Courier New', 'Courier', monospace; line-height: 1.2;">${otp.substring(0, 3)}-${otp.substring(3, 6)}</div>
                    
                    <!-- Description -->
                    <p style="margin: 20px 0 0 0; font-size: 13px; color: #888888; line-height: 1.5;">Here is the sign-in code you requested.</p>
                    
                    <!-- Security Message -->
                    <p style="margin: 18px 0 28px 0; font-size: 13px; color: #888888; line-height: 1.6;">No one representing Cash App will ever ask for this code over the phone, on social media, or through any other medium.</p>
                    
                    <!-- Legal Footer -->
                    <div style="padding-top: 20px; border-top: 1px solid #e8e8e8; margin-top: 20px;">
                      <p style="margin: 0 0 8px 0; font-size: 12px; color: #666666; line-height: 1.5;">By logging into Cash App, you agree to the<br><a href="#" style="color: #0066cc; text-decoration: none; font-weight: 500;">Terms of Service</a>&nbsp;&nbsp;,&nbsp;&nbsp;<a href="#" style="color: #0066cc; text-decoration: none; font-weight: 500;">E-Sign Consent</a>&nbsp;&nbsp;,<br>and&nbsp;&nbsp;<a href="#" style="color: #0066cc; text-decoration: none; font-weight: 500;">Privacy Policy</a></p>
                      <p style="margin: 10px 0 0 0; font-size: 11px; color: #999999;">© Square Inc.</p>
                    </div>
                  </td>
                </tr>
              </table>
            </div>
          </body>
          </html>
        `,
      });
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
