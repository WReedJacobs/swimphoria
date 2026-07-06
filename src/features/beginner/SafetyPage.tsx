import { Card } from '@/components/ui/Card'
import { SectionHeader } from '@/components/ui/SectionHeader'
import { GuideFooter } from '@/components/ui/GuideFooter'
import { safetySections } from './content/safetyGuide'

export function SafetyPage() {
  return (
    <div className="max-w-2xl space-y-8">
      <SectionHeader kicker="Learn · Safety & Your Body" />

      <div className="space-y-8">
        {safetySections.map((section) => (
          <div key={section.id}>
            {section.id !== 'disclaimer' && (
              <h2 className="mb-3 text-base font-semibold text-text-primary">{section.title}</h2>
            )}
            {section.id === 'disclaimer' && (
              <Card className="border-accent/20 bg-accent/5">
                <h2 className="mb-2 font-semibold text-accent">{section.title}</h2>
                {section.body.map((para, i) => (
                  <p key={i} className="text-sm leading-relaxed text-text-secondary">{para}</p>
                ))}
              </Card>
            )}
            {section.id !== 'disclaimer' && (
              <div className="space-y-3">
                {section.body.map((para, i) => (
                  <p key={i} className="text-sm leading-relaxed text-text-secondary">{para}</p>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>

      <GuideFooter next={{ label: 'Common Questions', href: '/beginner/learn/confidence-faq' }} />
    </div>
  )
}
