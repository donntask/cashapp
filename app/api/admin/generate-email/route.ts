import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const { prompt, recipientName, recipientEmail } = await request.json();

    if (!prompt || !recipientName) {
      return NextResponse.json({ error: 'prompt and recipientName are required' }, { status: 400 });
    }

    if (!process.env.OPENROUTER_API_KEY) {
      return NextResponse.json({ error: 'OpenRouter API key not configured' }, { status: 500 });
    }

    const systemPrompt = `You are an official email copywriter for Cash App (by Block, Inc.). 
You write professional, clear, and direct customer communication emails.
- Always address the user by their first name
- Use Cash App branding tone: friendly but official
- Keep emails concise — no fluff, no excessive legal boilerplate
- Never mention you are an AI
- Output ONLY the email body (no subject line, no "From:", no "To:")
- Start directly with the greeting (e.g. "Hi [Name],")
- End with a closing like "Cash App Support" or "The Cash App Team"
- Use plain text formatting — no markdown, no HTML tags`;

    const userMessage = `Write a professional Cash App email to ${recipientName} (${recipientEmail}).

Admin instruction: ${prompt}

Write the email body now:`;

    const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.OPENROUTER_API_KEY}`,
        'Content-Type': 'application/json',
        'HTTP-Referer': 'https://cashapp.vercel.app',
        'X-Title': 'CashApp Admin',
      },
      body: JSON.stringify({
        model: 'deepseek/deepseek-chat-v3-5k:free',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userMessage },
        ],
        max_tokens: 600,
        temperature: 0.7,
      }),
    });

    if (!response.ok) {
      const errText = await response.text();
      console.error('[v0] OpenRouter error:', response.status, errText);
      // Surface the raw OpenRouter message so the admin UI can show it
      let detail = errText;
      try { detail = JSON.parse(errText)?.error?.message ?? errText; } catch {}
      return NextResponse.json({ error: `OpenRouter error: ${response.status} — ${detail}` }, { status: 500 });
    }

    const data = await response.json();
    const generatedBody = data.choices?.[0]?.message?.content?.trim();

    if (!generatedBody) {
      return NextResponse.json({ error: 'No content returned from AI' }, { status: 500 });
    }

    return NextResponse.json({ success: true, emailBody: generatedBody });
  } catch (error) {
    console.error('[v0] generate-email error:', error);
    return NextResponse.json({ error: 'Server error generating email' }, { status: 500 });
  }
}
