import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { getOrCreateUser } from '@/lib/db'
import { getUserDNA } from '@/lib/db/chronosphere'

export async function GET(req: NextRequest) {
  try {
    const { userId } = await auth()
    if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const dbUser = await getOrCreateUser(userId)
    if (!dbUser) return NextResponse.json({ error: 'User not found' }, { status: 404 })

    const dna = await getUserDNA(dbUser.id)
    
    return NextResponse.json({ 
      singularity: dna.singularity || null 
    })

  } catch (error) {
    console.error('Singularity State Error:', error)
    return NextResponse.json({ error: 'Failed to fetch state' }, { status: 500 })
  }
}
