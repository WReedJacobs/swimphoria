import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'
import type { Booking, Drill, Profile, Role } from '@/types'

// ─── Extended types ────────────────────────────────────────────────────────

export type ProfileWithCoach = Profile & { coachName: string | null }

export type ActivityItem =
  | { type: 'session'; id: string; title: string; coachId: string; sortKey: string }
  | {
      type: 'time'
      id: string
      swimmerId: string
      stroke: string
      distance: number
      timeSeconds: number
      isPB: boolean
      sortKey: string
    }
  | {
      type: 'booking'
      id: string
      swimmerId: string
      coachId: string
      status: string
      notes: string | null
      sortKey: string
    }

export type BookingWithNames = Booking & { swimmerName: string; coachName: string }

export type SignupDay = { date: string; count: number; dayLabel: string }

export type AdminStats = {
  total: number
  coaches: number
  swimmers: number
  beginners: number
  admins: number
  sessions: number
  times: number
  bookings: number
}

// ─── Profiles ─────────────────────────────────────────────────────────────

export function useAllProfiles() {
  return useQuery({
    queryKey: ['admin', 'profiles'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .order('created_at', { ascending: false })
      if (error) throw error
      const profiles = data as Profile[]
      const coachMap = new Map(
        profiles.filter((p) => p.role === 'coach').map((p) => [p.id, p.full_name]),
      )
      return profiles.map((p) => ({
        ...p,
        coachName: p.coach_id ? (coachMap.get(p.coach_id) ?? null) : null,
      })) as ProfileWithCoach[]
    },
  })
}

export function useSetAdmin() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async ({ id, isAdmin }: { id: string; isAdmin: boolean }) => {
      const { error } = await supabase.from('profiles').update({ is_admin: isAdmin }).eq('id', id)
      if (error) throw error
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['admin', 'profiles'] })
      qc.invalidateQueries({ queryKey: ['admin', 'stats'] })
    },
  })
}

export function useUpdateUserRole() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async ({ id, role }: { id: string; role: Role }) => {
      const { error } = await supabase.from('profiles').update({ role }).eq('id', id)
      if (error) throw error
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['admin', 'profiles'] })
      qc.invalidateQueries({ queryKey: ['admin', 'stats'] })
    },
  })
}

export function useUnlinkCoach() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (userId: string) => {
      const { error } = await supabase
        .from('profiles')
        .update({ coach_id: null })
        .eq('id', userId)
      if (error) throw error
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['admin', 'profiles'] }),
  })
}

export function useLinkToCoach() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async ({ userId, coachId }: { userId: string; coachId: string }) => {
      const { error } = await supabase
        .from('profiles')
        .update({ coach_id: coachId })
        .eq('id', userId)
      if (error) throw error
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['admin', 'profiles'] }),
  })
}

export function useDeleteUser() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (userId: string) => {
      const { error } = await supabase.functions.invoke('admin-delete-user', {
        body: { userId },
      })
      if (error) throw error
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['admin', 'profiles'] })
      qc.invalidateQueries({ queryKey: ['admin', 'stats'] })
    },
  })
}

// ─── Stats ────────────────────────────────────────────────────────────────

export function useAdminStats() {
  return useQuery({
    queryKey: ['admin', 'stats'],
    queryFn: async (): Promise<AdminStats> => {
      const [coachRes, swimRes, begRes, adminRes, sessRes, timesRes, bookRes] = await Promise.all([
        supabase.from('profiles').select('*', { count: 'exact', head: true }).eq('role', 'coach'),
        supabase.from('profiles').select('*', { count: 'exact', head: true }).eq('role', 'swimmer'),
        supabase.from('profiles').select('*', { count: 'exact', head: true }).eq('role', 'beginner'),
        supabase.from('profiles').select('*', { count: 'exact', head: true }).eq('is_admin', true),
        supabase.from('sessions').select('*', { count: 'exact', head: true }),
        supabase.from('times').select('*', { count: 'exact', head: true }),
        supabase.from('bookings').select('*', { count: 'exact', head: true }),
      ])
      const c = coachRes.count ?? 0
      const sw = swimRes.count ?? 0
      const b = begRes.count ?? 0
      return {
        coaches: c,
        swimmers: sw,
        beginners: b,
        total: c + sw + b,
        admins: adminRes.count ?? 0,
        sessions: sessRes.count ?? 0,
        times: timesRes.count ?? 0,
        bookings: bookRes.count ?? 0,
      }
    },
  })
}

// ─── Drills ───────────────────────────────────────────────────────────────

export function useAllDrills() {
  return useQuery({
    queryKey: ['admin', 'drills'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('drills')
        .select('*')
        .order('stroke', { ascending: true })
        .order('created_at', { ascending: false })
      if (error) throw error
      return data as Drill[]
    },
  })
}

