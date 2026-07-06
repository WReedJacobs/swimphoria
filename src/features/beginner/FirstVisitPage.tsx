import { useState } from 'react'
import { CheckSquare, Square } from 'lucide-react'
import { Card } from '@/components/ui/Card'
import { SectionHeader } from '@/components/ui/SectionHeader'
import { GuideFooter } from '@/components/ui/GuideFooter'
import { firstVisitSections, packList } from './content/firstVisit'

const STORAGE_KEY = 'sc_pack_checklist'

function loadChecked(): Set<string> {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    return new Set(raw ? (JSON.parse(raw) as string[]) : [])
  } catch {
    return new Set()
  }
}

export function FirstVisitPage() {
  const [checked, setChecked] = useState<Set<string>>(() => loadChecked())

  const toggle = (id: string) => {
    setChecked((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      localStorage.setItem(STORAGE_KEY, JSON.stringify([...next]))
      return next
    })
  }

  return (
    <div className="max-w-2xl space-y-8">
      <SectionHeader kicker="Learn · Your First Visit" />

      {/* Pack list */}
      <Card>
        <h2 className="mb-4 font-semibold text-text-primary">What to pack</h2>
        <ul className="space-y-2">
          {packList.map((item) => {
            const done = checked.has(item.id)
            return (
              <li key={item.id}>
                <button
                  onClick={() => toggle(item.id)}
                  className="flex items-start gap-3 text-left w-full group"
                  aria-label={done ? `Uncheck: ${item.label}` : `Check: ${item.label}`}
                >
                  {done ? (
                    <CheckSquare className="mt-0.5 h-4 w-4 shrink-0 text-secondary" />
                  ) : (
                    <Square className="mt-0.5 h-4 w-4 shrink-0 text-text-muted group-hover:text-text-secondary" />
                  )}
                  <div className="min-w-0">
                    <span className={`text-sm font-medium ${done ? 'line-through text-text-muted' : 'text-text-primary'}`}>
                      {item.label}
                    </span>
                    {item.note && (
                      <span className="ml-2 text-xs text-text-muted">{item.note}</span>
                    )}
                  </div>
                </button>
              </li>
            )
          })}
        </ul>
        <p className="mt-3 text-xs text-text-muted">Tap each item to check it off. Your list is saved locally.</p>
      </Card>

      {/* Walkthrough sections */}
      <div className="space-y-5">
        {firstVisitSections.map((section) => (
          <div key={section.id}>
            <h2 className="mb-2 text-base font-semibold text-text-primary">{section.title}</h2>
            <div className="space-y-3">
              {section.body.map((para, i) => (
                <p key={i} className="text-sm leading-relaxed text-text-secondary">{para}</p>
              ))}
            </div>
          </div>
        ))}
      </div>

      <GuideFooter next={{ label: 'Breathing Masterclass', href: '/beginner/learn/breathing' }} />
    </div>
  )
}
