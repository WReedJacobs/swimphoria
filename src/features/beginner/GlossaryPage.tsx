import { useMemo, useState } from 'react'
import { Search } from 'lucide-react'
import { Card } from '@/components/ui/Card'
import { SectionHeader } from '@/components/ui/SectionHeader'
import { Input } from '@/components/ui/Input'
import { EmptyState } from '@/components/ui/EmptyState'
import { cn } from '@/lib/cn'
import { glossary, type GlossaryCategory } from './content'

const CATEGORIES: { id: GlossaryCategory | 'all'; label: string }[] = [
  { id: 'all', label: 'All' },
  { id: 'technique', label: 'Technique' },
  { id: 'training', label: 'Training' },
  { id: 'equipment', label: 'Equipment' },
  { id: 'pool', label: 'Pool' },
  { id: 'racing', label: 'Racing' },
  { id: 'people', label: 'People' },
]

export function GlossaryPage() {
  const [query, setQuery] = useState('')
  const [activeCategory, setActiveCategory] = useState<GlossaryCategory | 'all'>('all')

  const grouped = useMemo(() => {
    const filtered = glossary.filter((t) => {
      const matchesQuery =
        t.term.toLowerCase().includes(query.toLowerCase()) ||
        t.definition.toLowerCase().includes(query.toLowerCase())
      const matchesCategory = activeCategory === 'all' || t.category === activeCategory
      return matchesQuery && matchesCategory
    })
    const map = new Map<string, typeof glossary>()
    for (const t of filtered.sort((a, b) => a.term.localeCompare(b.term))) {
      const letter = t.term[0].toUpperCase()
      if (!map.has(letter)) map.set(letter, [])
      map.get(letter)!.push(t)
    }
    return map
  }, [query, activeCategory])

  const letters = [...grouped.keys()]

  return (
    <div className="space-y-5">
      <SectionHeader kicker="Glossary" />

      <div className="relative max-w-md">
        <Input
          placeholder="Search terms…"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="pl-9"
        />
        <Search className="pointer-events-none absolute left-3 top-2.5 h-4 w-4 text-text-muted" />
      </div>

      {/* Category filter chips */}
      <div className="flex flex-wrap gap-2">
        {CATEGORIES.map((cat) => (
          <button
            key={cat.id}
            onClick={() => setActiveCategory(cat.id)}
            className={cn(
              'rounded-full border px-3 py-1 text-xs font-medium transition-colors',
              activeCategory === cat.id
                ? 'border-coral bg-coral/10 text-coral'
                : 'border-border text-text-muted hover:border-coral/50 hover:text-text-secondary',
            )}
          >
            {cat.label}
          </button>
        ))}
      </div>

      {/* Alphabet jump nav */}
      {letters.length > 0 && (
        <div className="flex flex-wrap gap-1">
          {letters.map((letter) => (
            <a
              key={letter}
              href={`#glossary-${letter}`}
              className="font-mono text-xs font-medium text-primary hover:underline"
            >
              {letter}
            </a>
          ))}
        </div>
      )}

      {grouped.size === 0 ? (
        <EmptyState icon={<Search className="h-6 w-6" />} title="No terms found" description="Try a different search or category." />
      ) : (
        <div className="space-y-5">
          {[...grouped.entries()].map(([letter, terms]) => (
            <Card key={letter} id={`glossary-${letter}`}>
              <h3 className="mb-3 text-lg font-semibold text-coral">{letter}</h3>
              <dl className="space-y-3">
                {terms.map((t) => (
                  <div key={t.id ?? t.term}>
                    <dt className="font-medium text-text-primary">{t.term}</dt>
                    <dd className="text-sm text-text-secondary">{t.definition}</dd>
                  </div>
                ))}
              </dl>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
