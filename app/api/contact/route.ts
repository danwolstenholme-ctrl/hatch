import { NextResponse } from 'next/server'

const SUPPORT_TO = process.env.SUPPORT_EMAIL_TO || 'support@hatchit.dev'
const SUPPORT_FROM = process.env.SUPPORT_EMAIL_FROM || 'Hatch Support <support@hatchit.dev>'
const RESEND_API_KEY = process.env.RESEND_API_KEY

export async function POST(request: Request) {
  try {
    const { name = '', email = '', topic = 'General', message = '', website = '' } = await request.json()

    // Honeypot
    if (website) {
      return NextResponse.json({ ok: true })
    }

    if (!name.trim() || !email.trim() || !message.trim()) {
      return NextResponse.json({ error: 'Name, email, and message are required.' }, { status: 400 })
    }

    if (!RESEND_API_KEY) {
      return NextResponse.json({ error: 'Email service not configured.' }, { status: 500 })
    }

    const subject = `[Contact] ${topic || 'General'}`
    const text = `Name: ${name}\nEmail: ${email}\nTopic: ${topic}\n\n${message}`

    const res = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${RESEND_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: SUPPORT_FROM,
        to: SUPPORT_TO,
        subject,
        text,
        reply_to: email,
      }),
    })

    if (!res.ok) {
      const data = await res.json().catch(() => ({}))
      const errMsg = data?.message || 'Failed to send message.'
      return NextResponse.json({ error: errMsg }, { status: 502 })
    }

    return NextResponse.json({ ok: true })
  } catch (err) {
    console.error('Contact route error:', err)
    return NextResponse.json({ error: 'Unexpected error. Please try again.' }, { status: 500 })
  }
}
