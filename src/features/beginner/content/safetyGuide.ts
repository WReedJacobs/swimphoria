// Safety & your body — practical guide for beginner swimmers.

export interface SafetySection {
  id: string
  title: string
  body: string[]
}

export const safetySections: SafetySection[] = [
  {
    id: 'disclaimer',
    title: 'A quick note',
    body: [
      "Everything in this guide is general information for healthy adults taking up pool swimming. If you have a medical condition, are returning to exercise after illness or injury, or have any concerns about your health, check with your doctor before starting. Lifeguards are always your first resource at the pool — they would far rather answer a silly question than respond to an emergency.",
    ],
  },
  {
    id: 'cramp',
    title: 'What to do if you get cramp mid-pool',
    body: [
      "Cramp in a pool is uncomfortable and briefly frightening, but it is rarely dangerous. The most common site is the calf or foot.",
      "If you get cramp: stop swimming immediately. Roll onto your back and float. Use your hands to flex your foot (pull your toes toward your shin) or straighten and press the cramped muscle. Swim gently to the wall using your arms.",
      "To prevent cramp: stay hydrated before and during swimming, warm up properly before hard efforts, and avoid pushing off the wall with a rigid foot. If you regularly get cramp in the same muscle, it may be a sign of dehydration, fatigue, or that the muscle needs more warm-up time.",
    ],
  },
  {
    id: 'swimmers-ear',
    title: "Swimmer's ear prevention",
    body: [
      "Swimmer's ear (otitis externa) is an infection of the outer ear canal caused by water sitting in the ear after swimming. The main symptom is itching or pain that gets worse when you pull the outer ear.",
      "To prevent it: tilt your head to each side after swimming and gently shake out any pooled water. Do not use cotton buds — they push debris deeper. Some swimmers use silicone earplugs during swimming, or dry ear drops (available at pharmacies) afterwards.",
      "If you have repeated ear pain after swimming, see a doctor. It is treatable and preventable.",
    ],
  },
  {
    id: 'goggle-fog',
    title: 'Goggle fog fixes',
    body: [
      "Fogged goggles are mostly a goggle quality issue. The anti-fog coating on cheap goggles wears off quickly, especially if you rub the lens with your fingers.",
      "Do not touch the inside of the lens with your fingers — skin oil destroys anti-fog coating. Rinse goggles in cold fresh water after each session and store them in a case, not rattling around in a bag.",
      "If your goggles are already fogging: a tiny drop of baby shampoo on the inside lens, rinsed until only a trace remains, works surprisingly well. Commercial anti-fog drops also work. Replacing the goggles is the permanent fix.",
    ],
  },
  {
    id: 'shoulder',
    title: 'Shoulder niggles — fatigue vs pain that means stop',
    body: [
      "Shoulder fatigue (a heavy, tired feeling in the muscles after a hard session) is normal. Shoulder pain that is sharp, deep, or present at rest is not.",
      "The most common swimming shoulder injury is rotator cuff irritation from a high stroke volume with poor technique — usually a dropped elbow during the catch or a hand crossing the centreline in freestyle. Both put the shoulder in a weak position under load.",
      "Rule of thumb: if the pain goes away after warming up and does not return during rest, it is fatigue. If it worsens during swimming, persists for more than 24 hours, or is sharp rather than dull — rest for a few days and see a physiotherapist if it does not resolve. Swimming through sharp pain almost always makes it worse.",
    ],
  },
  {
    id: 'dizziness',
    title: 'Dizziness at the wall',
    body: [
      "Standing up quickly from swimming can cause a brief head rush (orthostatic hypotension) — blood that was redistributed to your working muscles rushes back. It is common and passes in a few seconds.",
      "If dizziness is persistent or comes on suddenly mid-swim: stop swimming, hold the wall, and rest until it passes. If you have ongoing dizziness with exercise, mention it to your doctor.",
    ],
  },
  {
    id: 'eating',
    title: 'Eating before swimming — the myth and what actually works',
    body: [
      "The old myth about cramping after eating before swimming is not supported by evidence. You will not cramp from eating before a swim session.",
      "What is true: swimming hard on a very full stomach is uncomfortable. A heavy meal 1–2 hours before a hard session may cause nausea or a side stitch.",
      "What actually works: a light snack 60–90 minutes before swimming (banana, toast, yoghurt, cereal) gives you energy without the heaviness. A full meal is fine if it is 2+ hours before the session. Do not swim fasted if you are doing anything harder than a gentle recovery swim.",
    ],
  },
  {
    id: 'hydration',
    title: 'Hydration — yes, you sweat in water',
    body: [
      "You sweat in a pool. The water cools your skin, which masks the sensation, but your body is producing and losing fluid throughout a swim session.",
      "For a standard 45–60 minute pool session, drink 400–600ml of water in the period around the session (before, during the rest intervals, and after). If you are doing longer or harder sessions, increase accordingly.",
      "Signs of dehydration after swimming: persistent headache, fatigue out of proportion to effort, dark urine. The easy fix is to bring a water bottle to the pool and drink it at the end.",
    ],
  },
  {
    id: 'cold-water',
    title: 'Cold-water shivering and when to get out',
    body: [
      "Most public pools in the UK and South Africa are maintained between 27–29°C — warm enough for sustained swimming. Outdoor or leisure pools may be cooler.",
      "Shivering when you get out of the pool is normal, especially in cooler months or after a long session when your body temperature has dropped. A warm shower and dry clothes sort it quickly.",
      "When to get out: if you experience unusual cramping, persistent numbness in limbs, confusion, or an inability to control your movements — these are signs of more serious cold stress. In open-water swimming, these are critical warning signs. In a heated pool, they are unlikely but worth knowing.",
    ],
  },
  {
    id: 'lifeguards',
    title: 'Lifeguards — always your first resource',
    body: [
      "Lifeguards are there for safety, but they are also available to answer questions before you get in. Not sure which lane to use? Ask. Not sure how the session works? Ask. Feel unwell poolside? Tell them immediately.",
      "Lifeguards would far, far rather you ask a question that turns out to be unnecessary than stay silent about something that needed attention. That is not a cliché — it is simply how their job works.",
    ],
  },
]
