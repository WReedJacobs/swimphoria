// Breathing masterclass — the #1 blocker for adult beginner swimmers.

export interface BreathingSection {
  id: string
  title: string
  body: string[]
}

export const breathingSections: BreathingSection[] = [
  {
    id: 'why-gasping',
    title: "Why you're out of breath after one length — and it's not your fitness",
    body: [
      "Almost every adult beginner arrives at the pool thinking they are out of shape, because they get completely winded after a single length. Then they feel confused and a little embarrassed, because they can run for 30 minutes without trouble.",
      "Here is what is actually happening: you are holding your breath. Not deliberately — your nervous system does it automatically as a panic response to having your face submerged. When you hold your breath, CO₂ builds up in your bloodstream. CO₂ — not lack of oxygen — is what triggers the breathless, desperate sensation. By the time you reach the wall, your body is screaming to exhale, not because you ran out of air, but because you never let any out.",
      "The solution is not fitness. It is learning to exhale continuously while your face is in the water. Once that becomes automatic, the gasping disappears — often within a single session. You will go from barely managing one length to being able to swim several in a row, and you will feel the difference immediately.",
    ],
  },
  {
    id: 'exhale-rule',
    title: 'The exhale-underwater rule',
    body: [
      "The most important rule in swimming breathing is: exhale while your face is in the water. Not hold. Exhale.",
      "Breathe in when your face is out. Breathe out when your face is in. It sounds simple, and the mechanics are simple — but your nervous system resists it until you have trained the pattern enough times that it becomes automatic.",
      "The exhale does not need to be forceful. A steady, relaxed trickle of air through your nose (or mouth, or both) is all that is required. Some swimmers blow hard bubbles; others just let air escape slowly. Both work. The only rule is that air must be leaving your lungs while your face is submerged.",
    ],
  },
  {
    id: 'bobbing-practice',
    title: 'The 10-minute bobbing drill that changes everything',
    body: [
      "Stand in chest-deep water at the shallow end. You are going to do nothing except practise the breath cycle for 10 minutes.",
      "Inhale through your mouth. Put your face in the water — not dunked, just lowered until your nose and mouth are submerged. Exhale slowly through your nose. Lift your head, inhale. Repeat.",
      "Do this 20 times. Then do it 20 more times with a rhythm: inhale → down → exhale for a count of 3 → up → inhale. Find a pace that feels sustainable.",
      "This drill alone — 10 minutes of bobbing — has fixed the breathing for more adult beginner swimmers than any other technique. It is boring and unglamorous, and it is worth every second.",
    ],
  },
  {
    id: 'patterns',
    title: 'Breathing patterns — every 2 vs every 3 strokes',
    body: [
      "In freestyle, you can breathe every 2 strokes (to one side only) or every 3 strokes (alternating sides). Both are valid.",
      "Every 3 strokes is called bilateral breathing. It keeps your stroke balanced and symmetrical, which is useful for technique development. Most coaches recommend it as a long-term habit.",
      "Every 2 strokes means more air and is useful when you are working hard or when your CO₂ tolerance is still developing. As a beginner, if every 3 is causing you to tense up, breathe every 2. Getting the exhale pattern right matters far more than which side you breathe on.",
      "For beginners specifically: do not worry about bilateral breathing until breathing every 2 strokes feels natural. One thing at a time.",
    ],
  },
  {
    id: 'bow-wave',
    title: "The 'pocket of air' — why you don't need to lift your head",
    body: [
      "When you swim freestyle, your head creates a small bow wave on either side — a trough of lower water level right where your face turns to breathe. This means the air is closer to your face than you think. You do not need to lift your head out of the water to breathe — you only need to rotate your head until your mouth clears the surface of that trough.",
      "One goggle stays in the water when you breathe. The goggle that is in the water is your anchor — it tells you that your head is in the right position. If both goggles are out of the water, you have lifted too far and your hips are sinking.",
      "It feels counterintuitive at first. Most beginners lift their whole head because they cannot believe there is air right there at the water surface. There is. Trust the bow wave.",
    ],
  },
  {
    id: 'swallowing-water',
    title: 'What to do when you swallow water',
    body: [
      "You will swallow water. Every swimmer does. It is uncomfortable, sometimes a little frightening, and completely harmless.",
      "When it happens: stop at the wall (or stand up), cough it out, take a few breaths, and continue. Do not try to push through while coughing — just stop, sort it out, and restart.",
      "Swallowing water happens most often when you try to inhale before you have finished exhaling, or when you try to breathe too late and the wave has already passed your mouth. Both of these get better automatically as your timing improves.",
    ],
  },
  {
    id: 'breathlessness-vs-panic',
    title: 'Breathlessness vs panic — and when to hold the wall',
    body: [
      "There is a difference between breathing hard from exertion — which is normal and fine — and the anxious, suffocating sensation of CO₂ buildup from holding your breath.",
      "Breathing hard from exertion: you have been working. Rest at the wall, breathe, continue. This gets easier as fitness improves.",
      "CO₂ panic: face comes out of the water, gasping, chest tight, want to get out of the pool immediately. This is the holding-breath problem. The fix is not rest — it is exhaling into the water on the next length.",
      "If at any point you feel overwhelmed: grab the wall. The wall is there for exactly this reason. Hang on it, breathe, let your heart rate settle. Nobody will question you, and you are not failing. You are in a pool, not a race.",
    ],
  },
  {
    id: 'session-plan',
    title: 'A 10-minute standalone breathing session',
    body: [
      "You can do this in any pool session, at any point. It takes 10 minutes and fixes more problems than an hour of struggling lengths.",
      "Minutes 1–3: Stand in the shallow end and do the bobbing drill. 30 breath cycles, steady rhythm. Exhale fully each time.",
      "Minutes 4–6: Hold the wall with both hands. Do the rhythmic breathing drill from the side: face in, exhale, turn to the side, inhale. 20 cycles. Keep one ear in the water when you turn.",
      "Minutes 7–10: Swim one length, focusing only on the exhale. Nothing else — not your arms, not your kick. Just: face in, exhale, turn, inhale. Repeat for 4 lengths.",
      "After this session, note whether the gasping at the wall is better. It almost always is. Repeat it at the start of every session until the exhale is automatic.",
    ],
  },
]
