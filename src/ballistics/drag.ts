import type { DragModel } from '../types'

interface TrajectoryPoint {
  dropInches: number
  timeOfFlightSeconds: number
  velocityFPS: number
  energyFtLbs: number
}

// G1 drag coefficient table (velocity in fps, drag coefficient)
// Simplified table - real implementations use more points
const G1_TABLE: [number, number][] = [
  [4500, 0.230],
  [4000, 0.229],
  [3500, 0.230],
  [3000, 0.238],
  [2500, 0.256],
  [2000, 0.310],
  [1800, 0.348],
  [1600, 0.415],
  [1400, 0.485],
  [1200, 0.520],
  [1000, 0.500],
  [800, 0.460],
  [600, 0.420],
]

// G7 drag coefficient table (better for modern boat-tail bullets)
const G7_TABLE: [number, number][] = [
  [4500, 0.120],
  [4000, 0.119],
  [3500, 0.118],
  [3000, 0.120],
  [2500, 0.126],
  [2000, 0.145],
  [1800, 0.158],
  [1600, 0.175],
  [1400, 0.195],
  [1200, 0.215],
  [1000, 0.225],
  [800, 0.220],
  [600, 0.210],
]

// Interpolate drag coefficient from table
function getDragCoefficient(
  velocity: number,
  model: DragModel
): number {
  const table = model === 'G1' ? G1_TABLE : G7_TABLE

  // Find bracketing velocities
  for (let i = 0; i < table.length - 1; i++) {
    const [v1, cd1] = table[i]
    const [v2, cd2] = table[i + 1]

    if (velocity >= v2 && velocity <= v1) {
      // Linear interpolation
      const t = (velocity - v2) / (v1 - v2)
      return cd2 + t * (cd1 - cd2)
    }
  }

  // Extrapolate if outside table
  if (velocity > table[0][0]) {
    return table[0][1]
  }
  return table[table.length - 1][1]
}

// Calculate trajectory using point-mass model
export function calculateDrag(
  muzzleVelocityFPS: number,
  bc: number,
  model: DragModel,
  bulletWeightGrains: number,
  rangeYards: number,
  densityRatio: number = 1.0
): TrajectoryPoint {
  // Constants
  const GRAVITY = 32.174 // ft/s^2
  const AIR_DENSITY = 0.0751 // lb/ft^3 at standard conditions
  const STEP_SIZE = 0.5 // yards per step

  // Convert bullet weight to pounds
  const bulletMassLbs = bulletWeightGrains / 7000

  // Initial conditions
  let x = 0 // horizontal distance in feet
  let y = 0 // vertical position in feet (starts at 0, goes negative for drop)
  let vx = muzzleVelocityFPS // horizontal velocity
  let vy = 0 // vertical velocity (starts at 0, scope handles angle)
  let time = 0

  const rangeInFeet = rangeYards * 3
  const stepFeet = STEP_SIZE * 3

  while (x < rangeInFeet) {
    const velocity = Math.sqrt(vx * vx + vy * vy)

    // Get drag coefficient for current velocity
    const cd = getDragCoefficient(velocity, model)

    // Retardation (deceleration due to drag)
    // Adjusted for BC and air density
    const retardation = (cd / bc) * densityRatio * (velocity * velocity) / 100000

    // Time step based on current velocity
    const dt = stepFeet / vx

    // Update velocities
    const dragX = retardation * (vx / velocity)
    const dragY = retardation * (vy / velocity)

    vx -= dragX * dt
    vy -= GRAVITY * dt + (vy !== 0 ? dragY * dt : 0)

    // Update positions
    x += vx * dt
    y += vy * dt
    time += dt

    // Prevent infinite loops
    if (vx < 100) break
  }

  // Convert drop from feet to inches
  const dropInches = y * 12

  // Calculate energy
  const velocityFPS = Math.sqrt(vx * vx + vy * vy)
  const energyFtLbs = (bulletMassLbs * velocityFPS * velocityFPS) / (2 * GRAVITY)

  return {
    dropInches,
    timeOfFlightSeconds: time,
    velocityFPS,
    energyFtLbs,
  }
}
