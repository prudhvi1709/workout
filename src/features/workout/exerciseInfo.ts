// Short, honest "why this helps" lines shown under each exercise in the logger.
// This is content, not data, so it lives in the bundle (no schema change).
// Lookup is exact, then falls back to the name with any "(...)" suffix stripped
// so "Leg Press (high foot)" reuses the "Leg Press" entry if no exact match.

const INFO: Record<string, string> = {
  // Session bookends
  "Warm-up":
    "A few minutes of dynamic warm-up drills plus ramp-up sets on the first lift - raises temperature and primes the joints so the heavy working sets feel smoother. Keep it light, not tiring.",
  "Incline Walk":
    "Steady Zone-2 incline walking at a conversational pace - burns fat with near-zero recovery cost, so it adds to the deficit without taxing your legs or your heavy sets. Done post-workout it keeps you fresh for the lifting.",
  "Cool-down + stretch":
    "A few minutes of easy stretching to release tension and start recovery - then take your post-workout body weight.",
  // Prudhvi - upper
  "Barbell Bench Press":
    "Free-bar pressing rebuilds your chest, shoulders and triceps and your old pressing strength - the stabilizer demand carries straight over to real strength.",
  "Seated Shoulder Press":
    "Builds the front and side delts that widen the upper body; seated keeps the load off your lower back.",
  "Incline Dumbbell Press":
    "Hits the upper chest, which fills out the shape as you lean out.",
  "Lateral Raise":
    "Isolates the side delts - the main driver of shoulder width and a tapered look.",
  "Triceps Pushdown":
    "Direct triceps work; the triceps are most of your arm's size.",
  "Face Pull":
    "Strengthens rear delts and upper back to balance all the pressing and keep the shoulders healthy.",
  "Lat Pulldown":
    "Builds the lats for back width and the V-taper.",
  "Chest-Supported Row":
    "Rows the mid-back with your chest supported, so there's zero load on the lower back.",
  "Machine Chest Press":
    "A second chest exposure you can safely push close to failure on your own.",
  "Rear Delt Cable Lateral":
    "Hits the rear delts for rounded shoulders and better posture.",
  "Hammer Curl":
    "Builds the biceps and forearms for thicker arms.",
  // Prudhvi - conditioning + arms
  "EZ-Bar Curl":
    "Direct biceps work; the angled bar sits easier on the wrists than a straight bar. Keeps the arms full as you lean out.",
  "Overhead Triceps Extension":
    "Loads the long head of the triceps in a stretch - the part that adds size to the back of the arm.",
  "Hanging Knee Raise":
    "Trains the lower abs while a dead hang decompresses the spine - core work that's friendly to a sitting-aggravated back.",
  // Prudhvi - legs / back-sparing
  "Leg Press":
    "Builds quads and glutes with your back fully supported - no spinal load.",
  "Cable Pull-through":
    "Trains glutes and hamstrings through hip extension with almost no spinal compression - a back-friendly hinge.",
  "Leg Curl":
    "Isolates the hamstrings with zero load on the spine.",
  "Back Extension":
    "Builds lower-back and glute endurance in a controlled range - this tends to help a sitting-aggravated back, not aggravate it.",
  "Glute Back Extension":
    "Back extension biased toward the glutes - hip strength with the spine spared.",
  "Bulgarian Split Squat":
    "One leg at a time builds quads and glutes with light load and no bar on your back.",
  "Calf Raise": "Direct calf work; calves respond best to higher reps.",
  // Prudhvi - recovery
  "McGill Big 3":
    "Curl-up, side plank, bird-dog - builds the core endurance that braces and protects your lower back.",
  "Hip + Thoracic Mobility":
    "Loosens the hips and mid-back that stiffen from sitting and cycling, easing back tension.",
  "Easy Walk":
    "Light movement for recovery and a small calorie burn without taxing your legs.",
  // Srikari - beginner full body
  "Goblet Squat":
    "Holding the weight in front keeps you upright and grooves a clean squat - legs and glutes, safely.",
  "Chest Press Machine":
    "A guided press to build the chest and learn the pattern without balancing free weights.",
  "Seated Row":
    "Builds the mid-back and improves posture; supported, so it's beginner-friendly.",
  "Glute Bridge":
    "Wakes up and strengthens the glutes - the foundation for squats and hip strength.",
  "Plank": "Builds the core stability that protects your spine in every other lift.",
  "Dumbbell Shoulder Press":
    "Builds the shoulders and teaches overhead control with light dumbbells.",
  "Dumbbell Lunge": "Single-leg work for legs, glutes and balance.",
  "Farmer Carry":
    "Carrying loads builds grip, core and full-body stability - simple and effective.",
  "Core Circuit": "A few core moves for the stability that supports your lifts.",
  "Cycling or Walk":
    "Easy cardio that adds to the calorie deficit without heavy fatigue.",
  "Repeat Full Body A or B":
    "Extra practice on the session you want to improve - frequency drives a beginner's progress.",
};

export function exerciseWhy(name: string): string | null {
  if (INFO[name]) return INFO[name];
  const base = name.replace(/\s*\([^)]*\)\s*$/, "").trim();
  return INFO[base] ?? null;
}
