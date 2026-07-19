import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import Stripe from 'https://esm.sh/stripe@17.4.0?target=deno'

const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!
const SUPABASE_ANON_KEY = Deno.env.get('SUPABASE_ANON_KEY')!
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
const STRIPE_SECRET_KEY = Deno.env.get('STRIPE_SECRET_KEY')!
const APP_URL = Deno.env.get('APP_URL')!

const stripe = new Stripe(STRIPE_SECRET_KEY, { httpClient: Stripe.createFetchHttpClient() })
const adminClient = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY)

const VALID_PLANS = ['ai_coach', 'coach_pro', 'coach_club']
const VALID_INTERVALS = ['month', 'year']
const TRIAL_DAYS = 14

// Price IDs live in env secrets (STRIPE_PRICE_AI_COACH_MONTH, etc.) — set
// once via `supabase secrets set` after creating the Products/Prices in
// Stripe, never hardcoded, so switching test->live mode is a secrets swap.
function priceEnvKey(plan: string, interval: string): string {
  return `STRIPE_PRICE_${plan.toUpperCase()}_${interval.toUpperCase()}`
}

Deno.serve(async (req) => {
  const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  }

  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const authHeader = req.headers.get('Authorization')
    if (!authHeader) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    const callerClient = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
      global: { headers: { Authorization: authHeader } },
    })
    const { data: { user: caller } } = await callerClient.auth.getUser()
    if (!caller) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    const { plan, interval } = await req.json()
    if (!VALID_PLANS.includes(plan) || !VALID_INTERVALS.includes(interval)) {
      return new Response(JSON.stringify({ error: 'Invalid plan or interval' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    const priceId = Deno.env.get(priceEnvKey(plan, interval))
    if (!priceId) {
      return new Response(JSON.stringify({ error: `No price configured for ${plan}/${interval}` }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    // Reuse an existing Stripe customer for this profile if we have one, so a
    // second subscription (or a re-subscribe after cancelling) doesn't create
    // a duplicate customer record.
    const { data: existing } = await adminClient
      .from('subscriptions')
      .select('stripe_customer_id')
      .eq('profile_id', caller.id)
      .maybeSingle()

    // /upgrade only exists nested under a role (/coach/upgrade,
    // /swimmer/upgrade) — look up the role so Checkout's redirect lands
    // somewhere real instead of a dead route.
    const { data: profile } = await adminClient
      .from('profiles')
      .select('role')
      .eq('id', caller.id)
      .single()
    const upgradePath = `/${profile?.role ?? 'swimmer'}/upgrade`

    const session = await stripe.checkout.sessions.create({
      mode: 'subscription',
      client_reference_id: caller.id,
      customer: existing?.stripe_customer_id ?? undefined,
      customer_email: existing?.stripe_customer_id ? undefined : caller.email,
      line_items: [{ price: priceId, quantity: 1 }],
      subscription_data: {
        trial_period_days: TRIAL_DAYS,
        metadata: { profile_id: caller.id, plan },
      },
      metadata: { profile_id: caller.id, plan },
      success_url: `${APP_URL}${upgradePath}?checkout=success`,
      cancel_url: `${APP_URL}${upgradePath}`,
    })

    return new Response(JSON.stringify({ url: session.url }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  } catch (err) {
    console.error('create-checkout-session error:', err instanceof Error ? err.stack ?? err.message : String(err))
    return new Response(JSON.stringify({ error: String(err) }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }
})
