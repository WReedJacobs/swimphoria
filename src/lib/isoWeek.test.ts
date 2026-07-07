import { describe, it, expect } from 'vitest'
import { isoWeekKey } from './isoWeek'

describe('isoWeekKey', () => {
  it('returns correct week for a mid-year Monday', () => {
    // Jan 15 2024 is a Monday = ISO week 3
    expect(isoWeekKey(new Date(2024, 0, 15))).toBe('2024-W03')
  })

  it('pads single-digit week numbers with a leading zero', () => {
    // Jan 8 2024 is a Monday = ISO week 2
    expect(isoWeekKey(new Date(2024, 0, 8))).toBe('2024-W02')
  })

  it('Dec 31 2023 (Sunday) belongs to 2023-W52, not 2024-W01', () => {
    expect(isoWeekKey(new Date(2023, 11, 31))).toBe('2023-W52')
  })

  it('Jan 1 2016 (Friday) belongs to 2015-W53 (year-boundary roll-back)', () => {
    // 2015 has 53 ISO weeks because Jan 1 2015 is a Thursday
    expect(isoWeekKey(new Date(2016, 0, 1))).toBe('2015-W53')
  })

  it('Dec 29 2014 (Monday) belongs to 2015-W01 (year-boundary roll-forward)', () => {
    // The week containing Jan 1 2015 (Thursday) starts Dec 29 2014
    expect(isoWeekKey(new Date(2014, 11, 29))).toBe('2015-W01')
  })

  it('Jan 1 2024 (Monday) is 2024-W01', () => {
    // 2024 starts on Monday; the first Thursday is Jan 4 → W01 includes Jan 1
    expect(isoWeekKey(new Date(2024, 0, 1))).toBe('2024-W01')
  })

  it('two dates in the same ISO week return the same key', () => {
    // Mon Jan 8 and Sun Jan 14 2024 are both in W02
    const mon = isoWeekKey(new Date(2024, 0, 8))
    const sun = isoWeekKey(new Date(2024, 0, 14))
    expect(mon).toBe(sun)
  })

  it('consecutive days spanning a week boundary return different keys', () => {
    // Sun Jan 14 2024 (W02) vs Mon Jan 15 2024 (W03)
    const sun = isoWeekKey(new Date(2024, 0, 14))
    const mon = isoWeekKey(new Date(2024, 0, 15))
    expect(sun).not.toBe(mon)
  })
})
