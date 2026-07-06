import { useState, useRef, useEffect, useCallback } from 'react'
import { cn } from '@/lib/cn'
import { glossary } from '@/features/beginner/content'

interface TermProps {
  id: string
  children: React.ReactNode
}

export function Term({ id, children }: TermProps) {
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLSpanElement>(null)
  const entry = glossary.find((g) => g.id === id)

  const close = useCallback(() => setOpen(false), [])

  // Close on outside click or Escape
  useEffect(() => {
    if (!open) return
    const handleKey = (e: KeyboardEvent) => { if (e.key === 'Escape') close() }
    const handleClick = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) close()
    }
    document.addEventListener('keydown', handleKey)
    document.addEventListener('mousedown', handleClick)
    return () => {
      document.removeEventListener('keydown', handleKey)
      document.removeEventListener('mousedown', handleClick)
    }
  }, [open, close])

  if (!entry) return <>{children}</>

  return (
    <span ref={ref} className="relative inline-block">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        aria-label={`Definition: ${entry.term}`}
        className={cn(
          'cursor-help border-b border-dashed border-current underline-offset-2 transition-colors',
          open ? 'text-primary' : 'text-inherit hover:text-primary',
        )}
      >
        {children}
      </button>

      {open && (
        <span
          role="tooltip"
          className={cn(
            'absolute bottom-full left-0 z-50 mb-2 w-64 rounded-card border border-border bg-surface p-3 shadow-lg',
            'text-left text-xs leading-relaxed text-text-secondary',
          )}
        >
          <span className="mb-1 block font-semibold text-text-primary">{entry.term}</span>
          {entry.definition}
        </span>
      )}
    </span>
  )
}
