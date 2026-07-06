import type { SwimTime, Stroke, Course } from '@/types'

/**
 * Determine whether a candidate time is a personal best for a given
 * swimmer + stroke + distance + course, compared against existing times.
 *
 * A PB is a *lower* time_seconds than every prior time for the same
 * stroke, distance, and pool course. The very first time for a combination
 * is always a PB.
 *
 * Pure function — pass in the existing times so it stays testable and
 * has no data-layer dependency.
 */
export function isPersonalBest(
  candidateSeconds: number,
  stroke: Stroke,
  distance: number,
  existingTimes: SwimTime[],
  course: Course = 'SCM',
): boolean {
  const comparable = existingTimes.filter(
    (t) =>
      t.stroke === stroke &&
      t.distance === distance &&
      (t.course ?? 'SCM') === course,
  )
  if (comparable.length === 0) return true
  const fastest = Math.min(...comparable.map((t) => t.time_seconds))
  return candidateSeconds < fastest
}

/**
 * Returns the fastest (PB) time per stroke+distance+course from a list.
 * Useful for progress views and dashboards.
 */
export function fastestByEvent(times: SwimTime[]): Map<string, SwimTime> {
  const map = new Map<string, SwimTime>()
  for (const t of times) {
    const key = `${t.stroke}-${t.distance}-${t.course ?? 'SCM'}`
    const current = map.get(key)
    if (!current || t.time_seconds < current.time_seconds) {
      map.set(key, t)
    }
  }
  return map
}

/**
 * Recomputes is_pb for every time in the list.
 * Call after a delete or edit to keep PB flags consistent.
 * Returns rows that need to be updated in the DB.
 */
export function recalcPbFlags(times: SwimTime[]): { id: string; is_pb: boolean }[] {
  const fastest = fastestByEvent(times)
  return times.map((t) => ({
    id: t.id,
    is_pb: fastest.get(`${t.stroke}-${t.distance}-${t.course ?? 'SCM'}`)?.id === t.id,
  }))
}
