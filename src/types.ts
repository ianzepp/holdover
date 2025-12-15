// Unit systems
export type AngleUnit = 'mil' | 'moa'
export type DistanceUnit = 'yards' | 'meters'
export type DragModel = 'G1' | 'G7'

// Rifle configuration
export interface RifleProfile {
  name: string
  caliber: string
  bulletWeightGrains: number
  bulletBC: number
  dragModel: DragModel
  muzzleVelocityFPS: number
  zeroDistanceYards: number
  barrelTwistInches: number
  twistDirection: 'right' | 'left'
}

// Scope configuration
export interface ScopeProfile {
  name: string
  angleUnit: AngleUnit
  reticleId: string
  magnificationMin: number
  magnificationMax: number
  focalPlane: 'ffp' | 'sfp'
}

// Environmental conditions
export interface Environment {
  altitudeFeet: number
  temperatureF: number
  pressureInHg: number
  humidityPercent: number
}

// Wind at a specific distance
export interface WindVector {
  distanceYards: number
  speedMPH: number
  directionClock: number // 1-12 clock position, 12 = headwind, 3 = full right
}

// Target definition
export interface Target {
  type: string
  widthInches: number
  heightInches: number
  distanceYards: number
}

// Scenario for a training drill
export interface Scenario {
  target: Target
  angleOfFireDegrees: number // positive = uphill, negative = downhill
  winds: WindVector[]
  environment: Environment
  distanceKnown: boolean
}

// Ballistic solution at a given distance
export interface BallisticSolution {
  distanceYards: number
  dropInches: number
  dropMils: number
  dropMOA: number
  timeOfFlightSeconds: number
  windDriftInches: number
  windDriftMils: number
  windDriftMOA: number
  velocityFPS: number
  energyFtLbs: number
}

// User's hold input
export interface HoldInput {
  elevationValue: number
  elevationUnit: AngleUnit
  windageValue: number
  windageUnit: AngleUnit
}

// Result of a shot
export interface ShotResult {
  holdInput: HoldInput
  trueSolution: BallisticSolution
  impactOffsetXInches: number // positive = right
  impactOffsetYInches: number // positive = high
  rangeEstimateYards?: number
  rangeActualYards: number
}
