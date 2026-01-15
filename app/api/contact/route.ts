import { NextResponse } from 'next/server'

// HatchIt's own Formspree form ID for the contact page
const FORMSPREE_ID = process.env.FORMSPREE_CONTACT_ID || 'xpwzgkqv'

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

    // Submit to Formspree
    const res = await fetch(`https://formspree.io/f/${FORMSPREE_ID}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      body: JSON.stringify({
        name,
        email,
        topic,
        message,
        _subject: `[HatchIt Contact] ${topic}`,
      }),
    })

    if (!res.ok) {
      const data = await res.json().catch(() => ({}))
      const errMsg = data?.error || 'Failed to send message.'
      return NextResponse.json({ error: errMsg }, { status: 502 })
    }

    return NextResponse.json({ ok: true })
  } catch (err) {
    console.error('Contact route error:', err)
    return NextResponse.json({ error: 'Unexpected error. Please try again.' }, { status: 500 })
  }
}
