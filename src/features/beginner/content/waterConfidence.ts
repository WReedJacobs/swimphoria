// Water Confidence track — for people who can't yet swim a full length.

export interface ConfidenceStage {
  id: string
  name: string
  goal: string
  where: string
  steps: string[]
  reassurance: string
  panicNote: string
}

export const waterConfidenceStages: ConfidenceStage[] = [
  {
    id: 'standing',
    name: 'Standing and moving in chest-deep water',
    goal: 'You can walk the width of the pool in chest-deep water without gripping the wall, and can lower your shoulders underwater.',
    where: 'Shallow end, where you can stand comfortably. Waist-deep is fine to start — move to chest-deep when you are ready.',
    steps: [
      'Walk slowly from one side of the pool to the other. Feel the resistance of the water against your body.',
      'Stop and stand still. Let the water settle around you. Breathe normally.',
      'Try walking faster, then slower. Notice how the water pushes back.',
      'Bend your knees until your shoulders are just below the surface. Stand back up. Repeat 5 times.',
      'Try gentle bobbing: lower yourself so your chin touches the water, back up, repeat 10 times.',
    ],
    reassurance:
      "The water pushing back against you is just physics — it's not trying to knock you down. Once you've walked a few lengths in chest-deep water, your body starts to stop bracing against the sensation. That loosening-up feeling is the first real step.",
    panicNote:
      "If you feel the urge to grab the wall, grab it. There is no rule about needing to let go. The goal is simply to hold it for less time each session.",
  },
  {
    id: 'face-in',
    name: 'Face in the water — exhaling underwater',
    goal: 'You can put your face in the water and exhale a full breath through your nose and mouth without holding your breath.',
    where: 'Shallow end, standing. Hold the wall if it helps.',
    steps: [
      'Take a breath in. Lower your face into the water until your nose and mouth are fully submerged.',
      'Instead of holding your breath, blow out slowly and steadily — make bubbles. Big, deliberate bubbles.',
      'Lift your head, inhale. Lower, exhale. Repeat 10 times in a row.',
      'Try inhaling more deeply each time so the exhale lasts longer.',
      'When you can do 10 steady exhales without tension, this stage is done.',
    ],
    reassurance:
      "This is the single most important beginner skill in swimming, and very few people are taught it. Holding your breath underwater is what causes the panicky, strangled feeling after one length — because you are running out of oxygen before you even reach the wall. Exhaling underwater keeps CO₂ from building up, which is what the breathless sensation actually is. Once this becomes automatic, you will suddenly find swimming much less exhausting.",
    panicNote:
      "If you feel a sudden urge to come up gasping — that's CO₂ building up from holding your breath. Lift your head, breathe, and try again. This panic reflex gets quieter within a few sessions as your brain learns that the water won't stop you from breathing.",
  },
  {
    id: 'rhythmic-breathing',
    name: 'Rhythmic breathing at the wall',
    goal: 'You can do 10 consecutive breath cycles (exhale under → turn → inhale → face back in) without stopping.',
    where: 'Shallow end, facing the wall, hands resting on the gutter.',
    steps: [
      'Hold the wall lightly with both hands. Face the water.',
      'Take a breath in. Put your face in the water. Exhale steadily (3–4 seconds). Turn your head to the side — not up — and inhale.',
      'Immediately put your face back in and exhale again. Repeat.',
      'Keep the rhythm: in, face down, blow out, turn, in. Do not pause between exhale and inhale.',
      'Aim for 10 cycles without stopping. Rest. Try again.',
    ],
    reassurance:
      "The turn to breathe should feel like a gentle head rotation, not a lift. One ear stays in the water. This is the exact movement you will use when swimming — so every repetition here is direct transfer to your stroke.",
    panicNote:
      "If you swallow water: stop, stand, cough, laugh if you want to, and continue. Swallowing water is something every swimmer does regularly. It is uncomfortable, not dangerous. A few sessions in, you will barely notice it.",
  },
  {
    id: 'front-float',
    name: 'Front float and recovery to standing',
    goal: 'You can float face-down for 5 seconds and return to standing under control.',
    where: 'Shallow end. You should be able to put your feet down at any time.',
    steps: [
      'Take a breath in. Lean forward until your face goes in and your feet lift off the floor.',
      'Spread your arms and legs gently. Hold for 3–5 seconds.',
      'To recover: tuck your chin, bring your knees to your chest, press your hands down on the water, and stand up.',
      'Repeat 5 times. Then try the same on your back: lean back, ears in the water, arms out, and float.',
      'Back float recovery: roll slightly to one side, bring your feet down, stand.',
    ],
    reassurance:
      "Floating feels unnatural to some bodies — people with less body fat often sink more easily. If you struggle to float, that is not a failure of nerve; it is just physics. Floatability varies enormously and has nothing to do with your ability to swim well.",
    panicNote:
      "If you start to sink and feel panicky, tuck your chin and bring your feet down — the pool floor is right there. You cannot sink to the bottom and stay there in the shallow end. Your feet will find the floor.",
  },
  {
    id: 'push-glide',
    name: 'Push-and-glide from the wall',
    goal: "You can push off the wall with both feet, arms extended, face down, and glide for at least 3 metres before your feet touch the bottom.",
    where: 'Shallow end. Push toward the other side of the pool.',
    steps: [
      'Stand about 30cm from the wall, facing away from it.',
      'Place both feet flat on the wall behind you, bend your knees.',
      'Extend your arms straight in front, hands together. Take a breath in.',
      'Push off, face in the water, body flat and extended like an arrow.',
      'Hold the glide position until you slow to a stop, then stand up.',
      'Each session, try to glide further before touching down.',
    ],
    reassurance:
      "A good push-off from the wall is the fastest moment in pool swimming, even for elite swimmers. Learning to glide quietly with a flat body is not a beginner thing — it is fundamental. You are not doing a watered-down version of real swimming; you are learning the most important part.",
    panicNote:
      "If the water depth increases as you glide and you cannot touch the floor — just stop gliding, roll onto your back or stand. In a 25m pool, the shallow end stays shallow for at least 10–12 metres. You have room.",
  },
  {
    id: 'push-glide-kick',
    name: 'Push-and-glide with flutter kick',
    goal: 'You can push off and kick your way to the other side of the pool (25m), even if you need to stand and restart once or twice.',
    where: 'Full pool length. A kickboard helps but is not essential.',
    steps: [
      'Push off from the wall as in the previous stage.',
      'After the glide slows, begin a gentle flutter kick: legs straight, ankles floppy, feet just splashing the surface.',
      'Keep your arms extended in front. Focus on breathing (exhale into the water, turn your head to breathe).',
      'If you hold a kickboard, push it in front of you and focus entirely on the kick.',
      'Rest at each wall as long as you need. Aim to do 4 lengths in a session.',
    ],
    reassurance:
      "The kick on its own will not make you fast. In full freestyle, arms and body rotation provide most of the power. The kick is about maintaining balance and rhythm. A gentle, lazy kick is completely fine at this stage.",
    panicNote:
      "If your legs keep sinking: you are probably holding your breath. Exhale into the water and your hips will rise. Alternatively, a pull buoy between your thighs gives you instant feedback on what correct hip position feels like.",
  },
  {
    id: 'first-arm-cycles',
    name: 'Adding arm strokes — one, then three',
    goal: 'You can take 3 arm strokes and breathe without stopping, returning to the glide position at will.',
    where: 'Full pool, in your slowest lane.',
    steps: [
      'Push off and glide. After the glide, take one arm stroke — just one — then return to the glide position.',
      'In the next length, take 3 arm strokes, rest in the glide, take 3 more.',
      'Focus entirely on breathing during the arm strokes: exhale as you pull, turn your head to inhale as the arm exits.',
      'If it falls apart, stop, stand, breathe, try again. Breaking it into chunks is not failure — it is how this is learned.',
    ],
    reassurance:
      "Trying to do everything at once — arms, kick, breathing, direction — is genuinely overwhelming, and it is why so many adults give up in the first week. Taking it one arm stroke at a time is not a shortcut; it is the actual method coaches use with adult learners.",
    panicNote:
      "If you get confused and your technique collapses — stop. Stand. Reset. The pool is 25m long and the wall is never more than 12.5m away from the middle. Standing up is always an option.",
  },
  {
    id: 'first-25m',
    name: 'Your first unbroken 25m',
    goal: 'You swim one length without stopping, even if it is slow, and even if the technique is imperfect.',
    where: 'Full pool. Pick the slowest lane if others are present.',
    steps: [
      'Warm up with 2 kick lengths and 2 lengths of arm-cycle practice.',
      'At the wall: push off, glide, begin your arm strokes, breathe every 2–3 strokes.',
      'If you get tired, slow down rather than stopping. Kick less. Take extra breath every 2 strokes.',
      'Reach the wall at the other end. Touch it.',
      'Rest as long as you need. You just swam a length.',
    ],
    reassurance:
      "Slow is absolutely fine. Your stroke might look nothing like the swimmers in the lane next to you, and that is irrelevant. Stopping at the wall to celebrate is mandatory — you have just done something your body did not know how to do a few weeks ago. The polish comes with repetition.",
    panicNote:
      "If you need to stop before you reach the wall — stop. Stand up. Then restart from that point. Swimming half a length, resting, and finishing it is not failure. That is exactly how this progresses. Next time you will stop once less.",
  },
]
