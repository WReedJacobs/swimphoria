import { describe, it, expect } from 'vitest'
import { localDateStr, addDaysStr, isSameLocalDay } from './dateLocal'

describe('localDateStr', () => {
  it('formats a date as YYYY-MM-DD in local time', () => {
    const d = new Date(2024, 0, 5) // Jan 5 2024, local midnight
    expect(localDateStr(d)).toBe('2024-01-05')
  })

  it('pads single-digit months and days', () => {
    const d = new Date(2025, 2, 3) // Mar 3 2025
    expect(localDateStr(d)).toBe('2025-03-03')
  })

  it('defaults to today without crashing', () => {
    const result = localDateStr()
    expect(result).toMatch(/^\d{4}-\d{2}-\d{2}$/)
  })
})

describe('addDaysStr', () => {
  it('adds positive days correctly', () => {
    expect(addDaysStr('2024-01-30', 3)).toBe('2024-02-02')
  })

  it('subtracts days with negative n', () => {
    expect(addDaysStr('2024-03-01', -1)).toBe('2024-02-29') // 2024 is a leap year
  })

  it('handles month boundaries', () => {
    expect(addDaysStr('2024-12-31', 1)).toBe('2025-01-01')
  })
})

describe('isSameLocalDay', () => {
  it('returns true for dates that are the same local calendar day', () => {
    const a = new Date(2024, 5, 15, 9, 0)
    const b = new Date(2024, 5, 15, 23, 59)
    expect(isSameLocalDay(a, b)).toBe(true)
  })

  it('returns false for dates on different local days', () => {
    const a = new Date(2024, 5, 15, 23, 59)
    const b = new Date(2024, 5, 16, 0, 0)
    expect(isSameLocalDay(a, b)).toBe(false)
  })
})
