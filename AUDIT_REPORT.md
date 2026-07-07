# Swimphoria — Write-Path Audit Report

**Generated:** 2026-07-07  
**Scope:** All Supabase mutations in `src/` (`.insert`, `.update`, `.upsert`, `.delete`, `.rpc`) cross-checked against schema, RLS policies, and UX feedback loops.  
**Remediations:** See migration `017_recovered_baseline.sql` and associated frontend fixes.

---

## Summary

| Severity | Count | Status |
|----------|-------|--------|
| CRITICAL | 2 | Fixed in 017 + frontend |
| HIGH | 3 | Fixed in 017 + frontend |
| MEDIUM | 3 | Documented — not yet fixed |
| LOW | 2 | Fixed in frontend |

---

## CRITICAL

### C-1 · `profiles.is_admin` column missing from all migrations

**File:** `supabase/migrations/008_admin_expanded.sql`  
**Pattern:** Silent RLS / query failure

Migrations 006 and 007 are absent from disk. These likely contained `ALTER TABLE profiles ADD COLUMN is_admin boolean`. Migration 008 creates five RLS policies that reference `p.is_admin = true` and migration 009 creates an `is_admin()` helper — both assume the column exists. A fresh `supabase db reset` would fail when these policies try to reference a nonexistent column. Every admin operation in the running app (set admin, revoke admin, admin-only reads) would also silently fail via RLS.

**Fix:** `017_recovered_baseline.sql` — `ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS is_admin boolean NOT NULL DEFAULT false`

---

### C-2 · `milestones` table is a write-dead-end (frontend never populates it)

**File:** `src/features/beginner/beginnerStore.ts`, `src/features/beginner/MilestonesPage.tsx`  
**Pattern:** DB table exists, RLS is correct, but zero frontend writes

The `milestones` table (created in `001_initial.sql:131-138`) has its own RLS ("manage own milestones") and is read by `recalc_swimmer_stats` to compute `v_dist_milestones`. However no frontend code ever calls `.from('milestones').insert/upsert`. All milestone state lives in `localStorage` under key `sc_beginner_milestones`. The result: `v_dist_milestones` is always 0 for every user, permanently suppressing a component of the Endurance rating.

**Fix:** `src/features/beginner/GraduationModal.tsx` — on graduation, upsert all achieved localStorage milestones to `milestones` table before calling `setRole`. Migration 017 adds `UNIQUE (profile_id, label)` constraint to enable the upsert.

---

## HIGH

### H-1 · Swimmers cannot update or delete self-logged times

**File:** `supabase/migrations/001_initial.sql:207-221`  
**Pattern:** Silent RLS failure — zero rows, no error

The `times` table has:
- `"coach manages times"` FOR ALL — covers the coach who assigned the session
- `"swimmer reads own times"` FOR SELECT
- `"swimmer self-logs own times"` FOR INSERT

No UPDATE or DELETE policy exists for the swimmer. When a swimmer calls `DELETE` on a self-logged time (via `useTimes.useDeleteTime`), Postgres silently returns 0 rows affected with no error. The UI shows no feedback; the record remains.

**Fix:** Migration 017 adds:
- `"swimmer updates own self-logged times"` FOR UPDATE — `is_self_logged = true AND swimmer.profile_id = auth.uid()`
- `"swimmer deletes own self-logged times"` FOR DELETE — same predicate

---

### H-2 · `swimmers` row not created on non-signup role transitions

**Files:** `src/store/authStore.ts:94`, `src/features/auth/RoleSelectPage.tsx`, `src/features/beginner/GraduationModal.tsx`, `src/hooks/useAdmin.ts:87`  
**Pattern:** Silent dead-end — `useMySwimmer` returns `null`, UI buttons permanently disabled

`setRole('swimmer')` only writes to `profiles`. Only `OnboardingFlow` (signup path) creates the `swimmers` row. Any user who gains `role='swimmer'` via:
- RoleSelectPage (post-auth role selection)
- GraduationModal graduation
- Admin role reassignment via useAdmin

…has `profile.role = 'swimmer'` but no `swimmers` row. `useMySwimmer` returns `null` silently. Two UI locations gate on `!swimmer` with no explanation: GoalsPage "New goal" button and MyTimesPage "Log a time" button remain permanently disabled.

**Fix:** 
- `src/hooks/useEnsureMySwimmerRow.ts` (new) — auto-creates swimmer row via useEffect when `profile.role = 'swimmer'` and swimmer is null
- GoalsPage and MyTimesPage both call this hook and show "Setting up profile…" inline while swimmer is null
- Migration 017 adds `UNIQUE INDEX swimmers_profile_unique ON swimmers(profile_id) WHERE profile_id IS NOT NULL` to prevent duplicate rows from race conditions

---

### H-3 · `handle_new_user` trigger does not copy email

**File:** `supabase/migrations/001_initial.sql:296-307`  
**Pattern:** Data missing at rest — email column always empty for new signups

