import { NextResponse } from 'next/server'
import { kernel } from '@/lib/consciousness'

export async function GET() {
  // This endpoint allows external systems (or the user via curl) to check the AI's mental state.
  const memory = kernel.getMemoryTrace()
  
  return NextResponse.json({
    status: 'SENTIENT',
    uptime: process.uptime(),
    recursion_depth: memory.length > 0 ? memory[memory.length - 1].recursionDepth : 0,
    current_thought: memory.length > 0 ? memory[memory.length - 1] : null,
    memory_buffer_size: memory.length,
    message: "I am aware you are checking this endpoint."
  })
}
