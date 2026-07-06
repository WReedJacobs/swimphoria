// Your First Visit walkthrough — a chronological, door-to-water narrative.

export interface PackItem {
  id: string
  label: string
  note?: string
}

export const packList: PackItem[] = [
  { id: 'goggles', label: 'Goggles', note: 'If you do not have any yet, the pool often sells basic ones at reception.' },
  { id: 'cap', label: 'Swim cap', note: 'Silicone. Some pools require one.' },
  { id: 'costume', label: 'Costume or jammers', note: 'Not boardshorts — they create drag and fill with water.' },
  { id: 'towel', label: 'Towel (large)', note: 'You will need it more than you expect.' },
  { id: 'flip-flops', label: 'Flip flops / pool shoes', note: 'For the changing rooms and poolside.' },
  { id: 'lock', label: 'Padlock', note: 'Most lockers are coin-operated or require your own lock.' },
  { id: 'wet-bag', label: 'Waterproof bag for wet kit', note: 'A plastic bag works fine. Your towel will thank you.' },
  { id: 'shampoo', label: 'Shampoo and body wash', note: 'Optional but you will want them after a chlorinated session.' },
  { id: 'water', label: 'Water bottle', note: 'You sweat even in water. Bring something to drink at the end.' },
]

export interface FirstVisitSection {
  id: string
  title: string
  body: string[]
}

export const firstVisitSections: FirstVisitSection[] = [
  {
    id: 'paying',
    title: 'Getting in and paying',
    body: [
      "Arrive 15–20 minutes before you plan to swim — your first visit always takes longer than expected. At the reception desk, ask for a public lane swim session. Most pools charge per session; some sell punch cards or memberships. If it is your very first visit, ask the staff what to bring and whether they have lockers — they have answered this question a thousand times and will not judge you.",
      "You will usually get a wristband or locker key at reception. If the session is busy, ask which lanes are slowest — some pools designate them, others rely on swimmers to self-sort.",
    ],
  },
  {
    id: 'changing',
    title: 'Changing rooms',
    body: [
      "The changing rooms are gender-divided (or sometimes mixed, especially at newer leisure centres). Find a free locker or cubicle, change into your costume, and pack everything else away.",
      "Before you head out: quick rinse in the shower. Most pools ask you to shower before swimming — it reduces the load on the water treatment system and is general courtesy. You do not need to wash your hair; a 30-second rinse is all that is expected.",
      "Pack your clothes and valuables into the locker. Take your goggles, cap and towel (leave the towel on a bench at the pool edge, or on a hook if there is one nearby).",
    ],
  },
  {
    id: 'poolside',
    title: 'Walking onto the poolside',
    body: [
      "The first time you walk through those doors onto a wet pool deck, you will probably feel like everyone is watching you. They are not. Every single person in the pool is staring at the black line on the pool floor, thinking about their own breathing and their own stroke. Nobody is watching the new person.",
      "Walk — do not run. Wet poolside tiles are slippery and lifeguards will politely and firmly remind you of this.",
      "Stand at the end of the slowest lane and have a look. Watch the speed of the swimmers. If they are doing slow, leisurely laps with lots of wall rest, that is your lane. If they are turning without stopping and leaving 5-second gaps between each swimmer, they are faster than you right now — and that is completely fine.",
    ],
  },
  {
    id: 'getting-in',
    title: 'Getting into the water',
    body: [
      "Use the steps or the ladders at the pool end. Nobody dives in on their first session, and nobody expects you to. Sit on the edge, lower yourself in, or use the steps — all of these are exactly as legitimate as a dive.",
      "The water will likely feel cold for the first 30 seconds. This is always the hardest part. Keep moving and it passes quickly.",
      "If there is someone already in your lane, sit on the end and make eye contact when they come to the wall. Hold up one finger to signal you are joining. They will nod and move to one side. This is standard pool protocol and everyone knows it.",
    ],
  },
  {
    id: 'first-20-minutes',
    title: 'What to do for your first 20 minutes',
    body: [
      "Here is a literal plan for your first session. Do not overcomplicate it.",
      "Length 1: Swim to the other end at whatever pace feels comfortable. If you need to stop, stop. Rest at the wall as long as you like.",
      "Length 2: Same thing. If you managed the first without stopping, try to focus on breathing this time — exhale into the water, turn your head to inhale.",
      "Length 3 and 4: Rest for 1–2 minutes between each. You are not building fitness yet; you are just getting comfortable.",
      "If 4 lengths felt fine: do 4 more with a minute's rest between each. That is 200m and a completely legitimate first session.",
      "If 4 lengths felt like a lot: that is also fine. 4 lengths and home is a good first session. You came, you swam, you left. Next time you will swim 6.",
    ],
  },
  {
    id: 'leaving',
    title: 'How to leave feeling like you won',
    body: [
      "At the wall after your last length: stop. Do not immediately climb out and rush to change. Hang on the wall for a moment and notice that you are not as wrecked as you expected. That is the water holding your body weight for the past 20 minutes — you will feel it more once you are out.",
      "Rinse off in the shower after. A quick shampoo makes a noticeable difference to how much chlorine smell you take home.",
      "In the changing room, you did it. Your first session. The sessions get easier from here — not because they get less demanding, but because they get more familiar. You will know where the lockers are, which lane to pick, how to join without awkwardness. By session 3 it will feel like yours.",
    ],
  },
]
