import { useState } from 'react'
import { ChevronDown, ChevronRight } from 'lucide-react'
import { Card } from '@/components/ui/Card'
import { SectionHeader } from '@/components/ui/SectionHeader'
import { GuideFooter } from '@/components/ui/GuideFooter'
import { confidenceFaqs } from './content/confidenceFaq'

export function ConfidenceFaqPage() {
  const [openId, setOpenId] = useState<string | null>(null)

  return (
    <div className="max-w-2xl space-y-6">
      <SectionHeader kicker="Learn · Common Questions" />

      <p className="text-sm text-text-secondary">
        These are the questions adult beginners actually have — but often don't say out loud. Honest answers, no fluff.
      </p>

      <div className="space-y-2">
        {confidenceFaqs.map((faq) => {
          const isOpen = openId === faq.id
          return (
            <Card key={faq.id}>
              <button
                onClick={() => setOpenId(isOpen ? null : faq.id)}
                className="flex w-full items-start justify-between gap-3 text-left"
                aria-expanded={isOpen}
              >
                <span className="font-medium text-text-primary">{faq.question}</span>
                {isOpen ? (
                  <ChevronDown className="mt-0.5 h-4 w-4 shrink-0 text-text-muted" />
                ) : (
                  <ChevronRight className="mt-0.5 h-4 w-4 shrink-0 text-text-muted" />
                )}
              </button>

              {isOpen && (
                <p className="mt-3 text-sm leading-relaxed text-text-secondary">
                  {faq.answer}
                </p>
              )}
            </Card>
          )
        })}
      </div>

      <GuideFooter next={{ label: 'Safety & Your Body', href: '/beginner/learn/safety' }} />
    </div>
  )
}
