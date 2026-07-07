import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'
import { useAuth } from './useAuth'
import type { SetPreset, CatalogPreset } from '@/lib/presetUtils'

// ─── Queries ──────────────────────────────────────────────────────────────────

/** All global (owner_id IS NULL) + authenticated user's own presets. */
export function useSetPresets() {
  return useQuery({
    queryKey: ['set-presets'],
    queryFn: async (): Promise<SetPreset[]> => {
      const { data, error } = await supabase
        .from('set_presets')
        .select('*')
        .order('category')
        .order('title')
      if (error) throw error
      return (data ?? []).map(normalizePreset)
    },
  })
}

/** Only the current user's own saved presets. */
export function useMySetPresets() {
  const { user } = useAuth()
  return useQuery({
    queryKey: ['my-set-presets', user?.id],
    enabled: Boolean(user),
    queryFn: async (): Promise<SetPreset[]> => {
      const { data, error } = await supabase
        .from('set_presets')
        .select('*')
        .eq('owner_id', user!.id)
        .order('created_at', { ascending: false })
      if (error) throw error
      return (data ?? []).map(normalizePreset)
    },
  })
}

// ─── Mutations ────────────────────────────────────────────────────────────────

export function useSavePreset() {
  const { user } = useAuth()
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (preset: CatalogPreset): Promise<SetPreset> => {
      const { data, error } = await supabase
        .from('set_presets')
        .insert({ ...preset, owner_id: user!.id })
        .select()
        .single()
      if (error) throw error
      return normalizePreset(data)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['set-presets'] })
      queryClient.invalidateQueries({ queryKey: ['my-set-presets', user?.id] })
    },
  })
}

export function useUpdatePreset() {
  const { user } = useAuth()
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async ({
      id,
      ...updates
    }: Partial<CatalogPreset> & { id: string }): Promise<void> => {
      const { count, error } = await supabase
        .from('set_presets')
        .update(updates, { count: 'exact' })
        .eq('id', id)
        .eq('owner_id', user!.id)
      if (error) throw error
      if (count === 0) throw new Error('Preset not found or not yours')
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['set-presets'] })
      queryClient.invalidateQueries({ queryKey: ['my-set-presets', user?.id] })
    },
  })
}

export function useDeletePreset() {
  const { user } = useAuth()
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (id: string): Promise<void> => {
      const { count, error } = await supabase
        .from('set_presets')
        .delete({ count: 'exact' })
        .eq('id', id)
        .eq('owner_id', user!.id)
      if (error) throw error
      if (count === 0) throw new Error('Preset not found or not yours')
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['set-presets'] })
      queryClient.invalidateQueries({ queryKey: ['my-set-presets', user?.id] })
    },
  })
}

// ─── Normaliser ───────────────────────────────────────────────────────────────

function normalizePreset(raw: Record<string, unknown>): SetPreset {
  return {
    id: raw.id as string,
    owner_id: (raw.owner_id as string | null) ?? null,
    title: raw.title as string,
    category: raw.category as SetPreset['category'],
    level: raw.level as SetPreset['level'],
    stroke: (raw.stroke as string | null) ?? null,
    reps: Number(raw.reps),
    distance: Number(raw.distance),
    rest_type: raw.rest_type as SetPreset['rest_type'],
    rest_value: raw.rest_value != null ? Number(raw.rest_value) : null,
    equipment: Array.isArray(raw.equipment) ? (raw.equipment as string[]) : [],
    description: (raw.description as string) ?? '',
    structure: (raw.structure as SetPreset['structure']) ?? null,
    family: (raw.family as string | null) ?? null,
    created_at: raw.created_at as string,
  }
}
