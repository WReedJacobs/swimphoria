/** Returns YYYY-MM-DD in the browser's local timezone. */
export function localDateStr(d: Date = new Date()): string {
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${y}-${m}-${day}`
}

/** Add n days to a YYYY-MM-DD string, returning a new YYYY-MM-DD string. */
export function addDaysStr(dateStr: string, n: number): string {
  const d = new Date(`${dateStr}T00:00:00`)
  d.setDate(d.getDate() + n)
  return localDateStr(d)
}

/** True if two Date objects fall on the same local calendar day. */
export function isSameLocalDay(a: Date, b: Date): boolean {
  return localDateStr(a) === localDateStr(b)
}
