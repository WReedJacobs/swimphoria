export interface JourneyStep {
  id: string
  label: string
  description: string
  href: string
  icon: string
}

export interface JourneyStage {
  id: 'explorer' | 'learner' | 'ready'
  label: string
  description: string
  steps: JourneyStep[]
}

export const JOURNEY_STAGES: JourneyStage[] = [
  {
    id: 'explorer',
    label: 'Explorer',
    description: 'Get to know the pool, breathe right, and build confidence',
    steps: [
      {
        id: 'read_pool_guide',
        label: 'Read the Pool Guide',
        description: 'Lane etiquette, equipment, and what to expect at the pool',
        href: '/beginner/learn/pool-guide',
        icon: 'MapPin',
      },
      {
        id: 'read_first_visit',
        label: 'Read: Your First Visit',
        description: 'A door-to-water walkthrough of your very first session',
        href: '/beginner/learn/first-visit',
        icon: 'DoorOpen',
      },
      {
        id: 'read_breathing',
        label: 'Read: Breathing Masterclass',
        description: 'The #1 fix for most beginner swimmers — exhale underwater',
        href: '/beginner/learn/breathing',
        icon: 'Wind',
      },
      {
        id: 'read_training_basics',
        label: 'Read Training Basics',
        description: 'Effort levels, intervals, and how to read a session plan',
        href: '/beginner/learn/training-basics',
        icon: 'Gauge',
      },
      {
        id: 'browse_drills',
        label: 'Browse the Drill Library',
        description: 'See the drills coaches use to improve technique',
        href: '/beginner/learn/drills',
        icon: 'Library',
      },
    ],
  },
  {
    id: 'learner',
    label: 'Learner',
    description: 'Start getting in the water and building a routine',
    steps: [
      {
        id: 'first_log',
        label: 'Log your first swim',
        description: 'Record any swim — distance and how it felt is enough',
        href: '/beginner/log',
        icon: 'Plus',
      },
      {
        id: 'set_goal',
        label: 'Set a weekly distance goal',
        description: 'Pick a realistic weekly target to aim for',
        href: '/beginner',
        icon: 'Target',
      },
      {
        id: 'complete_workout',
        label: 'Complete a workout',
        description: 'Follow a structured session from the 8-week Program',
        href: '/beginner/program',
        icon: 'PlayCircle',
      },
      {
        id: 'three_swims',
        label: 'Log 3 swims in a week',
        description: 'Consistency is the foundation of every swimmer',
        href: '/beginner/log',
        icon: 'CalendarCheck',
      },
    ],
  },
  {
    id: 'ready',
    label: 'Ready to Swim',
    description: 'Take it to the next level with timed tracking',
    steps: [
      {
        id: 'timed_swim',
        label: 'Log a timed swim',
        description: 'Record a swim with your stroke, distance and time',
        href: '/beginner/log',
        icon: 'Timer',
      },
      {
        id: 'one_km',
        label: 'Reach 1km total distance',
        description: 'Your first major milestone — 1,000m total logged',
        href: '/beginner/milestones',
        icon: 'Award',
      },
      {
        id: 'first_milestone',
        label: 'Unlock your first milestone',
        description: 'Hit a distance milestone to mark your progress',
        href: '/beginner/milestones',
        icon: 'Star',
      },
    ],
  },
]

export const ALL_STEP_IDS = JOURNEY_STAGES.flatMap((s) => s.steps.map((st) => st.id))

export const STAGE_ORDER: Array<'explorer' | 'learner' | 'ready'> = ['explorer', 'learner', 'ready']

// Mapping of guide page hrefs to journey step IDs — used by GuideFooter auto-mark
export const GUIDE_STEP_MAP: Record<string, string> = {
  '/beginner/learn/pool-guide': 'read_pool_guide',
  '/beginner/learn/first-visit': 'read_first_visit',
  '/beginner/learn/breathing': 'read_breathing',
  '/beginner/learn/training-basics': 'read_training_basics',
  '/beginner/learn/drills': 'browse_drills',
}
