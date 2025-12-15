import type {
  RifleProfile,
  Environment,
  WindVector,
  BallisticSolution,
  AngleUnit,
} from '../types'
import { calculateDrag } from './drag'

// Convert mils to MOA
export function milsToMOA(mils: number): number {
  return mils * 3.438
}

// Convert MOA to mils
export function moaToMils(moa: number): number {
  return moa / 3.438
}

// Convert angle value to inches at distance
export function angleToInches(
  value: number,
  unit: AngleUnit,
  distanceYards: number
): number {
  const distanceInches = distanceYards * 36
  if (unit === 'mil') {
    // 1 mil = 1/1000 of distance
    return (value * distanceInches) / 1000
  }
  else {
    // 1 MOA = 1.047" per 100 yards
    return value * 1.047 * (distanceYards / 100)
  }
}

// Convert inches to angle at distance
export function inchesToAngle(
  inches: number,
  unit: AngleUnit,
  distanceYards: number
): number {
  const distanceInches = distanceYards * 36
  if (unit === 'mil') {
    return (inches * 1000) / distanceInches
  }
  else {
    return inches / (1.047 * (distanceYards / 100))
  }
}

// Calculate crosswind component from clock direction
// 12 o'clock = headwind (0), 3 o'clock = full right crosswind (1)
export function crosswindComponent(clockDirection: number): number {
  // Convert clock to radians (12 = 0, 3 = 90, 6 = 180, 9 = 270)
  const degrees = ((clockDirection - 12) * 30) % 360
  const radians = (degrees * Math.PI) / 180
  return Math.sin(radians)
}

// Calculate air density ratio for altitude/temp/pressure adjustments
export function airDensityRatio(environment: Environment): number {
  // Standard conditions: 59F, 29.92 inHg, sea level, 78% humidity
  const standardTempR = 518.67 // 59F in Rankine
  const standardPressure = 29.92

  const actualTempR = environment.temperatureF + 459.67
  const pressureRatio = environment.pressureInHg / standardPressure
  const tempRatio = standardTempR / actualTempR

  // Simplified - doesn't fully account for humidity or altitude
  // but close enough for training purposes
  return pressureRatio * tempRatio
}

// Calculate true ballistic range with angle compensation
export function trueBallisticRange(
  lineOfSightYards: number,
  angleDegrees: number
): number {
  const angleRadians = (Math.abs(angleDegrees) * Math.PI) / 180
  return lineOfSightYards * Math.cos(angleRadians)
}

// Main ballistic solver
export function solve(
  rifle: RifleProfile,
  distanceYards: number,
  angleDegrees: number,
  winds: WindVector[],
  environment: Environment
): BallisticSolution {
  const trueRange = trueBallisticRange(distanceYards, angleDegrees)
  const densityRatio = airDensityRatio(environment)

  // Calculate trajectory using drag model
  const trajectory = calculateDrag(
    rifle.muzzleVelocityFPS,
    rifle.bulletBC,
    rifle.dragModel,
    rifle.bulletWeightGrains,
    trueRange,
    densityRatio
  )

  // Adjust drop for zero
  const zeroTrajectory = calculateDrag(
    rifle.muzzleVelocityFPS,
    rifle.bulletBC,
    rifle.dragModel,
    rifle.bulletWeightGrains,
    rifle.zeroDistanceYards,
    densityRatio
  )

  // Calculate sight height adjustment for zero
  // Simplified: assumes flat trajectory at zero distance
  const sightAngle = Math.atan2(zeroTrajectory.dropInches, rifle.zeroDistanceYards * 36)
  const adjustedDrop = trajectory.dropInches - (Math.tan(sightAngle) * trueRange * 36)

  // Calculate wind drift
  // Use weighted average of wind vectors based on time of flight
  let totalCrosswind = 0
  for (const wind of winds) {
    const crosswind = wind.speedMPH * crosswindComponent(wind.directionClock)
    // Weight by position (winds closer to shooter have more effect)
    const weight = 1 - (wind.distanceYards / distanceYards) * 0.5
    totalCrosswind += crosswind * weight
  }
  const avgCrosswind = winds.length > 0 ? totalCrosswind / winds.length : 0

  // Wind drift approximation: drift = crosswind * TOF * constant
  // Constant varies by bullet but ~0.5 is reasonable for training
  const windDriftInches = avgCrosswind * trajectory.timeOfFlightSeconds * 12 * 0.5

  return {
    distanceYards,
    dropInches: adjustedDrop,
    dropMils: inchesToAngle(adjustedDrop, 'mil', distanceYards),
    dropMOA: inchesToAngle(adjustedDrop, 'moa', distanceYards),
    timeOfFlightSeconds: trajectory.timeOfFlightSeconds,
    windDriftInches,
    windDriftMils: inchesToAngle(windDriftInches, 'mil', distanceYards),
    windDriftMOA: inchesToAngle(windDriftInches, 'moa', distanceYards),
    velocityFPS: trajectory.velocityFPS,
    energyFtLbs: trajectory.energyFtLbs,
  }
}
