-- 019_set_presets_seed.sql
-- Global preset catalog (owner_id IS NULL). Mirrors src/lib/presetCatalog.ts.
-- 65 curated presets (#1–65) + 10 level-gap fillers (#66–75) = 75 total.
-- Re-run safe: INSERT with ON CONFLICT DO NOTHING would require a unique index on
-- (owner_id, title) which is not worth the schema complexity — run once on a fresh DB.

INSERT INTO public.set_presets
  (owner_id, title, category, level, stroke, reps, distance,
   rest_type, rest_value, equipment, description, structure, family)
VALUES

-- ─── Warm-ups ────────────────────────────────────────────────────────────────

(NULL, 'Easy Start', 'warmup', 'beginner', NULL, 4, 25,
 'rest_seconds', 30, '{}', 'First lengths of the session — any stroke, go slow, stand at the wall if you need to. This is a wake-up call, not a test.',
 NULL, NULL),

(NULL, 'Classic Opener', 'warmup', 'intermediate', 'freestyle', 1, 400,
 'rest_seconds', 20, ARRAY['kickboard'], 'The standard club warm-up in miniature: swim to warm the lungs, kick to wake the legs, build 25s to prime your speed. Keep the build-ups controlled — the last 25 should feel fast, not frantic.',
 '[{"reps":1,"distance":200,"note":"swim"},{"reps":1,"distance":100,"note":"kick"},{"reps":4,"distance":25,"note":"build"}]'::jsonb, NULL),

(NULL, 'Full Club Warm-up', 'warmup', 'elite', NULL, 1, 600,
 'rest_seconds', 15, ARRAY['kickboard'], 'The traditional 700m club opener: swim, kick, drill, then four build 25s. Each block has a job — do not rush through any of them.',
 '[{"reps":1,"distance":200,"note":"swim"},{"reps":1,"distance":200,"note":"kick"},{"reps":1,"distance":100,"note":"drill"},{"reps":4,"distance":25,"note":"build"}]'::jsonb, NULL),

(NULL, 'Wake-up Ladder', 'warmup', 'intermediate', 'freestyle', 1, 300,
 'rest_seconds', 20, '{}', 'Ascending distances raise heart rate gradually without shock. Start well within yourself — the 150 should feel like stretching out, not racing.',
 '[{"reps":1,"distance":50},{"reps":1,"distance":100},{"reps":1,"distance":150}]'::jsonb, NULL),

(NULL, 'Mixed Stroke Warm-up', 'warmup', 'intermediate', NULL, 6, 50,
 'rest_seconds', 20, '{}', 'Alternating freestyle and backstroke loosens shoulders in both directions. Do not chase the clock — find your rhythm early.',
 NULL, NULL),

(NULL, 'Beginner Kick Start', 'warmup', 'beginner', 'freestyle', 4, 25,
 'rest_seconds', 45, ARRAY['kickboard'], 'Legs-only opener using a kickboard for support. Aim for small, quick kicks from the hips — if you are making big waves, slow down.',
 NULL, NULL),

-- ─── Endurance / aerobic ─────────────────────────────────────────────────────

(NULL, 'First Distance', 'endurance', 'beginner', 'freestyle', 4, 25,
 'rest_seconds', 40, '{}', 'Steady 25s with time to recover — focus on exhaling fully underwater and turning to breathe rather than lifting your head. The clock does not matter here.',
 NULL, NULL),

(NULL, 'Building Blocks', 'endurance', 'beginner', 'freestyle', 6, 25,
 'rest_seconds', 30, '{}', 'Consistency over speed — aim for the same feel on every rep. If the last ones are harder than the first, you went too fast early.',
 NULL, NULL),

(NULL, 'Steady 50s', 'endurance', 'beginner', 'freestyle', 4, 50,
 'rest_seconds', 45, '{}', 'First continuous 50m reps — slow is fine. Rest fully, breathe properly, and keep the same stroke count lap to lap.',
 NULL, 'aerobic_100s'),

(NULL, 'Aerobic 50s', 'endurance', 'intermediate', 'freestyle', 8, 50,
 'rest_seconds', 20, '{}', 'Smooth aerobic rhythm across all eight reps, with bilateral breathing every three strokes. You should be able to talk — just not want to.',
 NULL, NULL),

(NULL, 'The Staple', 'endurance', 'intermediate', 'freestyle', 10, 100,
 'css_offset', 8, '{}', 'The classic aerobic 100s set that every swimmer eventually comes back to. Even pacing rep to rep matters more than raw speed — count strokes through the set.',
 NULL, 'aerobic_100s'),

(NULL, 'Century Club', 'endurance', 'elite', 'freestyle', 10, 100,
 'css_offset', 5, '{}', 'Tighter turnaround than The Staple — hold your form in the last four reps where it starts to matter. Finish with the same stroke count you started with.',
 NULL, 'aerobic_100s'),

(NULL, 'Long Smooth 200s', 'endurance', 'intermediate', 'freestyle', 4, 200,
 'rest_seconds', 30, '{}', 'Settle into distance rhythm early. Try to negative-split the last one: come home faster than you went out.',
 NULL, NULL),

(NULL, 'Distance Builder', 'endurance', 'elite', 'freestyle', 5, 200,
 'css_offset', 6, '{}', 'Aerobic strength set — count strokes each 200 to catch efficiency slipping before your body does. Distance per stroke is everything here.',
 NULL, NULL),

(NULL, 'The Grinder', 'endurance', 'elite', 'freestyle', 5, 400,
 'rest_seconds', 45, '{}', 'Long aerobic reps that require mental discipline. The middle 200 of each 400 is where focus is won — keep the pace honest throughout.',
 NULL, NULL),

(NULL, 'Monument', 'endurance', 'elite', 'freestyle', 10, 400,
 'css_offset', 8, '{}', 'The big aerobic block, reserved for peak training weeks. Break each 400 in half mentally and execute the second half cleanly.',
 NULL, 'aerobic_100s'),

(NULL, 'Continuous Swim', 'endurance', 'beginner', NULL, 1, 400,
 'none', NULL, '{}', 'Time-based endurance for newer swimmers — swim for 15–20 minutes and rest at the wall whenever you need to. Count how many 25s you complete and try to add one next week.',
 NULL, NULL),

(NULL, 'Descending 100s', 'endurance', 'intermediate', 'freestyle', 6, 100,
 'rest_seconds', 20, '{}', 'Each rep slightly faster within each group of three — learn your gears. The first 100 should feel comfortable enough that you can genuinely speed up twice.',
 NULL, NULL),

-- ─── Threshold / CSS ─────────────────────────────────────────────────────────

(NULL, 'CSS Intro', 'threshold', 'intermediate', 'freestyle', 6, 100,
 'css_offset', 4, '{}', 'Just above comfortable aerobic pace — the effort that builds your engine. The send-off time is calculated from your CSS result; trust it.',
 NULL, NULL),

(NULL, 'CSS 100s', 'threshold', 'elite', 'freestyle', 10, 100,
 'css_offset', 2, '{}', 'Classic threshold — hit the same split every rep with zero variation. Metronomic pacing is the whole point.',
 NULL, NULL),

(NULL, 'CSS 200s', 'threshold', 'elite', 'freestyle', 5, 200,
 'css_offset', 3, '{}', 'Threshold endurance — lap splits should barely drift across the rep. The effort is controlled, not easy.',
 NULL, NULL),

(NULL, 'Broken 400', 'threshold', 'elite', 'freestyle', 4, 100,
 'rest_seconds', 10, '{}', 'Race-distance feel with tiny recoveries between each 100. Add up all four split times — that is your broken-400 benchmark.',
 NULL, NULL),

(NULL, 'Threshold 50s', 'threshold', 'intermediate', 'freestyle', 12, 50,
 'css_offset', 2, '{}', 'Short reps at threshold pace — the brevity lets you maintain quality across all twelve. Great for developing feel for CSS without the volume of 100s.',
 NULL, NULL),

-- ─── Sprint / speed ──────────────────────────────────────────────────────────

(NULL, 'First Fast 25s', 'sprint', 'beginner', 'freestyle', 4, 25,
 'rest_seconds', 60, '{}', 'First taste of speed with full recovery — push the first 15m then ease off. Full rest means quality each time.',
 NULL, 'sprint_25s'),

(NULL, 'Speed Play 25s', 'sprint', 'intermediate', NULL, 8, 25,
 'rest_seconds', 30, '{}', 'Alternating smooth and fast 25s teaches your body two gears. The contrast is the lesson — do not let the easy ones become sloppy.',
 NULL, 'sprint_25s'),

(NULL, 'Flat-out 25s', 'sprint', 'elite', NULL, 8, 25,
 'rest_seconds', 60, '{}', 'True sprinting needs true rest — full 60 seconds between each. Eight reps of genuine maximum effort.',
 NULL, 'sprint_25s'),

(NULL, 'Sprint 50s', 'sprint', 'elite', 'freestyle', 6, 50,
 'rest_seconds', 90, '{}', 'Push or dive start; log these split times — PB territory. Ninety seconds of rest is there to protect the quality.',
 NULL, NULL),

(NULL, 'Build 50s', 'sprint', 'intermediate', NULL, 6, 50,
 'rest_seconds', 30, '{}', 'Accelerate within each rep so you finish faster than you started. A rep where you hold even pace is a wasted rep.',
 NULL, NULL),

(NULL, '30×50 Mixer', 'sprint', 'elite', NULL, 30, 50,
 'interval_seconds', 90, ARRAY['kickboard'], 'The Quick/Bowman rotation set — ten cycles of sprint, drill, and kick, each on the same send-off. Kickboard stays on deck between kick reps.',
 NULL, NULL),

-- ─── Kick ────────────────────────────────────────────────────────────────────

(NULL, 'Kickboard Lengths', 'kick', 'beginner', 'freestyle', 4, 25,
 'rest_seconds', 45, ARRAY['kickboard'], 'Small, quick kicks from the hips with the board straight out front. If the board is porpoising, your kicks are too large.',
 NULL, 'kick_core'),

(NULL, 'Kick 50s', 'kick', 'intermediate', 'freestyle', 6, 50,
 'rest_seconds', 30, ARRAY['kickboard'], 'Steady leg conditioning — resist the urge to use your hands for balance. Hold the same effort every rep.',
 NULL, 'kick_core'),

(NULL, 'Kick Ladder', 'kick', 'elite', NULL, 1, 600,
 'rest_seconds', 20, ARRAY['kickboard'], 'Legs create lactate fast — this ladder finds your limits and builds past them. Rest the prescribed time between blocks.',
 '[{"reps":4,"distance":50},{"reps":2,"distance":100},{"reps":1,"distance":200}]'::jsonb, 'kick_core'),

(NULL, 'Streamline Kick', 'kick', 'intermediate', NULL, 8, 25,
 'rest_seconds', 30, '{}', 'On your back in tight streamline — no board, eyes to the ceiling, small kicks. This is harder than it looks; keep your core engaged.',
 NULL, NULL),

(NULL, 'Vertical Kick + Swim', 'kick', 'elite', 'freestyle', 6, 50,
 'rest_seconds', 30, '{}', 'Thirty seconds of eggbeater or scissor kick in deep water, then immediately push into a 50. The legs-to-stroke transition is the work.',
 NULL, NULL),

-- ─── Pull ────────────────────────────────────────────────────────────────────

(NULL, 'First Pull', 'pull', 'beginner', 'freestyle', 4, 50,
 'rest_seconds', 60, ARRAY['pull buoy'], 'Arms-only with the buoy between your legs — finish each stroke past your hips before starting the next. You will feel the difference immediately.',
 NULL, 'pull_core'),

(NULL, 'Pull 100s', 'pull', 'intermediate', 'freestyle', 5, 100,
 'rest_seconds', 25, ARRAY['pull buoy'], 'Upper-body endurance set — count strokes per 100 and try not to let it rise. Long, efficient strokes beat many short ones.',
 NULL, 'pull_core'),

(NULL, 'Pull with Paddles', 'pull', 'elite', 'freestyle', 4, 150,
 'rest_seconds', 30, ARRAY['pull buoy', 'paddles'], 'Strength work through added surface area — keep your elbow high on the catch or the paddles punish you. No dragging.',
 NULL, 'pull_core'),

(NULL, 'Pull/Kick Alternator', 'pull', 'intermediate', 'freestyle', 6, 50,
 'rest_seconds', 45, ARRAY['pull buoy', 'kickboard'], 'Alternating pull and kick reps builds balanced conditioning. Match the effort on both — do not treat kick laps as recovery.',
 NULL, NULL),

-- ─── Technique ───────────────────────────────────────────────────────────────

(NULL, 'Drill + Swim 50s', 'technique', 'beginner', NULL, 6, 50,
 'rest_seconds', 30, '{}', 'Twenty-five metres of drill, then immediately 25m of full stroke — carry the drill feeling into the swim or the second 25 is wasted.',
 NULL, NULL),

(NULL, 'Catch-up 25s', 'technique', 'beginner', 'freestyle', 6, 25,
 'rest_seconds', 30, '{}', 'Catch-up drill: one hand waits at full extension until the other arrives. Slows the stroke and builds extension — feel the long position.',
 NULL, NULL),

(NULL, 'Fist to Fingers', 'technique', 'intermediate', 'freestyle', 8, 50,
 'rest_seconds', 20, '{}', 'Swim with closed fists to kill grip, then open and feel your forearm catch. The open-hand 25 should feel like you are wearing paddles.',
 NULL, NULL),

(NULL, 'Stroke Count Challenge', 'technique', 'intermediate', 'freestyle', 8, 25,
 'rest_seconds', 30, '{}', 'Count strokes every 25 and try to reduce by one rep over rep. Fewer strokes at the same speed means you have improved efficiency.',
 NULL, NULL),

(NULL, '6-3-6 Set', 'technique', 'intermediate', 'freestyle', 6, 50,
 'rest_seconds', 30, '{}', 'Six kicks on your side, three strokes, six kicks on the other — rotation and balance drill. Keep your head still.',
 NULL, NULL),

(NULL, 'Breathing Pattern 200', 'technique', 'elite', 'freestyle', 1, 200,
 'none', NULL, '{}', 'Control the breathing cycle: every six strokes, then five, four, three. This is controlled air management, not oxygen deprivation — back off if dizzy.',
 '[{"reps":1,"distance":50,"note":"breathe every 6 strokes"},{"reps":1,"distance":50,"note":"breathe every 5 strokes"},{"reps":1,"distance":50,"note":"breathe every 4 strokes"},{"reps":1,"distance":50,"note":"breathe every 3 strokes"}]'::jsonb, NULL),

-- ─── Medley ──────────────────────────────────────────────────────────────────

(NULL, 'IM Intro 25s', 'medley', 'intermediate', 'IM', 4, 25,
 'rest_seconds', 45, '{}', 'One lap per stroke in butterfly–backstroke–breaststroke–freestyle order. Butterfly can be a drill — learn the sequence before the turns.',
 NULL, NULL),

(NULL, 'IM 100s', 'medley', 'elite', 'IM', 4, 100,
 'rest_seconds', 30, '{}', 'Transitions between strokes are the skill — attack the turns and get your feet on the wall before you think about the next stroke. Hold form.',
 NULL, NULL),

(NULL, 'IM Ladder', 'medley', 'elite', 'IM', 1, 400,
 'rest_seconds', 30, '{}', '100 to build confidence, 200 to test fitness, 100 to finish strong. Speed the descent.',
 '[{"reps":1,"distance":100,"note":"IM"},{"reps":1,"distance":200,"note":"IM"},{"reps":1,"distance":100,"note":"IM"}]'::jsonb, NULL),

(NULL, 'Stroke Rotation 50s', 'medley', 'intermediate', NULL, 8, 50,
 'rest_seconds', 30, '{}', 'Rotate through all four strokes across the eight reps. No stroke counts as rest — maintain quality on every lap.',
 NULL, NULL),

-- ─── Pyramids & ladders ───────────────────────────────────────────────────────

(NULL, 'Mini Pyramid', 'pyramid', 'beginner', 'freestyle', 1, 100,
 'rest_seconds', 40, '{}', 'First pyramid — rest fully between legs. The ascent and descent teach you that the same distance feels different mid-set.',
 '[{"reps":1,"distance":25},{"reps":1,"distance":50},{"reps":1,"distance":25}]'::jsonb, 'pyramid'),

(NULL, 'Classic Pyramid', 'pyramid', 'intermediate', 'freestyle', 1, 400,
 'rest_seconds', 15, '{}', 'The timeless ladder — build to 100 and come back down. The descending side should be faster than the ascending side.',
 '[{"reps":1,"distance":25},{"reps":1,"distance":50},{"reps":1,"distance":75},{"reps":1,"distance":100},{"reps":1,"distance":75},{"reps":1,"distance":50},{"reps":1,"distance":25}]'::jsonb, 'pyramid'),

(NULL, 'Big Pyramid', 'pyramid', 'elite', 'freestyle', 1, 1600,
 'rest_seconds', 30, '{}', 'Up strong, down stronger. Pace the ascent conservatively so you have something left for the 300 and 200 on the way home.',
 '[{"reps":1,"distance":100},{"reps":1,"distance":200},{"reps":1,"distance":300},{"reps":1,"distance":400},{"reps":1,"distance":300},{"reps":1,"distance":200},{"reps":1,"distance":100}]'::jsonb, 'pyramid'),

(NULL, 'Troy Descender', 'pyramid', 'elite', 'freestyle', 1, 1500,
 'rest_seconds', 30, ARRAY['pull buoy', 'kickboard'], 'Gregg Troy-style descending distance set with rotating modes — swim, pull, kick, drill, build. Each block forces a different kind of effort.',
 '[{"reps":1,"distance":500,"note":"swim"},{"reps":1,"distance":400,"note":"pull"},{"reps":1,"distance":300,"note":"kick"},{"reps":1,"distance":200,"note":"drill"},{"reps":1,"distance":100,"note":"build"}]'::jsonb, NULL),

-- ─── Race pace ───────────────────────────────────────────────────────────────

(NULL, 'Race Pace 25s', 'race_pace', 'intermediate', NULL, 8, 25,
 'interval_seconds', 60, '{}', 'Hit exact goal race splits — not faster. Rushing the 25s is easy; nailing the exact pace you need is the skill.',
 NULL, NULL),

(NULL, 'Race Pace 50s', 'race_pace', 'elite', NULL, 8, 50,
 'rest_seconds', 60, '{}', 'Back-half training for the 100 — the pace that feels comfortable at the 50m turn must feel controlled here. Log every split.',
 NULL, NULL),

(NULL, 'Broken 100', 'race_pace', 'elite', NULL, 4, 25,
 'rest_seconds', 10, '{}', 'Race simulation with micro-rests — add up your four 25 splits. If the total is close to your 100 PB, you are race ready.',
 NULL, NULL),

(NULL, 'Goal Pace 100s', 'race_pace', 'elite', 'freestyle', 5, 100,
 'rest_seconds', 45, '{}', 'Lock in even pacing for your target 400 race pace. No breathing every two on these — three minimum.',
 NULL, NULL),

-- ─── Recovery ────────────────────────────────────────────────────────────────

(NULL, 'Easy 200', 'recovery', 'beginner', NULL, 1, 200,
 'none', NULL, '{}', 'Flush the arms after a hard set — effort four out of ten, any stroke that unloads what you just trained. Not training; recovery.',
 NULL, NULL),

(NULL, 'Recovery 50s', 'recovery', 'intermediate', NULL, 6, 50,
 'rest_seconds', 20, '{}', 'Recovery is a skill — swim pretty, not fast. Perfect technique at low effort is a training stimulus in itself.',
 NULL, NULL),

-- ─── Cool-downs ──────────────────────────────────────────────────────────────

(NULL, 'Gentle Finish', 'cooldown', 'beginner', NULL, 2, 25,
 'none', NULL, '{}', 'Leave the pool feeling like you won. Two easy lengths to let the session settle.',
 NULL, NULL),

(NULL, 'Standard Cool-down', 'cooldown', 'intermediate', NULL, 1, 200,
 'none', NULL, '{}', 'Gradually lower the heart rate with long exhales on every stroke. Mix strokes if you want — just keep it easy.',
 NULL, NULL),

(NULL, 'Full Cool-down', 'cooldown', 'elite', NULL, 1, 400,
 'rest_seconds', 15, '{}', 'Shoulders unwind on your back. The backstroke 50s are not rest — they are active recovery.',
 '[{"reps":1,"distance":200,"note":"easy, any stroke"},{"reps":4,"distance":50,"note":"backstroke easy"}]'::jsonb, NULL),

-- ─── Test sets ───────────────────────────────────────────────────────────────

(NULL, 'CSS Test', 'test', 'intermediate', 'freestyle', 1, 600,
 'none', NULL, '{}', 'Swim an all-out 400m, take 5–10 minutes of easy active recovery, then swim an all-out 200m. Enter both times in the CSS calculator — this session is your training.',
 '[{"reps":1,"distance":400,"note":"time trial — record your time"},{"reps":1,"distance":200,"note":"time trial after 5–10 min active recovery"}]'::jsonb, NULL),

(NULL, '7×200 Step Test', 'test', 'elite', 'freestyle', 7, 200,
 'rest_seconds', 45, '{}', 'Classic step test — log every split across all seven. A smooth step curve shows you are fit; a cliff shows where aerobic capacity ends.',
 NULL, NULL),

(NULL, 'Timed 30-minute Swim', 'test', 'intermediate', 'freestyle', 1, 1500,
 'none', NULL, '{}', 'Swim continuously for exactly 30 minutes and count your total distance. Record it — repeat monthly to measure fitness improvement.',
 NULL, NULL),

(NULL, '100 Time Trial', 'test', 'intermediate', NULL, 1, 100,
 'none', NULL, '{}', 'All-out from a push start — no pacing, no saving. Log it. This is your benchmark.',
 NULL, NULL),

-- ─── Level-gap fillers (#66–75) ───────────────────────────────────────────────

(NULL, 'CSS Starter', 'threshold', 'beginner', 'freestyle', 4, 50,
 'css_offset', 6, '{}', 'First dip into threshold pace — slightly faster than your usual aerobic effort, but still very controlled. Count your strokes and aim not to let the number rise.',
 NULL, NULL),

(NULL, 'Aerobic 100s Entry', 'endurance', 'beginner', 'freestyle', 4, 100,
 'rest_seconds', 60, '{}', 'Your first 100m reps — slow is absolutely fine. The goal is to keep going without stopping; speed comes later.',
 NULL, 'aerobic_100s'),

(NULL, 'IM Starter', 'medley', 'beginner', 'IM', 4, 25,
 'rest_seconds', 60, '{}', 'One lap of each stroke in butterfly–backstroke–breaststroke–freestyle order. Fly can be a drill — learn the sequence before worrying about the turns.',
 NULL, NULL),

(NULL, 'First Race Pace', 'race_pace', 'beginner', 'freestyle', 4, 25,
 'interval_seconds', 60, '{}', 'Find what fast feels like with full recovery between each rep. Do not pace it — push, then recover fully.',
 NULL, NULL),

(NULL, 'Recovery 100s', 'recovery', 'elite', NULL, 4, 100,
 'none', NULL, '{}', 'Post-hard-session flush using whatever stroke unloads your tired muscles most. Effort below five out of ten — this is recovery, not base training.',
 NULL, NULL),

(NULL, 'Reverse Pyramid', 'pyramid', 'elite', 'freestyle', 1, 1000,
 'rest_seconds', 30, '{}', 'Descending distances reward honest pacing on the long reps — no saving energy for the 100 at the end. Come home fast.',
 '[{"reps":1,"distance":400},{"reps":1,"distance":300},{"reps":1,"distance":200},{"reps":1,"distance":100}]'::jsonb, 'pyramid'),

(NULL, 'Pull Threshold', 'pull', 'intermediate', 'freestyle', 6, 100,
 'css_offset', 4, ARRAY['pull buoy'], 'Arms-only threshold set — removes kick fatigue so you can focus on holding send-off pace with the upper body. Count strokes to track efficiency.',
 NULL, 'pull_core'),

(NULL, 'Extended Kick', 'kick', 'elite', 'freestyle', 4, 100,
 'rest_seconds', 30, ARRAY['kickboard'], 'Race-length kick conditioning — your second half depends on legs that still work at the 300m mark. Hold an even tempo.',
 NULL, 'kick_core'),

(NULL, 'Backstroke Basics', 'technique', 'beginner', 'backstroke', 4, 25,
 'rest_seconds', 30, '{}', 'Pinky-first entry, tall hips, and small quick kicks. Backstroke efficiency comes from core stability, not arm power.',
 NULL, NULL),

(NULL, 'Rotation Drill Set', 'technique', 'elite', NULL, 1, 400,
 'rest_seconds', 20, '{}', 'Four drill 50s to build the movement pattern, then four swim 50s to use it. If the swim 50s do not feel different, go back to the drill.',
 '[{"reps":4,"distance":50,"note":"rotation drill"},{"reps":4,"distance":50,"note":"swim — carry the rotation"}]'::jsonb, NULL);
