import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import Stripe from 'https://esm.sh/stripe@17.4.0?target=deno'

const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
const STRIPE_SECRET_KEY = Deno.env.get('STRIPE_SECRET_KEY')!
const STRIPE_WEBHOOK_SECRET = Deno.env.get('STRIPE_WEBHOOK_SECRET')!

const stripe = new Stripe(STRIPE_SECRET_KEY, { httpClient: Stripe.createFetchHttpClient() })
const adminClient = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY)

function subscriptionStatus(stripeStatus: Stripe.Subscription.Status): 'active' | 'trialing' | 'past_due' | 'canceled' {
  if (stripeStatus === 'trialing') return 'trialing'
  if (stripeStatus === 'past_due') return 'past_due'
  if (stripeStatus === 'canceled' || stripeStatus === 'unpaid' || stripeStatus === 'incomplete_expired') return 'canceled'
  return 'active'
}

// This is the only writer to `subscriptions` — the row a client could edit
// themselves would not be a real entitlement (see 034's RLS: read-only).
Deno.serve(async (req) => {
  const signature = req.headers.get('stripe-signature')
  const body = await req.text()
  if (!signature) return new Response('Missing signature', { status: 400 })

  let event: Stripe.Event
  try {
    event = await stripe.webhooks.constructEventAsync(body, signature, STRIPE_WEBHOOK_SECRET)
  } catch (err) {
    console.error('stripe-webhook signature verification failed:', err instanceof Error ? err.message : String(err))
    return new Response('Invalid signature', { status: 400 })
  }

  try {
    if (event.type === 'checkout.session.completed') {
      const session = event.data.object as Stripe.Checkout.Session
      const profileId = session.client_reference_id
      const plan = session.metadata?.plan
      const subscriptionId = typeof session.subscription === 'string' ? session.subscription : session.subscription?.id
      const customerId = typeof session.customer === 'string' ? session.customer : session.customer?.id

      if (profileId && plan && subscriptionId) {
        const sub = await stripe.subscriptions.retrieve(subscriptionId)
        await adminClient.from('subscriptions').upsert(
          {
            profile_id: profileId,
            plan,
            status: subscriptionStatus(sub.status),
            current_period_end: new Date(sub.current_period_end * 1000).toISOString(),
            stripe_subscription_id: subscriptionId,
            stripe_customer_id: customerId ?? null,
            updated_at: new Date().toISOString(),
          },
          { onConflict: 'profile_id' },
        )
      }
    } else if (event.type === 'customer.subscription.updated' || event.type === 'customer.subscription.deleted') {
      const sub = event.data.object as Stripe.Subscription
      const profileId = sub.metadata?.profile_id
      if (profileId) {
        const status = event.type === 'customer.subscription.deleted' ? 'canceled' : subscriptionStatus(sub.status)
        const row: Record<string, unknown> = {
          profile_id: profileId,
          status,
          current_period_end: new Date(sub.current_period_end * 1000).toISOString(),
          stripe_subscription_id: sub.id,
          stripe_customer_id: typeof sub.customer === 'string' ? sub.customer : sub.customer.id,
          updated_at: new Date().toISOString(),
        }
        // Only overwrite plan if this subscription's own metadata carries it
        // (set at Checkout) — an upgrade/downgrade via the Portal without our
        // metadata shouldn't blank out the plan we already have on file.
        if (sub.metadata?.plan) row.plan = sub.metadata.plan
        await adminClient.from('subscriptions').upsert(row, { onConflict: 'profile_id' })
      }
    }

    return new Response(JSON.stringify({ received: true }), { headers: { 'Content-Type': 'application/json' } })
  } catch (err) {
    console.error('stripe-webhook handling error:', err instanceof Error ? err.stack ?? err.message : String(err))
    return new Response(JSON.stringify({ error: String(err) }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    })
  }
})
