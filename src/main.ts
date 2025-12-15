import { solve, angleToInches, inchesToAngle } from './ballistics'
import { getReticle } from './reticles'
import { generateScenario, formatWind, formatDistance } from './scenarios'
import type { Scenario, ShotResult } from './types'
import {
  initCanvas,
  resizeCanvas,
  setMagnification,
  setReticle,
  render,
  type CanvasState,
} from './ui/canvas'
import {
  initControls,
  populateRifleSelect,
  populateScopeSelect,
  getRifleByName,
  getScopeByName,
  readHoldInput,
  resetHoldInput,
  updateScenarioInfo,
  type ControlState,
} from './ui/controls'

// Application state
let canvasState: CanvasState | null = null
let controlState: ControlState
let currentScenario: Scenario | null = null
let lastResult: ShotResult | null = null

function init(): void {
  // Initialize canvas
  canvasState = initCanvas('reticle-canvas')
  if (!canvasState) {
    console.error('Failed to initialize canvas')
    return
  }

  // Initialize controls
  controlState = initControls()
  populateRifleSelect('rifle-select')
  populateScopeSelect('scope-select')

  // Set initial reticle
  const reticle = getReticle(controlState.selectedScope.reticleId)
  if (reticle) {
    setReticle(canvasState, reticle)
  }

  // Bind event listeners
  bindEvents()

  // Generate first scenario
  newScenario()
}

function bindEvents(): void {
  // Rifle selection
  const rifleSelect = document.getElementById('rifle-select') as HTMLSelectElement
  rifleSelect?.addEventListener('change', () => {
    const rifle = getRifleByName(rifleSelect.value)
    if (rifle) {
      controlState.selectedRifle = rifle
    }
  })

  // Scope selection
  const scopeSelect = document.getElementById('scope-select') as HTMLSelectElement
  scopeSelect?.addEventListener('change', () => {
    const scope = getScopeByName(scopeSelect.value)
    if (scope && canvasState) {
      controlState.selectedScope = scope
      const reticle = getReticle(scope.reticleId)
      if (reticle) {
        setReticle(canvasState, reticle)
        renderCurrentState()
      }
    }
  })

  // Magnification slider
  const magSlider = document.getElementById('magnification') as HTMLInputElement
  const magValue = document.getElementById('mag-value')
  magSlider?.addEventListener('input', () => {
    const mag = parseFloat(magSlider.value)
    controlState.magnification = mag
    if (magValue) {
      magValue.textContent = `${mag}x`
    }
    if (canvasState) {
      setMagnification(canvasState, mag)
      renderCurrentState()
    }
  })

  // Known distance toggle
  const knownDistanceToggle = document.getElementById('known-distance') as HTMLInputElement
  knownDistanceToggle?.addEventListener('change', () => {
    if (currentScenario) {
      currentScenario.distanceKnown = knownDistanceToggle.checked
      updateDistanceOverlay()
    }
  })

  // Keyboard shortcuts with custom repeat for WASD
  const heldKeys = new Set<string>()
  let repeatTimeout: number | null = null
  let repeatInterval: number | null = null
  const REPEAT_DELAY = 200 // Delay before repeat starts
  const REPEAT_RATE = 33 // ~30fps once repeating

  function processHeldKeys(shiftHeld: boolean): void {
    const increment = shiftHeld ? 1.0 : 0.1

    if (heldKeys.has('w')) adjustHold('elevation', increment)
    if (heldKeys.has('s')) adjustHold('elevation', -increment)
    if (heldKeys.has('a')) adjustHold('windage', -increment)
    if (heldKeys.has('d')) adjustHold('windage', increment)
  }

  function startRepeat(shiftHeld: boolean): void {
    if (repeatTimeout || repeatInterval) return
    // Delay before repeat kicks in
    repeatTimeout = window.setTimeout(() => {
      repeatTimeout = null
      repeatInterval = window.setInterval(() => processHeldKeys(shiftHeld), REPEAT_RATE)
    }, REPEAT_DELAY)
  }

  function stopRepeat(): void {
    if (repeatTimeout) {
      clearTimeout(repeatTimeout)
      repeatTimeout = null
    }
    if (repeatInterval) {
      clearInterval(repeatInterval)
      repeatInterval = null
    }
  }

  document.addEventListener('keydown', (e) => {
    // Don't capture if user is typing in an input field
    if (e.target instanceof HTMLInputElement) return

    const key = e.key.toLowerCase()

    if (['w', 'a', 's', 'd'].includes(key)) {
      e.preventDefault()
      if (!heldKeys.has(key)) {
        heldKeys.add(key)
        // Immediate response on first press
        const increment = e.shiftKey ? 1.0 : 0.1
        if (key === 'w') adjustHold('elevation', increment)
        if (key === 's') adjustHold('elevation', -increment)
        if (key === 'a') adjustHold('windage', -increment)
        if (key === 'd') adjustHold('windage', increment)
        startRepeat(e.shiftKey)
      }
      return
    }

    switch (key) {
      case ' ':
        e.preventDefault()
        if (lastResult) {
          newScenario()
        }
        else {
          takeShot()
        }
        break
      case 'enter':
        if (lastResult) {
          newScenario()
        }
        else {
          takeShot()
        }
        break
    }
  })

  document.addEventListener('keyup', (e) => {
    const key = e.key.toLowerCase()
    if (['w', 'a', 's', 'd'].includes(key)) {
      heldKeys.delete(key)
      if (heldKeys.size === 0) {
        stopRepeat()
      }
    }
  })

  // Stop repeat if window loses focus
  window.addEventListener('blur', () => {
    heldKeys.clear()
    stopRepeat()
  })

  // Handle window resize
  window.addEventListener('resize', () => {
    if (canvasState) {
      resizeCanvas(canvasState)
      renderCurrentState()
    }
  })
}

