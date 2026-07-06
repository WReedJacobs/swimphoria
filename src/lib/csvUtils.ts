import { formatTime, parseTime } from './formatTime'
import { STROKES, COURSES } from '@/types'
import type { SwimTime, Stroke, Course } from '@/types'

function csvCell(value: string | number | boolean): string {
  const str = String(value)
  if (str.includes(',') || str.includes('"') || str.includes('\n')) {
    return `"${str.replace(/"/g, '""')}"`
  }
  return str
}

function parseCsvLine(line: string): string[] {
  const result: string[] = []
  let current = ''
  let inQuotes = false
  for (let i = 0; i < line.length; i++) {
    const ch = line[i]
    if (ch === '"') {
      if (inQuotes && line[i + 1] === '"') {
        current += '"'
        i++
      } else {
        inQuotes = !inQuotes
      }
    } else if (ch === ',' && !inQuotes) {
      result.push(current)
      current = ''
    } else {
      current += ch
    }
  }
  result.push(current)
  return result
}

export function timesToCsv(times: SwimTime[]): string {
  const headers = ['date', 'stroke', 'distance_m', 'course', 'time', 'is_pb', 'notes']
  const rows = times.map((t) => [
    new Date(t.recorded_at).toLocaleDateString(),
    t.stroke,
    t.distance,
    t.course ?? 'SCM',
    formatTime(t.time_seconds),
    t.is_pb ? 'yes' : 'no',
    t.notes ?? '',
  ])
  return [headers, ...rows].map((row) => row.map(csvCell).join(',')).join('\r\n')
}

export function downloadCsv(content: string, filename: string): void {
  const blob = new Blob([content], { type: 'text/csv;charset=utf-8;' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  a.click()
  URL.revokeObjectURL(url)
}

export interface CsvTimeRow {
  stroke: Stroke
  distance: number
  time_seconds: number
  course: Course
  notes?: string
}

export function parseCsvTimes(csv: string): CsvTimeRow[] {
  const lines = csv.trim().split(/\r?\n/).filter(Boolean)
  if (lines.length < 2) return []
  const headers = lines[0].split(',').map((h) => h.trim().toLowerCase())
  const results: CsvTimeRow[] = []

  for (const line of lines.slice(1)) {
    const cols = parseCsvLine(line)
    const obj: Record<string, string> = {}
    headers.forEach((h, i) => {
      obj[h] = (cols[i] ?? '').trim()
    })

    const stroke = obj['stroke'] as Stroke
    const distance = Number(obj['distance_m'] || obj['distance'])
    const time_seconds = parseTime(obj['time'] ?? '')
    const rawCourse = (obj['course'] ?? '').toUpperCase()
    const course: Course = (COURSES as string[]).includes(rawCourse)
      ? (rawCourse as Course)
      : 'SCM'

    if (!STROKES.includes(stroke) || !distance || time_seconds == null) continue
    results.push({
      stroke,
      distance,
      time_seconds,
      course,
      notes: obj['notes'] || undefined,
    })
  }

  return results
}
