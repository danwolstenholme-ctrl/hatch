import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'

export async function GET(request: NextRequest) {
  // Authenticate user
  const { userId } = await auth()
  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { searchParams } = new URL(request.url)
  const domain = searchParams.get('domain')

  if (!domain) {
    return NextResponse.json({ error: 'Domain required' }, { status: 400 })
  }

  // Clean domain name
  const cleanDomain = domain.toLowerCase().replace(/^https?:\/\//, '').replace(/\/.*$/, '').trim()

  try {
    // Check domain availability
    const statusRes = await fetch(
      `https://api.vercel.com/v4/domains/status?name=${encodeURIComponent(cleanDomain)}`,
      {
        headers: {
          'Authorization': `Bearer ${process.env.VERCEL_TOKEN}`,
        },
      }
    )
    const statusData = await statusRes.json()

    if (!statusRes.ok) {
      return NextResponse.json({ 
        available: false, 
        error: statusData.error?.message || 'Failed to check domain' 
      })
    }

    // If available, get price
    if (statusData.available) {
      const priceRes = await fetch(
        `https://api.vercel.com/v4/domains/price?name=${encodeURIComponent(cleanDomain)}`,
        {
          headers: {
            'Authorization': `Bearer ${process.env.VERCEL_TOKEN}`,
          },
        }
      )
      const priceData = await priceRes.json()

      return NextResponse.json({
        domain: cleanDomain,
        available: true,
        price: priceData.price || null,
        period: priceData.period || 1,
      })
    }

    return NextResponse.json({
      domain: cleanDomain,
      available: false,
    })

  } catch (error) {
    console.error('Domain search error:', error)
    return NextResponse.json({ error: 'Failed to search domain' }, { status: 500 })
  }
}
