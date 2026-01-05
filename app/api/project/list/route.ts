import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { getProjectsByUserId } from '@/lib/db/projects'
import { getUserByClerkId } from '@/lib/db/users'

export async function GET(req: NextRequest) {
  const { userId } = await auth()
  
  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    // Look up the Supabase user by Clerk ID
    const dbUser = await getUserByClerkId(userId)
    if (!dbUser) {
      return NextResponse.json({ projects: [] })
    }
    
    const projects = await getProjectsByUserId(dbUser.id)
    return NextResponse.json({ projects })
  } catch (error) {
    console.error('Error fetching projects:', error)
    return NextResponse.json({ error: 'Failed to fetch projects' }, { status: 500 })
  }
}
