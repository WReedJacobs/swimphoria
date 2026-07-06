import { Card } from '@/components/ui/Card'
import { SectionHeader } from '@/components/ui/SectionHeader'
import { GuideFooter } from '@/components/ui/GuideFooter'
import { breathingSections } from './content/breathing'

export function BreathingPage() {
  return (
    <div className="max-w-2xl space-y-8">
      <SectionHeader kicker="Learn · Breathing" />

      <Card className="border-primary/20 bg-primary/5">
        <p className="font-semibold text-text-primary">
          This is the most important thing most beginners have never been taught.
        </p>
        <p className="mt-1 text-sm text-text-secondary">
          If you feel exhausted after one length, you are almost certainly holding your breath. This page explains why, and what to do about it.
        </p>
      </Card>

      <div className="space-y-8">
        {breathingSections.map((section) => (
          <div key={section.id}>
            <h2 className="mb-3 text-base font-semibold text-text-primary">{section.title}</h2>
            <div className="space-y-3">
              {section.body.map((para, i) => (
                <p key={i} className="text-sm leading-relaxed text-text-secondary">{para}</p>
              ))}
            </div>
          </div>
        ))}
      </div>

      <GuideFooter next={{ label: 'Training Basics', href: '/beginner/learn/training-basics' }} />
    </div>
  )
}
