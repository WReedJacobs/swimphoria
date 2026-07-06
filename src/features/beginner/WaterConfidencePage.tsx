import { useState } from 'react'
import { ChevronDown, ChevronRight, CheckCircle2, AlertTriangle, Info } from 'lucide-react'
import { Card } from '@/components/ui/Card'
import { SectionHeader } from '@/components/ui/SectionHeader'
import { GuideFooter } from '@/components/ui/GuideFooter'
import { waterConfidenceStages } from './content/waterConfidence'

export function WaterConfidencePage() {
  const [open, setOpen] = useState<string | null>(waterConfidenceStages[0].id)

  return (
    <div className="max-w-2xl space-y-6">
      <SectionHeader kicker="Learn · Water Confidence" />

      <Card className="border-coral/20 bg-coral/5">
        <p className="font-semibold text-text-primary">This guide is for you if you can't yet swim a full 25m length.</p>
        <p className="mt-1 text-sm text-text-secondary">
          Work through these 8 stages in order. Each one builds directly on the last. If you can already swim a length, skip to{' '}
          <a href="/beginner/program" className="text-coral hover:underline">Week 1 of the Program</a>.
        </p>
      </Card>

      <div className="space-y-2">
        {waterConfidenceStages.map((stage, i) => {
          const isOpen = open === stage.id
          return (
            <Card key={stage.id}>
              <button
                onClick={() => setOpen(isOpen ? null : stage.id)}
                className="flex w-full items-start gap-3 text-left"
                aria-expanded={isOpen}
              >
                <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-coral/10 font-mono text-sm font-bold text-coral">
                  {i + 1}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="font-semibold text-text-primary">{stage.name}</p>
                  <p className="mt-0.5 text-sm text-text-muted">{stage.goal}</p>
                </div>
                {isOpen ? (
                  <ChevronDown className="mt-0.5 h-4 w-4 shrink-0 text-text-muted" />
                ) : (
                  <ChevronRight className="mt-0.5 h-4 w-4 shrink-0 text-text-muted" />
                )}
              </button>

              {isOpen && (
                <div className="mt-4 space-y-4 pl-10">
                  {/* Where */}
                  <div className="flex gap-2 rounded-component border border-border bg-bg px-3 py-2">
                    <Info className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                    <p className="text-sm text-text-secondary"><span className="font-medium text-text-primary">Where: </span>{stage.where}</p>
                  </div>

                  {/* Steps */}
                  <ol className="space-y-2">
                    {stage.steps.map((step, si) => (
                      <li key={si} className="flex gap-3 text-sm text-text-secondary">
                        <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-surface border border-border font-mono text-[10px] text-text-muted">
                          {si + 1}
                        </span>
                        {step}
                      </li>
                    ))}
                  </ol>

                  {/* Reassurance */}
                  <div className="flex gap-2 rounded-component border border-secondary/20 bg-secondary/5 px-3 py-2">
                    <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-secondary" />
                    <p className="text-sm text-text-secondary">{stage.reassurance}</p>
                  </div>

                  {/* Panic note */}
                  <div className="flex gap-2 rounded-component border border-accent/20 bg-accent/5 px-3 py-2">
                    <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-accent" />
                    <p className="text-sm text-text-secondary"><span className="font-medium text-accent">If you feel panicked: </span>{stage.panicNote}</p>
                  </div>
                </div>
              )}
            </Card>
          )
        })}
      </div>

      <GuideFooter next={{ label: 'Your First Visit', href: '/beginner/learn/first-visit' }} />
    </div>
  )
}