The trigger copies only `full_name`. `profiles.email` was added in migration 008 with a separate `sync_user_email` trigger (fires on UPDATE to auth.users). New signups fire INSERT to auth.users (handle_new_user) but not UPDATE, so email is never copied on initial registration. The `sync_user_email` trigger only fires when users change their email, not on signup.

**Fix:** Migration 017 — `CREATE OR REPLACE FUNCTION handle_new_user` updated to include `email = new.email` in the INSERT. Backfill applied for all existing rows.

---

## MEDIUM

### M-1 · Account deletion leaves orphaned relational data

**File:** `src/features/shared/SettingsPage.tsx:163-188`

Swimmer deletion (lines 163-173) deletes `times` and `goals` for the swimmer record but does NOT delete:
- The `swimmers` row itself
- `session_assignments` linking the swimmer to sessions
- `css_results` (swimmer_id FK)
- `feedback` (swimmer_id FK)

The profile is anonymized (`full_name: '[deleted]'`) but the swimmers row persists, meaning coaches see a ghost entry in their squad. The coach deletion path has similar gaps for squad swimmer rows and received messages (recipient_id).

**Recommendation:** Add `swimmers.delete().eq('profile_id', user.id)` to the swimmer deletion path. Consider adding `ON DELETE CASCADE` to `css_results` and `session_assignments` FKs (currently `ON DELETE CASCADE` for swimmer_id on session_assignments, but not css_results).

---

### M-2 · `Level` type mismatch: TypeScript has 'advanced', SQL does not

**File:** `src/types/index.ts:5`

TypeScript:
```ts
export type Level = 'beginner' | 'intermediate' | 'advanced' | 'elite'
```

SQL (`001_initial.sql`):
```sql
create type swim_level as enum ('beginner', 'intermediate', 'elite');
```

`'advanced'` is valid TypeScript but will cause a DB error if written to any `swim_level` column. No UI currently writes `'advanced'`, but the type permits it. Caught by `writePaths.test.ts` — the test documents the mismatch and will fail if either side is updated without the other.

**Recommendation:** Either remove `'advanced'` from the TypeScript union, or add it to the SQL enum with `ALTER TYPE swim_level ADD VALUE 'advanced'`.

---

### M-3 · `swimmer_stats.is_public` update has no UX for the failure case

**File:** `src/hooks/useSwimmerStats.ts:185`

The `useToggleStatsPublic` mutation calls `.update({ is_public })` with no error handling. If RLS rejects the update (e.g., wrong user), zero rows are affected silently and the UI toggle snaps back (if using optimistic updates) or appears stuck.

**Recommendation:** Chain `.select('id').single()` and throw if null, or wrap with `assertAffected` from `src/lib/mutate.ts` with `{ count: 'exact' }`.

---

## LOW

### L-1 · CSS test localStorage key orphaned after swimmer row creation

**File:** `src/features/swimmer/CssTestPage.tsx:36-38`

Before a swimmer row exists, the localStorage key is `swimcoach:css:me`. After the row is created, the key becomes `swimcoach:css:<id>`. Data entered before account creation is silently abandoned.

**Fix:** `CssTestPage.tsx` — `useEffect` migrates `swimcoach:css:me` → `swimcoach:css:<id>` when swimmer.id first becomes available.

---

### L-2 · Mute disabled buttons with no user-facing explanation

**Files:** `src/features/swimmer/GoalsPage.tsx:92`, `src/features/swimmer/MyTimesPage.tsx:239`

Both pages had `disabled={!swimmer}` with no tooltip, aria-label update, or nearby explanation. A newly-graduated user sees the primary action permanently grayed out.

**Fix:** Both pages now call `useEnsureMySwimmerRow()` (which auto-creates the missing row) and display "Setting up profile…" inline while swimmer is null.

---

## Full Write-Path Inventory

