import { forwardRef } from 'react'
import type { HTMLAttributes, MouseEvent, ReactNode } from 'react'
import { cn } from '@/lib/cn'

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode
  padding?: boolean
  /** Adds a hover lift + accent border — for clickable cards. */
  interactive?: boolean
}

// WATER-EFFECTS-DESIGN.md section 3 — spotlight hover, every interactive
// Card, no exceptions. --mx/--my track the cursor within the card so
// .card-spotlight's ::before (index.css) can position its radial glow;
// written straight via style.setProperty on discrete mousemove events, not
// setState — this only repositions a CSS var while hovering one card, it's
// not a continuous per-frame loop like useCursorFx, so no rAF needed.
function handleSpotlightMove(e: MouseEvent<HTMLDivElement>) {
  const r = e.currentTarget.getBoundingClientRect()
  e.currentTarget.style.setProperty('--mx', `${e.clientX - r.left}px`)
  e.currentTarget.style.setProperty('--my', `${e.clientY - r.top}px`)
}

export const Card = forwardRef<HTMLDivElement, CardProps>(function Card(
  { children, padding = true, interactive = false, className, onMouseMove, ...props },
  ref,
) {
  return (
    <div
      ref={ref}
      onMouseMove={
        interactive
          ? (e) => {
              handleSpotlightMove(e)
              onMouseMove?.(e)
            }
          : onMouseMove
      }
      className={cn(
        'rounded-card border border-border shadow-[0_18px_44px_-34px_rgba(0,0,0,0.75)]',
        interactive
          ? // Deepwater depth + frosted glass + spotlight, replacing the flat
            // surface fill for interactive cards specifically.
            'card-spotlight cursor-pointer bg-surface/60 backdrop-blur-[14px] transition-all duration-300 hover:-translate-y-0.5 hover:border-primary/45 hover:shadow-[0_28px_60px_-34px_rgba(0,0,0,0.85)]'
          : // Non-interactive cards keep the original solid panel, matching
            // the hero's dashboard card.
            'bg-surface',
        padding && 'p-5',
        className,
      )}
      {...props}
    >
      {children}
    </div>
  )
})

export function CardHeader({
  title,
  subtitle,
  action,
}: {
  title: ReactNode
  subtitle?: ReactNode
  action?: ReactNode
}) {
  return (
    <div className="mb-4 flex items-start justify-between gap-4">
      <div>
        <h3 className="text-base font-semibold text-text-primary">{title}</h3>
        {subtitle && (
          <p className="mt-0.5 text-sm text-text-secondary">{subtitle}</p>
        )}
      </div>
      {action}
    </div>
  )
}
