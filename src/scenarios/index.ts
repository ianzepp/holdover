import type { Scenario, Target, WindVector, Environment } from '../types'

// Predefined target types with standard sizes
export const TARGET_TYPES: Record<string, Omit<Target, 'distanceYards'>> = {
  'ipsc-full': {
    type: 'IPSC Full',
    widthInches: 18,
    heightInches: 30,
  },
  'ipsc-half': {
    type: 'IPSC Half',
    widthInches: 9,
    heightInches: 15,
  },
  'ipsc-head': {
    type: 'IPSC Head',
    widthInches: 6,
    heightInches: 8,
  },
  'human-silhouette': {
    type: 'Human Silhouette',
    widthInches: 18,
    heightInches: 40,
  },
  'deer': {
    type: 'Deer (Vitals)',
    widthInches: 16,
    heightInches: 16,
  },
  'bear': {
    type: 'Bear (Vitals)',
    widthInches: 20,
    heightInches: 24,
  },
  'vehicle-tire': {
    type: 'Vehicle Tire',
    widthInches: 26,
    heightInches: 26,
  },
  'steel-8inch': {
    type: '8" Steel',
    widthInches: 8,
    heightInches: 8,
  },
  'steel-12inch': {
    type: '12" Steel',
    widthInches: 12,
    heightInches: 12,
  },
}

// Default environment (typical range day)
export const DEFAULT_ENVIRONMENT: Environment = {
  altitudeFeet: 1000,
  temperatureF: 70,
  pressureInHg: 29.92,
  humidityPercent: 50,
}

// Random number in range
function random(min: number, max: number): number {
  return Math.random() * (max - min) + min
}

// Random integer in range (inclusive)
function randomInt(min: number, max: number): number {
  return Math.floor(random(min, max + 1))
}

// Pick random element from array
function pick<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)]
}

// Generate wind at a specific distance
function generateWind(distanceYards: number, baseSpeed: number, variance: number): WindVector {
  return {
    distanceYards,
    speedMPH: Math.max(0, baseSpeed + random(-variance, variance)),
    directionClock: randomInt(1, 12),
  }
}

// Generate a random scenario
export function generateScenario(options?: {
  minDistance?: number
  maxDistance?: number
  distanceKnown?: boolean
  maxWindSpeed?: number
  allowAngles?: boolean
}): Scenario {
  const {
    minDistance = 200,
    maxDistance = 1000,
    distanceKnown = false,
    maxWindSpeed = 15,
    allowAngles = true,
  } = options ?? {}

  // Pick a target type
  const targetType = pick(Object.keys(TARGET_TYPES))
  const targetDef = TARGET_TYPES[targetType]

  // Generate distance (round to nearest 25 yards for realism)
  const rawDistance = random(minDistance, maxDistance)
  const distance = Math.round(rawDistance / 25) * 25

  // Generate wind conditions at multiple points
  const baseWindSpeed = random(0, maxWindSpeed)
  const windVariance = baseWindSpeed * 0.3 // 30% variance between points

  const winds: WindVector[] = [
    generateWind(0, baseWindSpeed, windVariance), // At shooter
    generateWind(distance * 0.5, baseWindSpeed, windVariance), // Mid-range
    generateWind(distance * 0.8, baseWindSpeed, windVariance), // Near target
  ]

  // Generate angle if allowed
  let angle = 0
  if (allowAngles && Math.random() > 0.6) {
    // 40% chance of angled shot
    angle = random(-25, 25)
    angle = Math.round(angle) // Round to whole degrees
  }

  return {
    target: {
      ...targetDef,
      distanceYards: distance,
    },
    angleOfFireDegrees: angle,
    winds,
    environment: DEFAULT_ENVIRONMENT,
    distanceKnown,
  }
}

// Generate a ranging practice scenario (distance always unknown)
export function generateRangingScenario(): Scenario {
  return generateScenario({
    minDistance: 300,
    maxDistance: 800,
    distanceKnown: false,
    maxWindSpeed: 5, // Low wind to focus on ranging
    allowAngles: false,
  })
}

// Generate a wind calling scenario (distance always known)
export function generateWindScenario(): Scenario {
  return generateScenario({
    minDistance: 400,
    maxDistance: 600,
    distanceKnown: true,
    maxWindSpeed: 20,
    allowAngles: false,
  })
}

// Format wind for display
export function formatWind(wind: WindVector): string {
  const direction = wind.directionClock === 12 ? '12' : wind.directionClock.toString()
  return `${wind.speedMPH.toFixed(0)} mph @ ${direction} o'clock`
}

// Format distance for display
export function formatDistance(yards: number, known: boolean): string {
  if (known) {
    return `${yards} yards`
  }
  return 'Unknown'
}
