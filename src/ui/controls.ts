import type { RifleProfile, ScopeProfile, HoldInput } from '../types'

// Default rifle profiles
export const DEFAULT_RIFLES: RifleProfile[] = [
  {
    name: '6.5 Creedmoor (140gr)',
    caliber: '6.5 Creedmoor',
    bulletWeightGrains: 140,
    bulletBC: 0.610, // G7
    dragModel: 'G7',
    muzzleVelocityFPS: 2750,
    zeroDistanceYards: 100,
    barrelTwistInches: 8,
    twistDirection: 'right',
  },
  {
    name: '.308 Win (175gr)',
    caliber: '.308 Winchester',
    bulletWeightGrains: 175,
    bulletBC: 0.505, // G7
    dragModel: 'G7',
    muzzleVelocityFPS: 2600,
    zeroDistanceYards: 100,
    barrelTwistInches: 10,
    twistDirection: 'right',
  },
  {
    name: '6mm Creedmoor (105gr)',
    caliber: '6mm Creedmoor',
    bulletWeightGrains: 105,
    bulletBC: 0.540, // G7
    dragModel: 'G7',
    muzzleVelocityFPS: 3000,
    zeroDistanceYards: 100,
    barrelTwistInches: 7.5,
    twistDirection: 'right',
  },
  {
    name: '.300 Win Mag (190gr)',
    caliber: '.300 Win Mag',
    bulletWeightGrains: 190,
    bulletBC: 0.640, // G7
    dragModel: 'G7',
    muzzleVelocityFPS: 2900,
    zeroDistanceYards: 100,
    barrelTwistInches: 10,
    twistDirection: 'right',
  },
]

// Default scope profiles
export const DEFAULT_SCOPES: ScopeProfile[] = [
  {
    name: 'Generic MIL FFP',
    angleUnit: 'mil',
    reticleId: 'mil-dot',
    magnificationMin: 4,
    magnificationMax: 24,
    focalPlane: 'ffp',
  },
  {
    name: 'Horus H59',
    angleUnit: 'mil',
    reticleId: 'horus-h59',
    magnificationMin: 5,
    magnificationMax: 25,
    focalPlane: 'ffp',
  },
  {
    name: 'Tremor3',
    angleUnit: 'mil',
    reticleId: 'tremor3',
    magnificationMin: 5,
    magnificationMax: 25,
    focalPlane: 'ffp',
  },
  {
    name: 'Generic MOA FFP',
    angleUnit: 'moa',
    reticleId: 'moa-crosshair',
    magnificationMin: 4,
    magnificationMax: 16,
    focalPlane: 'ffp',
  },
]

export interface ControlState {
  selectedRifle: RifleProfile
  selectedScope: ScopeProfile
  magnification: number
  holdInput: HoldInput
}

export function initControls(): ControlState {
  return {
    selectedRifle: DEFAULT_RIFLES[0],
    selectedScope: DEFAULT_SCOPES[0],
    magnification: 10,
    holdInput: {
      elevationValue: 0,
      elevationUnit: 'mil',
      windageValue: 0,
      windageUnit: 'mil',
    },
  }
}

export function populateRifleSelect(elementId: string): void {
  const select = document.getElementById(elementId) as HTMLSelectElement
  if (!select) return

  select.innerHTML = ''
  for (const rifle of DEFAULT_RIFLES) {
    const option = document.createElement('option')
    option.value = rifle.name
    option.textContent = rifle.name
    select.appendChild(option)
  }
}

export function populateScopeSelect(elementId: string): void {
  const select = document.getElementById(elementId) as HTMLSelectElement
  if (!select) return

  select.innerHTML = ''
  for (const scope of DEFAULT_SCOPES) {
    const option = document.createElement('option')
    option.value = scope.name
    option.textContent = scope.name
    select.appendChild(option)
  }
}

export function getRifleByName(name: string): RifleProfile | undefined {
  return DEFAULT_RIFLES.find((r) => r.name === name)
}

export function getScopeByName(name: string): ScopeProfile | undefined {
  return DEFAULT_SCOPES.find((s) => s.name === name)
}

export function readHoldInput(): HoldInput {
  const elevation = document.getElementById('elevation') as HTMLInputElement
  const windage = document.getElementById('windage') as HTMLInputElement

  return {
    elevationValue: parseFloat(elevation?.value ?? '0') || 0,
    elevationUnit: 'mil', // TODO: Read from scope
    windageValue: parseFloat(windage?.value ?? '0') || 0,
    windageUnit: 'mil',
  }
}

export function resetHoldInput(): void {
  const elevation = document.getElementById('elevation') as HTMLInputElement
  const windage = document.getElementById('windage') as HTMLInputElement

  if (elevation) elevation.value = '0'
  if (windage) windage.value = '0'
}

export function showResult(visible: boolean): void {
  const footer = document.getElementById('result-footer')
  if (footer) {
    footer.classList.toggle('hidden', !visible)
  }
}

export function updateResultDetails(html: string): void {
  const details = document.getElementById('result-details')
  if (details) {
    details.innerHTML = html
  }
}

export function updateScenarioInfo(
  target: string,
  distance: string,
  angle: string,
  winds: string[]
): void {
  const targetInfo = document.getElementById('target-info')
  const windInfo = document.getElementById('overlay-wind')
  const angleInfo = document.getElementById('angle-info')

  if (targetInfo) {
    targetInfo.textContent = target
  }
  if (windInfo) {
    windInfo.innerHTML = winds.join('<br>')
  }
  if (angleInfo) {
    angleInfo.textContent = angle || ''
  }
}
