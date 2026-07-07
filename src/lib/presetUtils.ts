// Shared types and helpers for the Preset Set Library.
// No DOM / framework deps — unit-tested in presetUtils.test.ts.

export type PresetCategory =
  | 'warmup' | 'endurance' | 'threshold' | 'sprint' | 'kick' | 'pull'
  | 'technique' | 'medley' | 'pyramid' | 'race_pace' | 'recovery' | 'cooldown' | 'test'

export type PresetRestType = 'rest_seconds' | 'interval_seconds' | 'css_offset' | 'none'

export type PresetLevel = 'beginner' | 'intermediate' | 'elite'

export interface PresetLeg {
  reps: number
  distance: number
  note?: string
}

export interface SetPreset {
  id: string
  owner_id: string | null
  title: string
  category: PresetCategory
  level: PresetLevel
  stroke: string | null
  reps: number
  distance: number
  rest_type: PresetRestType
  rest_value: number | null
  equipment: string[]
  description: string
  structure: PresetLeg[] | null
  family: string | null
  created_at: string
}

// Omit DB-generated fields for catalog / save payloads
export type CatalogPreset = Omit<SetPreset, 'id' | 'owner_id' | 'created_at'>

// ─── Calculation helpers ──────────────────────────────────────────────────────

/**
 * Total meters for a preset. Uses structure legs when present;
 * falls back to reps × distance for uniform sets.
 */
export function presetTotalMeters(
  preset: Pick<SetPreset, 'reps' | 'distance' | 'structure'>,
): number {
  if (preset.structure && preset.structure.length > 0) {
    return preset.structure.reduce((sum, leg) => sum + leg.reps * leg.distance, 0)
  }
  return preset.reps * preset.distance
}

/**
 * Format a whole-second interval as swim-clock notation (:30, 1:20, 2:00).
 */
export function formatInterval(totalSeconds: number): string {
  const s = Math.round(totalSeconds)
  const mins = Math.floor(s / 60)
  const secs = s % 60
  if (mins === 0) return `:${String(secs).padStart(2, '0')}`
  return `${mins}:${String(secs).padStart(2, '0')}`
}

/**
 * Render a human-readable rest/interval description.
 *
 * Branches:
 *   rest_seconds   → "30s rest"
 *   interval_seconds → "on 1:45"
 *   css_offset (with cssPacePer100) → "on 1:45 (CSS+5)" — rounded up to next 5s
 *   css_offset (no CSS data)        → "@ CSS+5s/100"
 *   none           → "full recovery"
 */
export function renderRest(
  preset: Pick<SetPreset, 'rest_type' | 'rest_value' | 'distance'>,
  cssPacePer100?: number | null,
): string {
  const v = preset.rest_value
  switch (preset.rest_type) {
    case 'rest_seconds':
      return v != null ? `${v}s rest` : 'rest'
    case 'interval_seconds':
      return v != null ? `on ${formatInterval(v)}` : 'on interval'
    case 'css_offset': {
      if (cssPacePer100 != null && v != null) {
        const rawRepPace = (preset.distance / 100) * (cssPacePer100 + v)
        const roundedUp = Math.ceil(rawRepPace / 5) * 5
        const sign = v >= 0 ? `+${v}` : `${v}`
        return `on ${formatInterval(roundedUp)} (CSS${sign})`
      }
      const sign = v != null ? (v >= 0 ? `+${v}` : `${v}`) : ''
      return `@ CSS${sign}s/100`
    }
    case 'none':
      return 'full recovery'
    default:
      return ''
  }
}

/**
 * Short pattern string for the set card: "10×100m" or "25 / 50 / 75 / 100 / 75 / 50 / 25".
 */
export function presetPattern(
  preset: Pick<SetPreset, 'reps' | 'distance' | 'structure'>,
): string {
  if (preset.structure && preset.structure.length > 0) {
    if (preset.structure.length === 1) {
      const leg = preset.structure[0]
      return leg.reps > 1 ? `${leg.reps}×${leg.distance}m` : `${leg.distance}m`
    }
    return preset.structure
      .map((l) => (l.reps > 1 ? `${l.reps}×${l.distance}` : `${l.distance}`))
      .join(' / ')
  }
  return `${preset.reps}×${preset.distance}m`
}

/**
 * Navigate within a progression family by level.
 * Returns the next (harder) or previous (easier) preset in the same family,
 * or null if none exists.
 */
export function nextPreset(
  presets: SetPreset[],
  current: SetPreset,
  direction: 'harder' | 'easier',
): SetPreset | null {
  if (!current.family) return null
  const LEVEL_ORDER: PresetLevel[] = ['beginner', 'intermediate', 'elite']
  const family = presets.filter((p) => p.family === current.family && p.owner_id === null)
  const currentIdx = LEVEL_ORDER.indexOf(current.level)
  if (direction === 'harder') {
    return family.find((p) => LEVEL_ORDER.indexOf(p.level) > currentIdx) ?? null
  }
  return [...family].reverse().find((p) => LEVEL_ORDER.indexOf(p.level) < currentIdx) ?? null
}

// ─── Category display helpers ─────────────────────────────────────────────────

export const CATEGORY_LABELS: Record<PresetCategory, string> = {
  warmup:     'Warm-up',
  endurance:  'Endurance',
  threshold:  'Threshold',
  sprint:     'Sprint',
  kick:       'Kick',
  pull:       'Pull',
  technique:  'Technique',
  medley:     'Medley',
  pyramid:    'Pyramid',
  race_pace:  'Race pace',
  recovery:   'Recovery',
  cooldown:   'Cool-down',
  test:       'Test',
}

export const LEVEL_LABELS: Record<PresetLevel, string> = {
  beginner:     'Beginner',
  intermediate: 'Intermediate',
  elite:        'Elite',
}
