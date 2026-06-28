import type { Stroke } from '@/types'

export type Intensity = 'easy' | 'moderate' | 'hard'

export interface PlanSet {
  id: string
  drill_id?: string | null
  name: string
  stroke: Stroke | null
  distance: number
  reps: number
  rest_seconds: number
  intensity: Intensity
}

const INTENSITY_MULT: Record<Intensity, number> = {
  easy: 1.0,
  moderate: 1.5,
  hard: 2.5,
}

export type DifficultyLevel = 'Easy' | 'Moderate' | 'Hard' | 'Very Hard'

export interface DifficultyResult {
  level: DifficultyLevel
  score: number
  totalMeters: number
  tone: 'green' | 'blue' | 'amber' | 'red'
  description: string
}

export function calcDifficulty(sets: PlanSet[]): DifficultyResult {
  const totalMeters = sets.reduce((s, set) => s + set.distance * set.reps, 0)
  const score = sets.reduce(
    (s, set) => s + set.distance * set.reps * INTENSITY_MULT[set.intensity],
    0,
  )

  let level: DifficultyLevel
  let tone: DifficultyResult['tone']
  let description: string

  if (score < 1000) {
    level = 'Easy'
    tone = 'green'
    description = 'Recovery pace — comfortable throughout'
  } else if (score < 2500) {
    level = 'Moderate'
    tone = 'blue'
    description = 'Aerobic effort — steady and sustainable'
  } else if (score < 4500) {
    level = 'Hard'
    tone = 'amber'
    description = 'Threshold work — challenging but doable'
  } else {
    level = 'Very Hard'
    tone = 'red'
    description = 'Race intensity — push to the limit'
  }

  return { level, score, totalMeters, tone, description }
}

export function formatMeters(m: number): string {
  return m >= 1000 ? `${(m / 1000).toFixed(m % 1000 === 0 ? 0 : 1)}km` : `${m}m`
}
