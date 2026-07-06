import { Link } from 'react-router-dom'
import {
  MapPin,
  DoorOpen,
  Wind,
  Gauge,
  Waves,
  BookOpen,
  Library,
  HelpCircle,
  ShieldCheck,
  Clock,
  CheckCircle2,
} from 'lucide-react'
import { Card } from '@/components/ui/Card'
import { SectionHeader } from '@/components/ui/SectionHeader'
import { useJourneyStore } from '@/store/beginnerJourneyStore'
import { GUIDE_STEP_MAP } from './journeySteps'
import { cn } from '@/lib/cn'

interface GuideCard {
  href: string
  icon: typeof MapPin
  title: string
  description: string
  wordCount: number
  stepId?: string
}

const GUIDES: GuideCard[] = [
  {
    href: '/beginner/learn/pool-guide',
    icon: MapPin,
    title: 'Pool Guide',
    description: 'Lane etiquette, equipment essentials, and what to expect when you first walk in.',
    wordCount: 900,
    stepId: 'read_pool_guide',
  },
  {
    href: '/beginner/learn/first-visit',
    icon: DoorOpen,
    title: 'Your First Visit',
    description: 'A door-to-water narrative covering exactly what happens from arrival to leaving.',
    wordCount: 700,
    stepId: 'read_first_visit',
  },
  {
    href: '/beginner/learn/breathing',
    icon: Wind,
    title: 'Breathing Masterclass',
    description: 'Why you gasp after one length — and the one fix that changes everything.',
    wordCount: 1100,
    stepId: 'read_breathing',
  },
  {
    href: '/beginner/learn/training-basics',
    icon: Gauge,
    title: 'Training Basics',
    description: 'Effort levels, intervals, and how to read a training session plan.',
    wordCount: 1000,
    stepId: 'read_training_basics',
  },
  {
    href: '/beginner/learn/strokes',
    icon: Waves,
    title: 'Stroke Guides',
    description: 'All four strokes — technique, breathing, common mistakes, and priority order.',
    wordCount: 2200,
    stepId: undefined,
  },
  {
    href: '/beginner/learn/pace-clock',
    icon: Clock,
    title: 'Pace Clock & Session Notation',
    description: 'How to read the pace clock, what "8 × 50m on 1:30" means, and set abbreviations.',
    wordCount: 600,
    stepId: undefined,
  },
  {
    href: '/beginner/learn/water-confidence',
    icon: ShieldCheck,
    title: 'Water Confidence',
    description: 'A step-by-step track for swimmers who cannot yet complete a full length.',
    wordCount: 1400,
    stepId: undefined,
  },
  {
    href: '/beginner/learn/safety',
    icon: HelpCircle,
    title: 'Safety & Your Body',
    description: 'Cramp, swimmer\'s ear, shoulder niggles, eating before swimming, and hydration.',
    wordCount: 800,
    stepId: undefined,
  },
  {
    href: '/beginner/learn/confidence-faq',
    icon: BookOpen,
    title: 'Common Questions',
    description: 'Honest answers to the questions beginners actually ask — but often don\'t say out loud.',
    wordCount: 2000,
    stepId: undefined,
  },
  {
    href: '/beginner/glossary',
    icon: Library,
    title: 'Glossary',
    description: 'Over 100 swimming terms — technique, training, equipment, pool, and racing.',
    wordCount: 0,
    stepId: undefined,
  },
  {
    href: '/beginner/drills',
    icon: Library,
    title: 'Drill Library',
    description: 'Focused exercises that isolate one part of a stroke to improve it.',
    wordCount: 0,
    stepId: 'browse_drills',
  },
]

function readingTime(words: number): string {
  if (words === 0) return 'Reference'
  const mins = Math.ceil(words / 200)
  return `${mins} min read`
}

export function LearnHub() {
  const { hasCompleted } = useJourneyStore()

  return (
    <div className="space-y-8">
      <SectionHeader kicker="Learn" />

      <p className="max-w-xl text-sm text-text-secondary">
        Everything you need to know to swim with confidence — structured like a course so you can work through it in order or jump to what you need.
      </p>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {GUIDES.map(({ href, icon: Icon, title, description, wordCount, stepId }) => {
          const done = stepId ? hasCompleted(stepId) : false
          const isJourneyStep = Boolean(stepId && GUIDE_STEP_MAP[href])
          return (
            <Link key={href} to={href} className="group block">
              <Card
                interactive
                className={cn(
                  'h-full transition-all',
                  done && 'border-secondary/30 bg-secondary/5',
                )}
              >
                <div className="flex items-start gap-3">
                  <div
                    className={cn(
                      'flex h-9 w-9 shrink-0 items-center justify-center rounded-component',
                      done ? 'bg-secondary/10 text-secondary' : 'bg-coral/10 text-coral',
                    )}
                  >
                    {done ? <CheckCircle2 className="h-4 w-4" /> : <Icon className="h-4 w-4" />}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-start justify-between gap-2">
                      <p className="font-semibold text-text-primary group-hover:text-coral transition-colors">
                        {title}
                      </p>
                      {isJourneyStep && !done && (
                        <span className="shrink-0 rounded-component bg-primary/10 px-1.5 py-0.5 font-mono text-[9px] uppercase tracking-wide text-primary">
                          Journey
                        </span>
                      )}
                    </div>
                    <p className="mt-0.5 text-sm text-text-secondary">{description}</p>
                    <p className="mt-2 font-mono text-[10px] uppercase tracking-wide text-text-muted">
                      {readingTime(wordCount)}
                    </p>
                  </div>
                </div>
              </Card>
            </Link>
          )
        })}
      </div>
    </div>
  )
}