function adjustHold(field: 'elevation' | 'windage', delta: number): void {
  const input = document.getElementById(field) as HTMLInputElement
  if (!input) return

  const current = parseFloat(input.value) || 0
  const newValue = Math.round((current + delta) * 10) / 10 // Avoid floating point errors
  input.value = newValue.toString()

  updateHoldOverlay()
  renderCurrentState()
}

function updateHoldOverlay(): void {
  const holdInput = readHoldInput()
  const overlayHold = document.getElementById('overlay-hold')

  const elevStr = (holdInput.elevationValue >= 0 ? '+' : '') + holdInput.elevationValue.toFixed(1)
  const windStr = (holdInput.windageValue >= 0 ? '+' : '') + holdInput.windageValue.toFixed(1)

  if (overlayHold) overlayHold.textContent = `E: ${elevStr} | W: ${windStr}`
}

function updateDistanceOverlay(): void {
  if (!currentScenario) return

  const overlayDistance = document.getElementById('overlay-distance')
  const { target, distanceKnown } = currentScenario

  if (overlayDistance) {
    overlayDistance.textContent = distanceKnown ? `${target.distanceYards} yards` : 'Unknown distance'
  }
}

function isKnownDistanceMode(): boolean {
  const checkbox = document.getElementById('known-distance') as HTMLInputElement
  return checkbox?.checked ?? true
}

function newScenario(): void {
  // Generate new scenario
  currentScenario = generateScenario({
    minDistance: 200,
    maxDistance: 800,
    distanceKnown: isKnownDistanceMode(),
    maxWindSpeed: 12,
    allowAngles: true,
  })

  // Reset state
  lastResult = null
  resetHoldInput()
  clearResult()

  // Update UI
  updateScenarioDisplay()
  updateDistanceOverlay()
  updateHoldOverlay()
  renderCurrentState()
}

function updateScenarioDisplay(): void {
  if (!currentScenario) return

  const { target, angleOfFireDegrees, winds, distanceKnown } = currentScenario

  const windStrings = winds.map((w) => `${w.distanceYards}y: ${formatWind(w)}`)

  let angleStr = ''
  if (angleOfFireDegrees !== 0) {
    const direction = angleOfFireDegrees > 0 ? 'uphill' : 'downhill'
    angleStr = `${Math.abs(angleOfFireDegrees)}° ${direction}`
  }

  updateScenarioInfo(
    target.type,
    formatDistance(target.distanceYards, distanceKnown),
    angleStr,
    windStrings
  )
}

