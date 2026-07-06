import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'
import { useAuth } from './useAuth'
import { calculateStats, type RawActivity } from '@/lib/statsEngine'
import { localDateStr } from '@/lib/dateLocal'
import type { Profile } from '@/types'

// ─── Types ────────────────────────────────────────────────────────────────

export interface SwimmerStatsRow {
  id: string
  user_id: string
  ovr: number
  prev_ovr: number
  spd: number
  end_stat: number
  tec: number
  con: number
  prg: number
  com: number
  tier: string
  last_calculated: string
  created_at: string
}

export interface LeaderboardEntry extends SwimmerStatsRow {
  profile: Pick<Profile, 'id' | 'full_name' | 'display_handle' | 'role' | 'avatar_url'> | null
}

// ─── Streak helper ────────────────────────────────────────────────────────

function calcStreaks(sortedDates: string[]) {
  if (!sortedDates.length) return { currentStreak: 0, longestStreak: 0 }
  let longest = 1, run = 1
  for (let i = 1; i < sortedDates.length; i++) {
    const diff =
      (new Date(sortedDates[i]).getTime() - new Date(sortedDates[i - 1]).getTime()) /
      86_400_000
    if (Math.round(diff) === 1) { run++; longest = Math.max(longest, run) }
    else run = 1
  }
  const dateSet = new Set(sortedDates)
  let current = 0
  const d = new Date()
  while (dateSet.has(localDateStr(d))) {
    current++
    d.setDate(d.getDate() - 1)
  }
  return { currentStreak: current, longestStreak: longest }
}

// ─── Core activity-gathering function (reused by both self and admin) ─────

async function gatherRawActivity(
  userId: string,
  profileData: { coach_id: string | null } | null,
): Promise<RawActivity> {
  // Find the swimmer record linked to this profile
  const { data: swimmerRow } = await supabase
    .from('swimmers')
    .select('id')
    .eq('profile_id', userId)
    .maybeSingle()
  const swimmerId = swimmerRow?.id ?? null

  const [timesRes, goalsRes, milestonesRes, msgRes, feedbackRes, sessionsRes, cssRes, drillsRes] =
    await Promise.all([
      swimmerId
        ? supabase
            .from('times')
            .select('stroke, distance, is_pb, recorded_at')
            .eq('swimmer_id', swimmerId)
        : Promise.resolve({ data: [] as any[] }),
      swimmerId
        ? supabase.from('goals').select('achieved').eq('swimmer_id', swimmerId)
        : Promise.resolve({ data: [] as any[] }),
      supabase
        .from('milestones')
        .select('id')
        .eq('profile_id', userId)
        .eq('achieved', true),
      supabase
        .from('messages')
        .select('id', { count: 'exact', head: true })
        .eq('sender_id', userId),
      swimmerId
        ? supabase
            .from('feedback')
            .select('id', { count: 'exact', head: true })
            .eq('swimmer_id', swimmerId)
        : Promise.resolve({ count: 0 }),
      swimmerId
        ? supabase
            .from('session_assignments')
            .select('attended')
            .eq('swimmer_id', swimmerId)
            .eq('attended', true)
        : Promise.resolve({ data: [] as any[] }),
      swimmerId
        ? supabase
            .from('css_results')
            .select('pace_per_100')
            .eq('swimmer_id', swimmerId)
            .order('recorded_at', { ascending: false })
            .limit(1)
            .maybeSingle()
        : Promise.resolve({ data: null }),
      // Coaches earn TEC by creating drills
      supabase
        .from('drills')
        .select('id', { count: 'exact', head: true })
        .eq('coach_id', userId),
    ])

  const times = (timesRes.data ?? []) as Array<{
    stroke: string
    distance: number
    is_pb: boolean
    recorded_at: string
  }>
  const goals = (goalsRes.data ?? []) as Array<{ achieved: boolean }>
  const sessionsDone = (sessionsRes.data ?? []).length
  const cssResult = (cssRes.data as any)?.pace_per_100 ?? null

  const pbCount = times.filter((t) => t.is_pb).length
  const strokeVariety = new Set(times.map((t) => t.stroke)).size
  const totalDistanceKm = times.reduce((s, t) => s + t.distance, 0) / 1000

  const sortedDates = [...new Set(times.map((t) => t.recorded_at.slice(0, 10)))].sort()
  const { currentStreak, longestStreak } = calcStreaks(sortedDates)

  const weeksWithSessions = new Set(
    times.map((t) => {
      const d = new Date(t.recorded_at)
      const dayOfYear =
        Math.floor((d.getTime() - new Date(d.getFullYear(), 0, 1).getTime()) / 86_400_000) + 1
      return `${d.getFullYear()}-W${Math.ceil(dayOfYear / 7)}`
    }),
  ).size

  const drillsCreated = drillsRes.count ?? 0

  return {
    pbCount,
    cssResult,
    strokeVariety,
    totalDistanceKm,
    distanceMilestones: (milestonesRes.data ?? []).length,
    drillsViewed: drillsCreated * 2,
    structuredSessionsDone: sessionsDone,
    currentStreak,
    longestStreak,
    weeksWithSessions,
    goalsAchieved: goals.filter((g) => g.achieved).length,
    improvementCount: pbCount,
    daysActive: sortedDates.length,
    hasCoach: !!profileData?.coach_id,
    messagesSent: msgRes.count ?? 0,
    goalsSet: goals.length,
    feedbackReceived: feedbackRes.count ?? 0,
  }
}

// ─── Own stats ────────────────────────────────────────────────────────────

