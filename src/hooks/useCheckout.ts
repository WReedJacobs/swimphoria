import { useMutation } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'
import type { Plan } from '@/types'

export type BillingInterval = 'month' | 'year'

/** Redirects to a Stripe Checkout session for the given plan/interval. The
 * actual entitlement is only ever granted by the webhook handler writing to
 * `subscriptions` — this just starts the payment flow. */
export function useCreateCheckoutSession() {
  return useMutation({
    mutationFn: async ({ plan, interval }: { plan: Plan; interval: BillingInterval }) => {
      const { data, error } = await supabase.functions.invoke('create-checkout-session', {
        body: { plan, interval },
      })
      if (error) throw error
      return data as { url: string }
    },
    onSuccess: ({ url }) => {
      window.location.href = url
    },
  })
}

/** Redirects to the Stripe Customer Portal for self-serve upgrade/cancel. */
export function useCreatePortalSession() {
  return useMutation({
    mutationFn: async () => {
      const { data, error } = await supabase.functions.invoke('create-portal-session', { body: {} })
      if (error) throw error
      return data as { url: string }
    },
    onSuccess: ({ url }) => {
      window.location.href = url
    },
  })
}
