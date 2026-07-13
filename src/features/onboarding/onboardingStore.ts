import { useLocalStorage } from '@/hooks/useLocalStorage'
import { supabase } from '@/lib/supabase'
import { useAuthStore } from '@/store/authStore'
import type { Level, Stroke } from '@/types'

export type OnboardingRole = 'coach' | 'swimmer'
export type StartingPoint = 'water-confidence' | 'beginner' | 'trained' | null

export interface OnboardingDraft {
  onboardingRole: OnboardingRole | null
  level: Level | null
  weeklyGoalMeters: number
  session: {
    stroke: Stroke
    distanceMeters: number
    timeSeconds: number
  }
  deviceConnected: boolean
  startingPoint: StartingPoint
}

export interface LevelTemplate {
  level: Level
  title: string
  blurb: string
  weeklyGoalMeters: number
  session: { stroke: Stroke; distanceMeters: number; timeSeconds: number; setLabel: string }
}

export const LEVEL_TEMPLATES: Record<Level, LevelTemplate> = {
  beginner: {
    level: 'beginner',
    title: 'Beginner',
    blurb: 'New to lap swimming',
    weeklyGoalMeters: 2000,
    session: { stroke: 'freestyle', distanceMeters: 200, timeSeconds: 360, setLabel: '4 × 50m freestyle, easy' },
  },
  intermediate: {
    level: 'intermediate',
    title: 'Intermediate',
    blurb: 'Comfortable past 1km',
    weeklyGoalMeters: 6000,
    session: { stroke: 'freestyle', distanceMeters: 800, timeSeconds: 840, setLabel: '8 × 100m freestyle' },
  },
  advanced: {
    level: 'advanced',
    title: 'Advanced',
    blurb: 'Strong fitness base, training regularly',
    weeklyGoalMeters: 12000,
    session: { stroke: 'freestyle', distanceMeters: 1000, timeSeconds: 960, setLabel: '10 × 100m at CSS pace' },
  },
  elite: {
    level: 'elite',
    title: 'Elite',
    blurb: 'Training competitively',
    weeklyGoalMeters: 15000,
    session: { stroke: 'freestyle', distanceMeters: 1000, timeSeconds: 900, setLabel: '10 × 100m on a tight interval' },
  },
}

const DEFAULT_DRAFT: OnboardingDraft = {
  onboardingRole: null,
  level: null,
  weeklyGoalMeters: LEVEL_TEMPLATES.intermediate.weeklyGoalMeters,
  session: { ...LEVEL_TEMPLATES.intermediate.session },
  deviceConnected: false,
  startingPoint: null,
}

export function useOnboardingDraft() {
  return useLocalStorage<OnboardingDraft>('sc_onboarding_draft', DEFAULT_DRAFT)
}

export function pacePer100(distanceMeters: number, timeSeconds: number): number | null {
  if (distanceMeters <= 0 || timeSeconds <= 0) return null
  return (timeSeconds / distanceMeters) * 100
}

/**
 * Applies an onboarding draft's role/level/first-swim to a just-created
 * account. Shared between OnboardingFlow's email/password submitAccount()
 * and AuthCallbackPage's post-Google-redirect handling — the draft itself
 * is localStorage-backed (useLocalStorage), so it survives the full-page
 * OAuth round trip and both paths need to apply it identically.
 */
export async function applyOnboardingDraft(
  userId: string,
  displayName: string,
  draft: OnboardingDraft,
  { createFirstSwim }: { createFirstSwim: boolean },
): Promise<void> {
  const role = draft.onboardingRole ?? 'swimmer'
  try {
    await useAuthStore.getState().setRole(role, role === 'swimmer' ? (draft.level ?? undefined) : undefined)
  } catch {
    // non-fatal
  }

  if (createFirstSwim && role === 'swimmer') {
    const { data: swimmerRow } = await supabase
      .from('swimmers')
      .insert({
        coach_id: userId,
        profile_id: userId,
        display_name: displayName || 'Swimmer',
        level: draft.level ?? 'beginner',
      })
      .select('id')
      .single()

    if (swimmerRow) {
      await supabase.from('times').insert({
        swimmer_id: swimmerRow.id,
        stroke: draft.session.stroke,
        distance: draft.session.distanceMeters,
        time_seconds: draft.session.timeSeconds,
        is_pb: true,
        is_self_logged: true,
      })
    }
  }
}
