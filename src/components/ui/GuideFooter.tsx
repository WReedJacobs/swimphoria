import { useEffect, useRef } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { ArrowRight, CheckCircle2 } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { useJourneyStore } from '@/store/beginnerJourneyStore'
import { GUIDE_STEP_MAP } from '@/features/beginner/journeySteps'

interface GuideFooterProps {
  next?: { label: string; href: string }
}

export function GuideFooter({ next }: GuideFooterProps) {
  const { pathname } = useLocation()
  const { markStep, hasCompleted } = useJourneyStore()
  const sentinelRef = useRef<HTMLDivElement>(null)
  const stepId = GUIDE_STEP_MAP[pathname]
  const alreadyDone = stepId ? hasCompleted(stepId) : false

  // Auto-mark on 80% scroll via IntersectionObserver on a sentinel near the page bottom
  useEffect(() => {
    if (!stepId || alreadyDone) return
    const el = sentinelRef.current
    if (!el) return

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) markStep(stepId)
      },
      { threshold: 0.1 },
    )
    observer.observe(el)
    return () => observer.disconnect()
  }, [stepId, alreadyDone, markStep])

  const handleMarkRead = () => {
    if (stepId) markStep(stepId)
  }

  return (
    <div className="mt-10 border-t border-border pt-6">
      {/* Sentinel — placed just above the footer so the observer fires when ~80% of the page has scrolled into view */}
      <div ref={sentinelRef} aria-hidden="true" />

      <div className="flex flex-wrap items-center justify-between gap-4">
        {/* Mark as read */}
        <button
          type="button"
          onClick={handleMarkRead}
          className="flex items-center gap-2 text-sm transition-colors"
          aria-label="Mark this guide as read"
        >
          <CheckCircle2
            className={`h-4 w-4 ${alreadyDone ? 'text-secondary' : 'text-text-muted hover:text-secondary'}`}
          />
          <span className={alreadyDone ? 'text-secondary' : 'text-text-muted hover:text-text-primary'}>
            {alreadyDone ? 'Marked as read' : 'Mark as read'}
          </span>
        </button>

        {/* Next guide link */}
        {next && (
          <Link to={next.href}>
            <Button
              size="sm"
              variant="secondary"
              rightIcon={<ArrowRight className="h-3.5 w-3.5" />}
            >
              Next: {next.label}
            </Button>
          </Link>
        )}
      </div>
    </div>
  )
}
