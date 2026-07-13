import { useEffect, useRef, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Loader2 } from 'lucide-react'
import { useAuth } from '@/hooks/useAuth'
import { useOnboardingDraft, applyOnboardingDraft } from '@/features/onboarding/onboardingStore'

/**
 * Landing target for supabase.auth.signInWithOAuth's redirectTo. Supabase's
 * client parses the auth tokens out of the URL itself (detectSessionInUrl)
 * and fires onAuthStateChange, which authStore already listens to — this
 * page just waits for that to land, then hands off to HomeRedirect at "/"
 * for role-based routing (same place a fresh page load or password login
 * would send you).
 *
 * Exception: a brand-new user coming from OnboardingFlow's "Continue with
 * Google" (step 5) has no role yet, but their onboarding choices are sitting
 * in the localStorage-backed draft (survives the full-page OAuth redirect).
 * Apply it here, the same way submitAccount() does for email/password —
 * otherwise a Google signup from /start would silently drop straight to
 * plain /role-select and lose the level/first-swim/weekly-goal they already
 * picked.
 */
export function AuthCallbackPage() {
  const { initialized, isAuthenticated, profile, user } = useAuth()
  const [draft] = useOnboardingDraft()
  const navigate = useNavigate()
  const [timedOut, setTimedOut] = useState(false)
  const applied = useRef(false)

  useEffect(() => {
    if (!isAuthenticated || !profile || !user || applied.current) return
    applied.current = true
    ;(async () => {
      if (!profile.role && draft.onboardingRole) {
        await applyOnboardingDraft(user.id, profile.full_name || 'Swimmer', draft, {
          createFirstSwim: true,
        })
      }
      navigate('/', { replace: true })
    })()
  }, [isAuthenticated, profile, user, draft, navigate])

  useEffect(() => {
    // Supabase appends #error=...&error_description=... instead of tokens
    // when the user cancels or Google denies the request.
    const hash = new URLSearchParams(window.location.hash.replace(/^#/, ''))
    if (hash.get('error')) {
      navigate('/login', { replace: true })
      return
    }
    const timer = window.setTimeout(() => setTimedOut(true), 8000)
    return () => window.clearTimeout(timer)
  }, [navigate])

  if (timedOut && !isAuthenticated && initialized) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-3 bg-bg p-4 text-center">
        <p className="text-sm text-text-secondary">Sign-in is taking longer than expected.</p>
        <Link to="/login" className="text-sm font-medium text-primary hover:underline">
          Back to sign in
        </Link>
      </div>
    )
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-bg">
      <Loader2 className="h-8 w-8 animate-spin text-primary" />
    </div>
  )
}
