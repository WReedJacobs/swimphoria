import { useState } from 'react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'
import { useAuthStore } from '@/store/authStore'
import { useAuth } from './useAuth'

const CODE_CHARS = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'

function generateCode(): string {
  return Array.from(
    { length: 6 },
    () => CODE_CHARS[Math.floor(Math.random() * CODE_CHARS.length)],
  ).join('')
}

/** Coach: get their current join code, or generate + save a new one. */
export function useMyJoinCode() {
  const { profile, user } = useAuth()
  const [generating, setGenerating] = useState(false)

  const generate = async (): Promise<string | null> => {
    if (!user) return null
    setGenerating(true)
    try {
      let code = generateCode()
      // Retry once on conflict (collision is ~1-in-a-billion but handle it)
      for (let attempt = 0; attempt < 3; attempt++) {
        const { error } = await supabase
          .from('profiles')
          .update({ join_code: code })
          .eq('id', user.id)
        if (!error) break
        if (error.code === '23505') {
          code = generateCode()
        } else {
          throw error
        }
      }
      await useAuthStore.getState().refreshProfile()
      return code
    } finally {
      setGenerating(false)
    }
  }

  return { code: profile?.join_code ?? null, generate, generating }
}

interface JoinCoachResult {
  success?: boolean
  swimmer_id?: string
  error?: string
}

/** Swimmer: redeem a join code to link to a coach. */
export function useJoinCoach() {
  const qc = useQueryClient()

  return useMutation({
    mutationFn: async (code: string): Promise<JoinCoachResult> => {
      const { data, error } = await supabase.rpc('join_coach', {
        p_join_code: code.toUpperCase().trim(),
      })
      if (error) throw new Error(error.message)
      return data as JoinCoachResult
    },
    onSuccess: async (result) => {
      if (result.success) {
        await useAuthStore.getState().refreshProfile()
        qc.invalidateQueries({ queryKey: ['my-swimmer'] })
        qc.invalidateQueries({ queryKey: ['times'] })
        qc.invalidateQueries({ queryKey: ['assigned-sessions'] })
      }
    },
  })
}
