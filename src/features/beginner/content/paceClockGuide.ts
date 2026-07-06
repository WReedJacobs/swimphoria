// Pace clock & session notation explainer.

export interface PaceClockSection {
  id: string
  title: string
  body: string[]
}

export const paceClockSections: PaceClockSection[] = [
  {
    id: 'what-is-it',
    title: 'What is a pace clock?',
    body: [
      "A pace clock is a large analogue clock mounted on the pool wall at each end, usually with a prominent red second hand that completes one full revolution every 60 seconds. Some pools have digital displays instead, but the analogue clock is still the most common.",
      "The pace clock is the central tool of structured lane swimming. Everything in a coached session — when to push off, how much rest you took, how long your rep was — is read from the clock.",
      "'Leaving on the red top' means you push off when the red second hand is at the 12 o'clock position (the top of the clock, marking :00 or :60 depending on how you count). It is the most common starting instruction in lane swimming.",
    ],
  },
  {
    id: 'reading',
    title: 'How to read the pace clock',
    body: [
      "The clock has a red second hand and often a black minute hand. The red hand is what you watch for swimming.",
      "At :00 (top): the hand is at the 12 o'clock position. This is 'on the top' — the most common push-off point.",
      "At :30 (bottom): the hand is at the 6 o'clock position. This is 'on the bottom' — the second most common.",
      "As the hand moves from top to bottom, it counts 30 seconds. From bottom back to top is the next 30 seconds.",
      "If your send-off is 1:30 and you leave on the top (:00), you push off again when the hand hits the bottom on the next revolution plus halfway (:90 total, i.e. the hand at the bottom of its second pass). In practice: leave when the hand is at the top. When it has gone around once and is pointing to the 3 o'clock position (:15), that is your :75 mark. When it reaches the 6 o'clock on the second pass (:30 + :60 = :90), that is your 1:30 send-off. Arrive before then or you have less rest.",
    ],
  },
  {
    id: 'notation',
    title: "What '8 × 50m on 1:30' means",
    body: [
      "Standard session notation follows this pattern: [repetitions] × [distance] [on / rest] [time].",
      "'8 × 50m on 1:30' means: swim 50m, eight times, leaving for each rep every 1 minute 30 seconds.",
      "If you swim the 50m in 55 seconds, you get 35 seconds of rest before you push off again. If you swim it in 1:10, you get 20 seconds. The send-off time is fixed; your rest is what changes based on how fast you go.",
      "A worked example timeline for 4 × 50m on 1:30, all leaving on the top (:00):",
      "Rep 1 leaves at :00. Arrives at :55. Rests until 1:30.",
      "Rep 2 leaves at 1:30. Arrives at 2:25. Rests until 3:00.",
      "Rep 3 leaves at 3:00. Arrives at 3:55. Rests until 4:30.",
      "Rep 4 leaves at 4:30. Done at 5:25.",
    ],
  },
  {
    id: 'rest-vs-interval',
    title: "'Rest 20s' vs 'on an interval' — what is the difference?",
    body: [
      "'Rest 20s' means you take 20 seconds of rest after each rep, regardless of how fast you swam. If you swam 100m in 1:45, you leave again at 2:05. If you swam it in 2:00, you leave at 2:20.",
      "'On 2:00' (or 'on an interval of 2:00') means you leave every 2 minutes exactly. Your rest time varies with your speed.",
      "The practical difference: fixed rest is easier to manage when you are new, because you just count to 20 after touching the wall. Fixed intervals are more common in structured coaching because they let the coach control the training stimulus precisely — faster swimmers get more rest as a reward; slower swimmers get less rest as a challenge.",
    ],
  },
  {
    id: 'counting-laps',
    title: 'Counting laps without losing count',
    body: [
      "Losing count of laps is one of the most universally shared experiences in swimming. There are reliable solutions.",
      "Count by set structure, not raw laps. '8 × 100m' means 32 lengths (4 per 100m rep). Count reps (1 to 8), not lengths. Each time you complete 4 lengths, that is one rep done.",
      "Use a lap counter ring — a small silicone or plastic ring you click once per length. It costs almost nothing and eliminates the problem entirely.",
      "The chunking method: group lengths into blocks. '10 lengths total' becomes '5 there, 5 back' — a single mental number instead of ten.",
    ],
  },
  {
    id: 'set-abbreviations',
    title: 'Reading a written set — abbreviations explained',
    body: [
      "W/U or warm-up: easy swimming at the start of a session to prepare your body.",
      "MS or main set: the core training block — highest intensity or most technical work.",
      "C/D or cool-down: easy swimming at the end to bring your heart rate down.",
      "Choice: you pick the stroke.",
      "Pull: done with a pull buoy (no kick).",
      "Kick: done with a kickboard (kick only).",
      "FC or Free: freestyle.",
      "BK or Back: backstroke.",
      "BR or Breast: breaststroke.",
      "Fly or BF: butterfly.",
      "IM: all four strokes in butterfly-backstroke-breaststroke-freestyle order.",
      "Desc: descending (each rep faster than the last).",
      "Build: effort increases progressively within each rep.",
      "Neg split: swim the second half faster than the first.",
    ],
  },
]