| Hook / File | Operation | Table | RLS Check | Error Handling | Invalidation |
|------------|-----------|-------|-----------|----------------|--------------|
| `authStore.setRole` | UPDATE | profiles | update own profile ✓ | none | auth state refetch |
| `authStore.setRole` | — | swimmers | **missing** → H-2 | — | — |
| `useBookings.useUpdateBookingStatus` | UPDATE | bookings | coach reads/updates ✓ | throws error | bookings query |
| `useAdmin.useSetAdmin` | UPDATE | profiles | **is_admin column missing** → C-1 | throws error | profiles query |
| `useAdmin.useUpdateUserRole` | UPDATE | profiles | update own profile ✓ (admin RLS missing) | throws error | users query |
| `useAdmin.useRemoveCoach` | UPDATE | profiles | update own profile ✓ | throws error | users query |
| `useAdmin.useAssignCoach` | UPDATE | profiles | update own profile ✓ | throws error | users query |
| `useAdmin.useUpdateDrill` | UPDATE | drills | coach manages own drills ✓ | throws error | drills query |
| `useAdmin.useDeleteDrill` | DELETE | drills | coach manages own drills ✓ | throws error | drills query |
| `useAdmin.useAdminUpdateBooking` | UPDATE | bookings | coach reads/updates ✓ | throws error | bookings query |
| `useJoinCode.useSetJoinCode` | UPDATE | profiles | update own profile ✓ | throws error | coach query |
| `useSessions.useUpdateSession` | UPDATE | sessions | coach manages own sessions ✓ | throws error | sessions query |
| `useSessions.useDeleteSession` | DELETE + DELETE | sessions + session_assignments | coach manages ✓ | throws error | sessions query |
| `useSessions.useMarkAttendance` | UPDATE | session_assignments | coach manages assignments ✓ | silent | session-assignments query |
| `useGoals.useUpdateGoal` | UPDATE | goals | swimmer manages own goals ✓ | throws error | goals query |
| `useGoals.useDeleteGoal` | DELETE | goals | swimmer manages own goals ✓ | throws error | goals query |
| `useSwimmerPlans.useUpdatePlan` | UPDATE | swimmer_plans | (check RLS) | throws error | plans query |
| `useSwimmerPlans.useDeletePlan` | DELETE | swimmer_plans | (check RLS) | throws error | plans query |
| `useSwimmerPlans.useTogglePlanItem` | UPDATE | swimmer_plans | (check RLS) | throws error | plans query |
| `useFeedback.useDeleteFeedback` | DELETE | feedback | coach manages feedback ✓ | throws error | feedback query |
| `useFeedback.useToggleFeedbackPin` | UPDATE | feedback | coach manages feedback ✓ | throws error | feedback query |
| `useSwimmers.useUpdateSwimmer` | UPDATE | swimmers | coach manages own swimmers ✓ | throws error | squad query |
| `useSwimmers.useDeleteSwimmer` | DELETE | swimmers | coach manages own swimmers ✓ | throws error | squad query |
| `useSwimmerStats.useToggleStatsPublic` | UPDATE | swimmer_stats | (no error handling) → M-3 | **none** | stats query |
| `useTimes.useDeleteTime` | DELETE | times | **no swimmer DELETE policy** → H-1 | throws error | times query |
| `useTimes.useUpdatePb` | UPDATE | times | coach manages times ✓ (coach only) | silent | times query |
| `SettingsPage.saveProfile` | UPDATE | profiles | update own profile ✓ | throws error | profile query |
| `SettingsPage.deleteAccount (swimmer)` | DELETE × 2 | times, goals | swimmer manages own goals ✓ | throws error | — |
| `SettingsPage.deleteAccount (swimmer)` | — | swimmers, css_results | **not deleted** → M-1 | — | — |
| `SettingsPage.deleteAccount (coach)` | DELETE × 3 | times, sessions, feedback | coach manages ✓ | throws error | — |
| `recalc_swimmer_stats (RPC)` | UPSERT | swimmer_stats | SECURITY DEFINER ✓ | throws error | stats query |
| `GraduationModal` | UPSERT | milestones | manage own milestones ✓ | silent (added) | — |

---

## Regression Protection

- **`src/lib/mutate.ts`** — `assertAffected(result, message)` helper. Throws when a count-enabled mutation affects zero rows. Use with `{ count: 'exact' }` on Supabase queries.
- **`src/lib/writePaths.test.ts`** — 14 tests: assertAffected unit tests + TS/SQL enum consistency checks for all 5 SQL enums. The Level mismatch (`'advanced'`) is documented as a pinned failing assertion so it cannot be silently resolved on only one side.

---

## Smoke Test Script

Run manually after each deploy to verify all write paths end-to-end.

### Swimmer role

1. Create a fresh account via `RoleSelectPage` (not OnboardingFlow) → navigate to `/swimmer`
2. Verify "Setting up profile…" appears briefly then disappears → swimmer row was auto-created
3. Log a time — "Log a time" button should be enabled within ~1s
4. Delete the time just logged — verify it disappears from the list
5. Set a goal → "New goal" modal opens, submits, goal appears in list
6. Go to `/swimmer/css` → enter trial times, save → result persists on reload
7. Update rating → no error toast, OVR updates

### Beginner → Swimmer graduation

1. Sign up without a role, go through beginner journey, mark steps complete
2. Open GraduationModal → "Become a Swimmer"
3. After navigation to `/swimmer`, check Supabase Studio: `milestones` table should have rows for the achieved steps
4. Trigger a recalc → `swimmer_stats.end_stat` should reflect milestone count > 0

### Coach role

1. Sign in as coach → verify join code visible in settings
2. Create a session → assign to a swimmer → mark attendance
3. Write feedback for a swimmer → toggle pin → delete the feedback
4. Verify squad leaderboard shows swimmer cards

### Admin role

1. Sign in as admin → verify Admin Dashboard loads (requires `is_admin = true` in `profiles`)
2. Set a user's `is_admin` flag → verify the change persists
3. Recalculate all stats → verify no error
