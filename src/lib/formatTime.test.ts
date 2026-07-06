import { describe, it, expect } from 'vitest'
import { formatTime, parseTime, formatStopwatch } from './formatTime'

describe('formatTime', () => {
  it('formats sub-minute times as SS.cc', () => {
    expect(formatTime(47.32)).toBe('47.32')
    expect(formatTime(9.5)).toBe('9.50')
  })

  it('formats times ≥60s as M:SS.cc', () => {
    expect(formatTime(62.45)).toBe('1:02.45')
    expect(formatTime(120)).toBe('2:00.00')
  })

  it('returns em-dash for invalid input', () => {
    expect(formatTime(-1)).toBe('—')
    expect(formatTime(NaN)).toBe('—')
    expect(formatTime(Infinity)).toBe('—')
  })
})

describe('parseTime', () => {
  it('parses simple decimal seconds', () => {
    expect(parseTime('47.32')).toBeCloseTo(47.32)
    expect(parseTime('62.5')).toBeCloseTo(62.5)
  })

  it('parses MM:SS.cc format', () => {
    expect(parseTime('1:02.45')).toBeCloseTo(62.45)
    expect(parseTime('2:00')).toBeCloseTo(120)
  })

  it('rejects invalid formats', () => {
    expect(parseTime('')).toBeNull()
    expect(parseTime('abc')).toBeNull()
    expect(parseTime('1:70')).toBeNull()
    expect(parseTime('1:2:3')).toBeNull()
  })

  it('rejects negative values', () => {
    expect(parseTime('-5')).toBeNull()
  })
})

describe('formatStopwatch', () => {
  it('formats 0 as 00:00.00', () => {
    expect(formatStopwatch(0)).toBe('00:00.00')
  })

  it('formats 1500ms as 00:01.50', () => {
    expect(formatStopwatch(1500)).toBe('00:01.50')
  })

  it('formats 62450ms as 01:02.45', () => {
    expect(formatStopwatch(62450)).toBe('01:02.45')
  })

  it('handles large values', () => {
    expect(formatStopwatch(3661000)).toBe('61:01.00')
  })
})
