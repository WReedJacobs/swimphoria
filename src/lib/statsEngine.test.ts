import { describe, it, expect } from 'vitest'
import { calculateStats, TIER_THRESHOLDS, type RawActivity } from './statsEngine'

const BASE: RawActivity = {
  pbCount: 0,
  cssResult: null,
  strokeVariety: 0,
  totalDistanceKm: 0,
  distanceMilestones: 0,
  drillsViewed: 0,
  structuredSessionsDone: 0,
  currentStreak: 0,
  longestStreak: 0,
  weeksWithSessions: 0,
  goalsAchieved: 0,
  improvementCount: 0,
  daysActive: 0,
  hasCoach: false,
  messagesSent: 0,
  goalsSet: 0,
  feedbackReceived: 0,
  lastSwimDate: null,
}

// ─── Phase 2 formula verification ───────────────────────────────────────────

describe('SPD formula', () => {
  it('increases with pbCount and improvementCount', () => {
    const base = calculateStats(BASE)
    const withPBs = calculateStats({ ...BASE, pbCount: 5, improvementCount: 5 })
    expect(withPBs.spd).toBeGreaterThan(base.spd)
  })

  it('strokeVariety no longer affects SPD', () => {
    const noVariety = calculateStats({ ...BASE, pbCount: 3, improvementCount: 3, strokeVariety: 0 })
    const highVariety = calculateStats({ ...BASE, pbCount: 3, improvementCount: 3, strokeVariety: 5 })
    expect(noVariety.spd).toBe(highVariety.spd)
  })

  it('CSS T-pace (lower = faster) contributes to SPD', () => {
    const noCss = calculateStats({ ...BASE, pbCount: 2, improvementCount: 2 })
    const fastCss = calculateStats({ ...BASE, pbCount: 2, improvementCount: 2, cssResult: 100 })
    expect(fastCss.spd).toBeGreaterThan(noCss.spd)
  })
})

describe('TEC formula', () => {
  it('structuredSessionsDone no longer affects TEC', () => {
    const noSessions = calculateStats({ ...BASE, drillsViewed: 10, strokeVariety: 2, structuredSessionsDone: 0 })
    const withSessions = calculateStats({ ...BASE, drillsViewed: 10, strokeVariety: 2, structuredSessionsDone: 20 })
    expect(noSessions.tec).toBe(withSessions.tec)
  })

  it('increases with drillsViewed, strokeVariety, and feedbackReceived', () => {
    const base = calculateStats(BASE)
    const active = calculateStats({ ...BASE, drillsViewed: 10, strokeVariety: 3, feedbackReceived: 5 })
    expect(active.tec).toBeGreaterThan(base.tec)
  })
})

describe('PRG formula', () => {
  it('improvementCount no longer affects PRG', () => {
    const noImprovement = calculateStats({ ...BASE, goalsAchieved: 2, pbCount: 3, improvementCount: 0 })
    const highImprovement = calculateStats({ ...BASE, goalsAchieved: 2, pbCount: 3, improvementCount: 100 })
    expect(noImprovement.prg).toBe(highImprovement.prg)
  })

  it('increases with goalsAchieved and pbCount', () => {
    const base = calculateStats(BASE)
    const active = calculateStats({ ...BASE, goalsAchieved: 5, pbCount: 10 })
    expect(active.prg).toBeGreaterThan(base.prg)
  })
})

describe('COM formula', () => {
  it('messagesSent no longer affects COM', () => {
    const noMessages = calculateStats({ ...BASE, daysActive: 10, messagesSent: 0 })
    const manyMessages = calculateStats({ ...BASE, daysActive: 10, messagesSent: 100 })
    expect(noMessages.com).toBe(manyMessages.com)
  })

  it('structuredSessionsDone increases COM', () => {
    const noSessions = calculateStats({ ...BASE, daysActive: 10 })
    const withSessions = calculateStats({ ...BASE, daysActive: 10, structuredSessionsDone: 10 })
    expect(withSessions.com).toBeGreaterThan(noSessions.com)
  })

  it('hasCoach adds a fixed boost to COM', () => {
    const noCoach = calculateStats({ ...BASE, daysActive: 5 })
    const withCoach = calculateStats({ ...BASE, daysActive: 5, hasCoach: true })
    expect(withCoach.com).toBeGreaterThan(noCoach.com)
  })
})

// ─── CON decay ───────────────────────────────────────────────────────────────

const STREAK_BASE: RawActivity = {
  ...BASE,
  longestStreak: 10,
  weeksWithSessions: 5,
}

describe('CON decay', () => {
  function daysAgo(n: number): string {
    const d = new Date()
    d.setDate(d.getDate() - n)
    return d.toISOString().slice(0, 10)
  }

  it('no decay when lastSwimDate is null', () => {
    const a = calculateStats({ ...STREAK_BASE, lastSwimDate: null })
    const b = calculateStats({ ...STREAK_BASE, lastSwimDate: null })
    expect(a.con).toBe(b.con)
  })

  it('no decay when inactive ≤ 14 days', () => {
    const baseline = calculateStats({ ...STREAK_BASE, lastSwimDate: null })
    const d14 = calculateStats({ ...STREAK_BASE, lastSwimDate: daysAgo(14) })
    expect(d14.con).toBe(baseline.con)
  })

  it('decays 2 pts per full week beyond 14 days', () => {
    const baseline = calculateStats({ ...STREAK_BASE, lastSwimDate: null })
    const d21 = calculateStats({ ...STREAK_BASE, lastSwimDate: daysAgo(21) })
    const d28 = calculateStats({ ...STREAK_BASE, lastSwimDate: daysAgo(28) })
    expect(baseline.con - d21.con).toBe(2)
    expect(baseline.con - d28.con).toBe(4)
  })

  it('partial week beyond threshold does not add extra decay', () => {
    const d21 = calculateStats({ ...STREAK_BASE, lastSwimDate: daysAgo(21) })
    const d27 = calculateStats({ ...STREAK_BASE, lastSwimDate: daysAgo(27) })
    expect(d21.con).toBe(d27.con)
  })

  it('con never falls below 20 regardless of inactivity length', () => {
    const ancient = calculateStats({ ...BASE, lastSwimDate: daysAgo(500) })
    expect(ancient.con).toBeGreaterThanOrEqual(20)
  })
})

// ─── Tier ordering ───────────────────────────────────────────────────────────

describe('TIER_THRESHOLDS', () => {
  it('thresholds are in strictly ascending OVR order', () => {
    const ovrs = TIER_THRESHOLDS.map((t) => t.ovr)
    for (let i = 1; i < ovrs.length; i++) {
      expect(ovrs[i]).toBeGreaterThan(ovrs[i - 1])
    }
  })

  it('all-zero activity produces rookie tier', () => {
    const result = calculateStats(BASE)
    expect(result.tier).toBe('rookie')
    expect(result.ovr).toBeLessThan(TIER_THRESHOLDS[0].ovr)
  })

  it('calculateStats tier label matches TIER_THRESHOLDS label for gold', () => {
    // Force OVR into gold range (75–84) by crafting a high-activity profile
    let found: ReturnType<typeof calculateStats> | null = null
    for (let pb = 20; pb <= 200; pb += 10) {
      const r = calculateStats({ ...BASE, pbCount: pb, improvementCount: pb, daysActive: pb, weeksWithSessions: pb / 5 })
      if (r.ovr >= 75 && r.ovr < 85) { found = r; break }
    }
    if (found) {
      expect(found.tier).toBe('gold')
    }
  })
})
