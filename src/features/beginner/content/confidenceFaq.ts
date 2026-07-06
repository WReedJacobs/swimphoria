// Confidence & real-life questions — honest Q&A for adult beginner swimmers.

export interface FaqEntry {
  id: string
  question: string
  answer: string
  founderNote?: string
}

export const confidenceFaqs: FaqEntry[] = [
  {
    id: 'embarrassed',
    question: "I'm embarrassed to be seen learning as an adult.",
    answer:
      "This is the most common thing adult beginners say — and it is worth confronting directly, because it stops people from starting. Nobody in the pool is evaluating you. The swimmers doing lengths are focused entirely on their own stroke, their own breathing, their own problems. The ones resting at the wall are staring at the ceiling or the clock. Even the lifeguard is watching the water surface for safety, not assessing technique. The pool is one of the few genuinely non-judgmental public spaces, because everyone in it is absorbed in their own physical experience. What feels like a spotlight to you is invisible to everyone else.",
    founderNote: undefined,
  },
  {
    id: 'body',
    question: "I'm self-conscious about my body at the pool.",
    answer:
      "Pools contain people of every body shape, age, and fitness level. The person in the fast lane might surprise you; the person in the slow lane might surprise you more. What genuinely happens when you get in the water is that within about two minutes, you stop thinking about what you look like, because you are entirely occupied with breathing and moving and not swallowing water. The self-consciousness is almost always worst in the changing room and on the walk to the pool — once you are in, it disappears. The water is completely indifferent to what you look like.",
    founderNote: undefined,
  },
  {
    id: 'deep-water',
    question: "I'm scared of deep water. Do I have to go in it?",
    answer:
      "No. You can learn to swim entirely in the shallow end. The entire water confidence track, the breathing exercises, and the first 25m length can all be done in water shallow enough to stand in. Once you are comfortable swimming in the shallow end, you can gradually move into deeper water — but there is no deadline, and many experienced swimmers prefer the shallow end for training anyway. If the thought of deep water causes real anxiety, staying in the shallow end until you are completely comfortable is not a limitation; it is good sense.",
    founderNote: undefined,
  },
  {
    id: 'faster-lane',
    question: 'Everyone in my lane is faster than me.',
    answer:
      "Move down a lane. Seriously — it is not failure, it is correct lane selection. The whole point of speed-divided lanes is so that swimmers of different abilities can share a pool without getting in each other's way. A slow swimmer in a fast lane is inconvenient for everyone, including you. The slower lane is not the embarrassing lane; it is the appropriate lane. And the pace of the lane you belong in changes, because you get faster. Within a month or two of regular swimming, you will be the one moving up.",
    founderNote: undefined,
  },
  {
    id: 'glasses',
    question: 'Can I swim with glasses or contacts?',
    answer:
      "Glasses: no — they are not waterproof and will flood and fall off. Prescription goggles are the answer. They are widely available online and at large sports retailers in most common prescriptions, and they cost about the same as a good pair of regular goggles. If your prescription is unusual or changes regularly, opt for correctable swim goggles where you can swap the lens strength. Contacts: in well-sealed goggles, many swimmers wear daily disposable contacts without problems. The risk is that water-borne bacteria (including some that can cause serious eye infections) can get between the lens and the eye if goggles leak. This risk is low in well-maintained pools but not zero. If your goggles seal reliably, daily disposables are a reasonable option — dispose of them immediately after swimming.",
    founderNote: undefined,
  },
  {
    id: 'hair-skin',
    question: 'What does chlorine do to my hair and skin, and what helps?',
    answer:
      "Chlorine strips natural oils from both hair and skin. Over time, regular swimmers notice drier skin, a slightly rough feeling to their hair, and sometimes a greenish tinge to blonde or light-coloured hair (from copper in the water reacting with the chlorine). The three things that help most: wet your hair thoroughly with tap water before putting your cap on (hair saturated with fresh water absorbs less chlorine), wear a good silicone cap (it won't keep all chlorine out but significantly reduces contact), and rinse your hair and skin with fresh water immediately after getting out. A good conditioner applied before swimming can also act as a barrier. If you swim daily, a dedicated swimmer's shampoo and leave-in conditioner are worth the cost.",
    founderNote: undefined,
  },
  {
    id: 'period',
    question: 'Can I swim on my period?',
    answer:
      "Yes. Swimming on your period is completely fine. Water pressure typically reduces flow while you are in the pool. Options: a tampon (works well for most swimmers), a menstrual cup or disc (popular with regular swimmers because they are more secure for longer sessions), or a period swimsuit/leak-proof swimwear if your flow is light. Pads are not suitable for swimming. If you use a tampon, change it immediately before your swim and immediately after. There is nothing in the water that interacts with menstruation in any harmful way.",
    founderNote: undefined,
  },
  {
    id: 'panic',
    question: "I panicked mid-length once and now I'm nervous about it happening again.",
    answer:
      "This happens to a lot of adult beginners, and the anxiety it creates can be more persistent than the original event. Here is the practical reality: the wall is never more than 12.5 metres away from the middle of a 25m pool. If you start to feel panicked at any point, you can stop, stand up (in the shallow end), or grab the lane rope — all of these are always available. The panic response usually comes from breath-holding; going back to the breathing exercises in the shallow end before swimming lengths often removes it. Regression is not failure — practising the confidence stages again after a panic is exactly what experienced coaches recommend. It is progress, just not the kind that shows in lap counts.",
    founderNote: undefined,
  },
  {
    id: 'frequency',
    question: 'How often do I need to go to actually improve?',
    answer:
      "Two sessions per week beats one session per week, consistently and significantly. The neuromuscular adaptations that make swimming feel easier — your body learning the movement patterns, your breathing becoming automatic — require repetition within a few days of each other. If you go once a week with 6 days between sessions, you spend half of each session relearning what you forgot. Twice a week with 3 days in between keeps the learning cumulative. Three times a week is better still, but two is the minimum to make real progress. Even short sessions (30 minutes) twice a week will show results within 3–4 weeks.",
    founderNote: undefined,
  },
  {
    id: 'exhausting',
    question: 'When will it stop feeling so exhausting?',
    answer:
      "For most adult beginners, the biggest shift happens somewhere between weeks 3 and 6 of regular swimming. The exhaustion in the early weeks is not primarily cardiovascular — it is neuromuscular. Your body is trying to coordinate a complex pattern of movements it has never done before, simultaneously managing breathing, balance, and propulsion. That cognitive load is genuinely tiring, over and above the physical effort. As the movements become more automatic, the cognitive drain drops off sharply — and swimming suddenly feels manageable. Many swimmers describe this as the moment swimming 'clicks'. It does not happen overnight, but it happens reliably with regular practice.",
    founderNote: undefined,
  },
]
