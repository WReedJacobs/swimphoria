import type { Plan, Subscription, SubscriptionStatus } from '@/types'

/**
 * Pure, DOM-free entitlement logic — mirrors the has_entitlement() Postgres
 * function (see migration 034). This copy is for UI decisions (show/hide a
 * button, an upsell banner); it must never be the only check. Anything that
 * actually runs a gated feature re-checks server-side via has_entitlement(),
 * since a client-side-only gate is not a real gate.
 */

export type Feature = 'ai_coach' | 'extra_roster'

const ACTIVE_STATUSES: SubscriptionStatus[] = ['active', 'trialing']

const FEATURE_PLANS: Record<Feature, Plan[]> = {
  ai_coach: ['ai_coach'],
  extra_roster: ['coach_pro', 'coach_club'],
}

function isActive(subscription: Subscription | null): boolean {
  return subscription != null && ACTIVE_STATUSES.includes(subscription.status)
}

export function hasEntitlement(subscription: Subscription | null, feature: Feature): boolean {
  if (!isActive(subscription)) return false
  return FEATURE_PLANS[feature].includes(subscription!.plan)
}

/** Roster size cap for a coach's current plan — null means unlimited. */
export function rosterCap(subscription: Subscription | null): number | null {
  if (!isActive(subscription)) return 2
  if (subscription!.plan === 'coach_club') return null
  if (subscription!.plan === 'coach_pro') return 25
  return 2
}

export function canAddSwimmer(subscription: Subscription | null, currentSwimmerCount: number): boolean {
  const cap = rosterCap(subscription)
  return cap === null || currentSwimmerCount < cap
}
