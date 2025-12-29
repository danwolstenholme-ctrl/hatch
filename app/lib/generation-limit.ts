const DAILY_LIMIT = 5  // Matches pricing page: 5 free generations per day
const STORAGE_KEY = 'hatchit_generations'

interface GenerationData {
  count: number
  date: string
}

function getToday(): string {
  return new Date().toISOString().split('T')[0]
}

function getStoredData(): GenerationData {
  if (typeof window === 'undefined') {
    return { count: 0, date: getToday() }
  }
  
  try {
    const stored = localStorage.getItem(STORAGE_KEY)
    if (!stored) {
      return { count: 0, date: getToday() }
    }
    return JSON.parse(stored)
  } catch {
    return { count: 0, date: getToday() }
  }
}

function setStoredData(data: GenerationData): void {
  if (typeof window === 'undefined') return
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data))
}

export function getGenerationsRemaining(): number {
  const data = getStoredData()
  const today = getToday()
  
  if (data.date !== today) {
    return DAILY_LIMIT
  }
  
  return Math.max(0, DAILY_LIMIT - data.count)
}

export function getGenerationsUsed(): number {
  const data = getStoredData()
  const today = getToday()
  
  if (data.date !== today) {
    return 0
  }
  
  return data.count
}

export function canGenerate(): boolean {
  return getGenerationsRemaining() > 0
}

export function recordGeneration(): { success: boolean; remaining: number } {
  const data = getStoredData()
  const today = getToday()
  
  if (data.date !== today) {
    const newData = { count: 1, date: today }
    setStoredData(newData)
    return { success: true, remaining: DAILY_LIMIT - 1 }
  }
  
  if (data.count >= DAILY_LIMIT) {
    return { success: false, remaining: 0 }
  }
  
  const newData = { count: data.count + 1, date: today }
  setStoredData(newData)
  return { success: true, remaining: DAILY_LIMIT - newData.count }
}

export function getDailyLimit(): number {
  return DAILY_LIMIT
}