export function useMyStats() {
  const { user } = useAuth()
  return useQuery({
    queryKey: ['my-stats', user?.id],
    enabled: Boolean(user),
    queryFn: async (): Promise<SwimmerStatsRow | null> => {
      const { data, error } = await supabase
        .from('swimmer_stats')
        .select('*')
        .eq('user_id', user!.id)
        .maybeSingle()
      if (error) throw error
      return data as SwimmerStatsRow | null
    },
  })
}

export function useRecalculateStats() {
  const { user, profile } = useAuth()
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async () => {
      if (!user) throw new Error('Not authenticated')
      const raw = await gatherRawActivity(user.id, profile)
      const stats = calculateStats(raw)

      // Preserve prev_ovr if last_calculated was 7+ days ago
      const { data: existing } = await supabase
        .from('swimmer_stats')
        .select('ovr, last_calculated')
        .eq('user_id', user.id)
        .maybeSingle()
      const prevOvr =
        existing &&
        Date.now() - new Date(existing.last_calculated).getTime() >= 7 * 86_400_000
          ? existing.ovr
          : (existing?.ovr ?? stats.ovr)

      const { error } = await supabase.from('swimmer_stats').upsert(
        {
          user_id: user.id,
          ...stats,
          prev_ovr: prevOvr,
          last_calculated: new Date().toISOString(),
        },
        { onConflict: 'user_id' },
      )
      if (error) throw error

      // Store OVR history in localStorage (last 10)
      const key = `swimphoria:ovr_history:${user.id}`
      const prev = JSON.parse(localStorage.getItem(key) ?? '[]') as Array<{
        ovr: number
        date: string
      }>
      localStorage.setItem(
        key,
        JSON.stringify([...prev, { ovr: stats.ovr, date: new Date().toISOString() }].slice(-10)),
      )

      return stats
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['my-stats'] })
      qc.invalidateQueries({ queryKey: ['leaderboard'] })
    },
  })
}

// ─── Public leaderboard ───────────────────────────────────────────────────

export function useLeaderboard(sortBy: keyof SwimmerStatsRow = 'ovr') {
  return useQuery({
    queryKey: ['leaderboard', sortBy],
    queryFn: async (): Promise<LeaderboardEntry[]> => {
      const { data: profiles } = await supabase
        .from('profiles')
        .select('id, full_name, display_handle, role, avatar_url')
        .eq('is_public', true)
      if (!profiles?.length) return []
      const ids = profiles.map((p) => p.id)
      const { data: stats, error } = await supabase
        .from('swimmer_stats')
        .select('*')
        .in('user_id', ids)
        .order(sortBy, { ascending: false })
        .limit(20)
      if (error) throw error
      const profileMap = new Map(profiles.map((p) => [p.id, p]))
      return ((stats ?? []) as SwimmerStatsRow[]).map((s) => ({
        ...s,
        profile: profileMap.get(s.user_id) ?? null,
      }))
    },
  })
}

export function useSquadLeaderboard(coachId: string | null) {
  return useQuery({
    queryKey: ['leaderboard', 'squad', coachId],
    enabled: Boolean(coachId),
    queryFn: async (): Promise<LeaderboardEntry[]> => {
      const { data: profiles } = await supabase
        .from('profiles')
        .select('id, full_name, display_handle, role, avatar_url')
        .eq('coach_id', coachId!)
      if (!profiles?.length) return []
      const ids = profiles.map((p) => p.id)
      const { data: stats, error } = await supabase
        .from('swimmer_stats')
        .select('*')
        .in('user_id', ids)
        .order('ovr', { ascending: false })
      if (error) throw error
      const profileMap = new Map(profiles.map((p) => [p.id, p]))
      return ((stats ?? []) as SwimmerStatsRow[]).map((s) => ({
        ...s,
        profile: profileMap.get(s.user_id) ?? null,
      }))
    },
  })
}

// ─── Admin hooks ──────────────────────────────────────────────────────────

export function useAllStats() {
  return useQuery({
    queryKey: ['admin', 'all-stats'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('swimmer_stats')
        .select('*, profile:profiles!user_id(full_name, role, email, avatar_url)')
        .order('ovr', { ascending: false })
      if (error) throw error
      return data as Array<
        SwimmerStatsRow & {
          profile: { full_name: string; role: string; email?: string; avatar_url: string | null } | null
        }
      >
    },
  })
}

export function useAdminRecalculate() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (userId: string) => {
      const { data: prof } = await supabase
        .from('profiles')
        .select('coach_id')
        .eq('id', userId)
        .single()
      const raw = await gatherRawActivity(userId, prof)
      const stats = calculateStats(raw)
      const { data: existing } = await supabase
        .from('swimmer_stats')
        .select('ovr, last_calculated')
        .eq('user_id', userId)
        .maybeSingle()
      const prevOvr =
        existing &&
        Date.now() - new Date(existing.last_calculated).getTime() >= 7 * 86_400_000
          ? existing.ovr
          : (existing?.ovr ?? stats.ovr)
      const { error } = await supabase.from('swimmer_stats').upsert(
        {
          user_id: userId,
          ...stats,
          prev_ovr: prevOvr,
          last_calculated: new Date().toISOString(),
        },
        { onConflict: 'user_id' },
      )
      if (error) throw error
      return stats
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['admin', 'all-stats'] })
      qc.invalidateQueries({ queryKey: ['leaderboard'] })
    },
  })
}

// ─── Public profile toggle ────────────────────────────────────────────────

export function useSetPublic() {
  const { user } = useAuth()
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (isPublic: boolean) => {
      const { error } = await supabase
        .from('profiles')
        .update({ is_public: isPublic })
        .eq('id', user!.id)
      if (error) throw error
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['auth', 'profile'] }),
  })
}
