-- ---------- subscriptions ----------
-- One row per profile (upserted by the Stripe webhook handler) — not one row
-- per historical subscription, to keep "what plan is this profile on right
-- now" a single-row lookup everywhere else in the schema.
create table subscriptions (
  id uuid primary key default gen_random_uuid(),
  profile_id uuid references profiles (id) not null,
  plan text check (plan in ('free', 'ai_coach', 'coach_pro', 'coach_club')),
  status text check (status in ('active', 'trialing', 'past_due', 'canceled')),
  current_period_end timestamptz,
  stripe_subscription_id text,
  stripe_customer_id text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create unique index subscriptions_profile_id_unique on subscriptions (profile_id);

alter table subscriptions enable row level security;

-- Read-only for the client. All writes go through the service-role Stripe
-- webhook handler — a client-side row a user could edit themselves would
-- not be a real entitlement check.
create policy "read own subscription"
  on subscriptions for select
  using (auth.uid() = profile_id);

-- ---------- has_entitlement() ----------
-- Server-side entitlement check any edge function can call before running a
-- gated feature — mirrors is_admin() / has_nutrition_profile(). A client-side
-- hidden button is not a real gate; this is what makes the gate real.
create or replace function public.has_entitlement(target_profile_id uuid, required_plans text[])
returns boolean language sql security definer stable as $$
  select exists (
    select 1 from subscriptions
    where profile_id = target_profile_id
      and status in ('active', 'trialing')
      and plan = any(required_plans)
  );
$$;

-- ---------- roster-size gate ----------
-- The free tier's 2-swimmer cap enforced at the database level, not just in
-- RosterPage's UI — a trigger, not a policy, since the check spans a COUNT
-- across existing rows rather than a property of the row being written.
create or replace function public.enforce_swimmer_roster_limit()
returns trigger language plpgsql security definer as $$
declare
  swimmer_count int;
  has_paid_plan boolean;
begin
  select count(*) into swimmer_count from swimmers where coach_id = new.coach_id;

  select public.has_entitlement(new.coach_id, array['coach_pro', 'coach_club']) into has_paid_plan;

  if not has_paid_plan and swimmer_count >= 2 then
    raise exception 'Free plan is limited to 2 swimmers — upgrade to add more.';
  end if;

  return new;
end;
$$;

drop trigger if exists swimmer_roster_limit on swimmers;
create trigger swimmer_roster_limit
  before insert on swimmers
  for each row execute function public.enforce_swimmer_roster_limit();