function takeShot(): void {
  if (!currentScenario || !canvasState) return

  const holdInput = readHoldInput()
  const { target, angleOfFireDegrees, winds, environment } = currentScenario
  const rifle = controlState.selectedRifle

  // Calculate true ballistic solution
  const solution = solve(
    rifle,
    target.distanceYards,
    angleOfFireDegrees,
    winds,
    environment
  )

  // Calculate where the bullet actually went
  // User's hold compensates for drop (positive elevation = aiming higher)
  // and wind (positive windage = aiming right to compensate for left drift)
  const holdElevationInches = angleToInches(
    holdInput.elevationValue,
    holdInput.elevationUnit,
    target.distanceYards
  )
  const holdWindageInches = angleToInches(
    holdInput.windageValue,
    holdInput.windageUnit,
    target.distanceYards
  )

  // Impact offset: how far from POA the bullet landed
  // Negative drop means bullet went low, positive hold elevation compensates
  const impactY = solution.dropInches + holdElevationInches
  // Positive drift means bullet went right, positive hold windage compensates by aiming right
  // (so bullet lands back at center)
  const impactX = solution.windDriftInches - holdWindageInches

  // Convert to mils for display
  const impactXMils = inchesToAngle(impactX, 'mil', target.distanceYards)
  const impactYMils = inchesToAngle(impactY, 'mil', target.distanceYards)

  // Determine hit/miss (within target bounds)
  const targetWidthMils = (target.widthInches / (target.distanceYards * 36)) * 1000
  const targetHeightMils = (target.heightInches / (target.distanceYards * 36)) * 1000
  const isHit =
    Math.abs(impactXMils) < targetWidthMils / 2 &&
    Math.abs(impactYMils) < targetHeightMils / 2

  // Store result
  lastResult = {
    holdInput,
    trueSolution: solution,
    impactOffsetXInches: impactX,
    impactOffsetYInches: impactY,
    rangeActualYards: target.distanceYards,
  }

  // Update display
  formatResult(lastResult, isHit)
  renderCurrentState(impactXMils, impactYMils, isHit)
}

function formatResult(result: ShotResult, isHit: boolean): void {
  const { trueSolution, impactOffsetXInches, impactOffsetYInches, holdInput } = result

  const correctElevation = -trueSolution.dropMils
  const correctWindage = trueSolution.windDriftMils

  const elevationError = holdInput.elevationValue - correctElevation
  const windageError = holdInput.windageValue - correctWindage

  // Update status
  const status = document.getElementById('result-status')
  if (status) {
    status.textContent = isHit ? 'HIT' : 'MISS'
    status.className = isHit ? 'hit' : 'miss'
  }

  // Update details
  const details = document.getElementById('result-details')
  if (details) {
    const impactV = `${Math.abs(impactOffsetYInches).toFixed(1)}" ${impactOffsetYInches > 0 ? 'high' : 'low'}`
    const impactH = `${Math.abs(impactOffsetXInches).toFixed(1)}" ${impactOffsetXInches > 0 ? 'right' : 'left'}`
    const correctE = `E: ${correctElevation.toFixed(1)}`
    const correctW = `W: ${correctWindage.toFixed(1)}`
    const errorE = `${elevationError > 0 ? '+' : ''}${elevationError.toFixed(1)}`
    const errorW = `${windageError > 0 ? '+' : ''}${windageError.toFixed(1)}`

    details.innerHTML = `
      <span>Impact: ${impactV}, ${impactH}</span>
      <span>Correct: ${correctE} / ${correctW}</span>
      <span>Error: ${errorE} / ${errorW}</span>
    `
  }

  // Update hint
  const hint = document.querySelector('.result-hint')
  if (hint) {
    hint.textContent = 'SPACE for next'
  }
}

function clearResult(): void {
  const status = document.getElementById('result-status')
  const details = document.getElementById('result-details')
  const hint = document.querySelector('.result-hint')

  if (status) {
    status.textContent = ''
    status.className = ''
  }
  if (details) {
    details.innerHTML = '<span>SPACE to fire</span>'
  }
  if (hint) {
    hint.textContent = ''
  }
}

function renderCurrentState(
  impactX?: number,
  impactY?: number,
  isHit?: boolean
): void {
  if (!canvasState || !currentScenario) return

  const impact =
    impactX !== undefined && impactY !== undefined && isHit !== undefined
      ? { x: impactX, y: impactY, hit: isHit }
      : undefined

  // Read current hold values to offset target position
  // When you hold UP (positive elevation), target appears LOWER (you're aiming above it)
  // When you hold RIGHT (positive windage), target appears LEFT (you're aiming right of it)
  const holdInput = readHoldInput()
  const targetOffsetX = -holdInput.windageValue // Negative because hold right = target appears left
  const targetOffsetY = -holdInput.elevationValue // Negative because hold up = target appears lower

  render(
    canvasState,
    currentScenario.target,
    currentScenario.winds,
    impact,
    targetOffsetX,
    targetOffsetY
  )
}

// Start the app
document.addEventListener('DOMContentLoaded', init)
