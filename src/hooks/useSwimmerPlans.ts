import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'
import { useAuth } from './useAuth'
import type { PlanSet } from '@/lib/planDifficulty'

export interface SwimmerPlan {
  id: string
  profile_id: string
  title: string
  scheduled_date: string
  sets: PlanSet[]
  notes: string | null
  completed: boolean
  created_at: string
}

// ─── Fetch plans for a date window ────────────────────────────────────────

export function useMyPlans(from: string, to: string) {
  const { user } = useAuth()
  return useQuery({
    queryKey: ['swimmer-plans', user?.id, from, to],
    enabled: Boolean(user),
    queryFn: async (): Promise<SwimmerPlan[]> => {
      const { data, error } = await supabase
        .from('swimmer_plans')
        .select('*')
        .eq('profile_id', user!.id)
        .gte('scheduled_date', from)
        .lte('scheduled_date', to)
        .order('scheduled_date', { ascending: true })
      if (error) throw error
      return data as SwimmerPlan[]
    },
  })
}

// ─── Create ───────────────────────────────────────────────────────────────

export function useCreatePlan() {
  const { user } = useAuth()
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (payload: {
      title: string
      scheduled_date: string
      sets: PlanSet[]
      notes?: string
    }) => {
      const { data, error } = await supabase
        .from('swimmer_plans')
        .insert({ ...payload, profile_id: user!.id })
        .select()
        .single()
      if (error) throw error
      return data as SwimmerPlan
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['swimmer-plans'] }),
  })
}

// ─── Update ───────────────────────────────────────────────────────────────

export function useUpdatePlan() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async ({
      id,
      ...payload
    }: Partial<Omit<SwimmerPlan, 'id' | 'profile_id' | 'created_at'>> & { id: string }) => {
      const { error } = await supabase.from('swimmer_plans').update(payload).eq('id', id)
      if (error) throw error
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['swimmer-plans'] }),
  })
}

// ─── Delete ───────────────────────────────────────────────────────────────

export function useDeletePlan() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('swimmer_plans').delete().eq('id', id)
      if (error) throw error
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['swimmer-plans'] }),
  })
}

// ─── Toggle complete ──────────────────────────────────────────────────────

export function useToggleComplete() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async ({ id, completed }: { id: string; completed: boolean }) => {
      const { error } = await supabase
        .from('swimmer_plans')
        .update({ completed })
        .eq('id', id)
      if (error) throw error
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['swimmer-plans'] }),
  })
}