export function useCreateDrill() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (drill: Omit<Drill, 'id' | 'created_at' | 'coach_id'>) => {
      const { error } = await supabase.from('drills').insert({ ...drill, coach_id: null })
      if (error) throw error
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['admin', 'drills'] }),
  })
}

export function useUpdateDrill() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async ({ id, ...rest }: Partial<Omit<Drill, 'id'>> & { id: string }) => {
      const { error } = await supabase.from('drills').update(rest).eq('id', id)
      if (error) throw error
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['admin', 'drills'] }),
  })
}

export function useDeleteDrill() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('drills').delete().eq('id', id)
      if (error) throw error
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['admin', 'drills'] }),
  })
}

// ─── Bookings ─────────────────────────────────────────────────────────────

export function useAllBookings() {
  return useQuery({
    queryKey: ['admin', 'bookings'],
    queryFn: async () => {
      const { data: bookings, error } = await supabase
        .from('bookings')
        .select('*')
        .order('requested_at', { ascending: false })
      if (error) throw error
      const ids = new Set<string>()
      ;(bookings as Booking[]).forEach((b) => {
        ids.add(b.swimmer_id)
        ids.add(b.coach_id)
      })
      const { data: profiles } = await supabase
        .from('profiles')
        .select('id, full_name')
        .in('id', [...ids])
      const nameMap = new Map((profiles ?? []).map((p) => [p.id, p.full_name]))
      return (bookings as Booking[]).map((b) => ({
        ...b,
        swimmerName: nameMap.get(b.swimmer_id) ?? 'Unknown',
        coachName: nameMap.get(b.coach_id) ?? 'Unknown',
      })) as BookingWithNames[]
    },
  })
}

export function useUpdateBookingStatus() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async ({ id, status }: { id: string; status: string }) => {
      const { error } = await supabase.from('bookings').update({ status }).eq('id', id)
      if (error) throw error
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['admin', 'bookings'] }),
  })
}

// ─── Activity feed ────────────────────────────────────────────────────────

export function useAdminActivity() {
  return useQuery({
    queryKey: ['admin', 'activity'],
    queryFn: async (): Promise<ActivityItem[]> => {
      const [{ data: sessions }, { data: times }, { data: bookings }] = await Promise.all([
        supabase
          .from('sessions')
          .select('id, title, coach_id, created_at')
          .order('created_at', { ascending: false })
          .limit(25),
        supabase
          .from('times')
          .select('id, swimmer_id, stroke, distance, time_seconds, is_pb, recorded_at')
          .order('recorded_at', { ascending: false })
          .limit(25),
        supabase
          .from('bookings')
          .select('id, swimmer_id, coach_id, status, notes, requested_at')
          .order('requested_at', { ascending: false })
          .limit(25),
      ])
      const items: ActivityItem[] = [
        ...(sessions ?? []).map((s) => ({
          type: 'session' as const,
          id: s.id,
          title: s.title,
          coachId: s.coach_id,
          sortKey: s.created_at,
        })),
        ...(times ?? []).map((t) => ({
          type: 'time' as const,
          id: t.id,
          swimmerId: t.swimmer_id,
          stroke: t.stroke,
          distance: t.distance,
          timeSeconds: t.time_seconds,
          isPB: t.is_pb,
          sortKey: t.recorded_at,
        })),
        ...(bookings ?? []).map((b) => ({
          type: 'booking' as const,
          id: b.id,
          swimmerId: b.swimmer_id,
          coachId: b.coach_id,
          status: b.status,
          notes: b.notes,
          sortKey: b.requested_at,
        })),
      ]
      return items.sort((a, b) => b.sortKey.localeCompare(a.sortKey)).slice(0, 60)
    },
  })
}

// ─── Signups chart ────────────────────────────────────────────────────────

export function useSignupsByDay() {
  return useQuery({
    queryKey: ['admin', 'signups-by-day'],
    queryFn: async (): Promise<SignupDay[]> => {
      const from = new Date()
      from.setDate(from.getDate() - 13)
      from.setHours(0, 0, 0, 0)
      const { data, error } = await supabase
        .from('profiles')
        .select('created_at')
        .gte('created_at', from.toISOString())
      if (error) throw error
      const days: SignupDay[] = []
      for (let i = 13; i >= 0; i--) {
        const d = new Date()
        d.setDate(d.getDate() - i)
        days.push({
          date: d.toISOString().slice(0, 10),
          count: 0,
          dayLabel: d.toLocaleDateString('en-US', { weekday: 'short' }).slice(0, 3),
        })
      }
      const countMap = new Map(days.map((d) => [d.date, d]))
      ;(data ?? []).forEach((p) => {
        const day = p.created_at.slice(0, 10)
        const entry = countMap.get(day)
        if (entry) entry.count++
      })
      return days
    },
  })
}
