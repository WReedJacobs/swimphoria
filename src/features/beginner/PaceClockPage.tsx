import { Card } from '@/components/ui/Card'
import { SectionHeader } from '@/components/ui/SectionHeader'
import { GuideFooter } from '@/components/ui/GuideFooter'
import { paceClockSections } from './content/paceClockGuide'

// Simple SVG pace clock diagram — all colours via CSS tokens
function PaceClockDiagram() {
  return (
    <div className="flex justify-center py-4">
      <svg
        viewBox="0 0 200 200"
        width="180"
        height="180"
        role="img"
        aria-label="Pace clock face showing the red second hand at the 12 o'clock position (top = push-off point)"
      >
        <title>Pace clock face — red hand at top (:00) is the push-off point</title>
        {/* Clock face */}
        <circle cx="100" cy="100" r="90" fill="rgb(var(--c-surface))" stroke="rgb(var(--c-border))" strokeWidth="2" />
        {/* Hour markers */}
        {[0, 15, 30, 45].map((sec) => {
          const angle = (sec / 60) * 360 - 90
          const rad = (angle * Math.PI) / 180
          const x1 = 100 + 72 * Math.cos(rad)
          const y1 = 100 + 72 * Math.sin(rad)
          const x2 = 100 + 85 * Math.cos(rad)
          const y2 = 100 + 85 * Math.sin(rad)
          return <line key={sec} x1={x1} y1={y1} x2={x2} y2={y2} stroke="rgb(var(--c-text-muted))" strokeWidth="3" strokeLinecap="round" />
        })}
        {/* Minute markers */}
        {Array.from({ length: 60 }, (_, i) => i).filter(i => i % 5 !== 0).map((sec) => {
          const angle = (sec / 60) * 360 - 90
          const rad = (angle * Math.PI) / 180
          const x1 = 100 + 78 * Math.cos(rad)
          const y1 = 100 + 78 * Math.sin(rad)
          const x2 = 100 + 85 * Math.cos(rad)
          const y2 = 100 + 85 * Math.sin(rad)
          return <line key={sec} x1={x1} y1={y1} x2={x2} y2={y2} stroke="rgb(var(--c-border))" strokeWidth="1" />
        })}
        {/* Labels */}
        <text x="100" y="22" textAnchor="middle" fontSize="11" fill="rgb(var(--c-text-muted))" fontFamily="monospace">:00</text>
        <text x="178" y="104" textAnchor="middle" fontSize="11" fill="rgb(var(--c-text-muted))" fontFamily="monospace">:15</text>
        <text x="100" y="185" textAnchor="middle" fontSize="11" fill="rgb(var(--c-text-muted))" fontFamily="monospace">:30</text>
        <text x="22" y="104" textAnchor="middle" fontSize="11" fill="rgb(var(--c-text-muted))" fontFamily="monospace">:45</text>
        {/* Red second hand — pointing to :00 (top) */}
        <line x1="100" y1="100" x2="100" y2="20" stroke="rgb(var(--c-danger))" strokeWidth="3" strokeLinecap="round" />
        {/* Centre dot */}
        <circle cx="100" cy="100" r="4" fill="rgb(var(--c-text-secondary))" />
        {/* Callout: "Push off here" */}
        <text x="100" y="48" textAnchor="middle" fontSize="9" fill="rgb(var(--c-coral))" fontFamily="monospace">← PUSH OFF</text>
      </svg>
    </div>
  )
}

export function PaceClockPage() {
  return (
    <div className="max-w-2xl space-y-8">
      <SectionHeader kicker="Learn · Pace Clock & Session Notation" />

      <Card>
        <h2 className="mb-2 font-semibold text-text-primary">The pace clock</h2>
        <p className="mb-4 text-sm text-text-secondary">
          The red hand makes one full revolution every 60 seconds. When it points to the top (:00), that is "leaving on the top" — the most common push-off point.
        </p>
        <PaceClockDiagram />
      </Card>

      <div className="space-y-8">
        {paceClockSections.filter(s => s.id !== 'what-is-it').map((section) => (
          <div key={section.id}>
            <h2 className="mb-3 text-base font-semibold text-text-primary">{section.title}</h2>
            <div className="space-y-3">
              {section.body.map((para, i) => {
                // Render the notation section with monospace styling for set notation lines
                const isNotation = section.id === 'notation' && para.startsWith('Rep ')
                const isAbbrev = section.id === 'set-abbreviations' && para.includes(':')
                if (isNotation || isAbbrev) {
                  return (
                    <div key={i} className="rounded-component border border-border bg-bg px-3 py-2">
                      <p className="font-mono text-xs text-text-secondary">{para}</p>
                    </div>
                  )
                }
                return <p key={i} className="text-sm leading-relaxed text-text-secondary">{para}</p>
              })}
            </div>
          </div>
        ))}
      </div>

      <GuideFooter next={{ label: 'Stroke Guides', href: '/beginner/learn/strokes' }} />
    </div>
  )
}
