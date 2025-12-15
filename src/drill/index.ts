import type { RifleProfile } from '../types'
import { solve } from '../ballistics'
import { DEFAULT_ENVIRONMENT } from '../scenarios'
import { getRifleByName } from '../ui/controls'
import { getRandomTarget, type SVGTarget } from './targets'

export interface DrillRound {
  target: SVGTarget
  distanceYards: number
  correctElevation: number
  correctWindage: number
  toleranceElevation: number
  toleranceWindage: number
  windSpeedMPH: number
  windDirectionClock: number
  userElevation: number | null
  userWindage: number | null
  responseTimeMs: number | null
  elevationHit: boolean | null
  windageHit: boolean | null
  isHit: boolean | null
  timedOut: boolean
}

export interface DrillSession {
  rifle: RifleProfile
  rounds: DrillRound[]
  currentRound: number
  totalRounds: number
  isActive: boolean
  isComplete: boolean
}

export interface DrillConfig {
  totalRounds: number
  timeoutMs: number
  minDistance: number
  maxDistance: number
}

const DEFAULT_CONFIG: DrillConfig = {
  totalRounds: 10,
  timeoutMs: 10000,
  minDistance: 200,
  maxDistance: 1500,
}

let session: DrillSession | null = null
let config: DrillConfig = { ...DEFAULT_CONFIG }
let roundStartTime: number = 0
let timerInterval: number | null = null
let timeoutId: number | null = null
let audioContext: AudioContext | null = null

// DOM element references
let elements: {
  rifleEl: HTMLElement | null
  targetEl: HTMLElement | null
  distanceEl: HTMLElement | null
  windEl: HTMLElement | null
  timerBar: HTMLElement | null
  elevationInput: HTMLInputElement | null
  windageLeftInput: HTMLInputElement | null
  windageRightInput: HTMLInputElement | null
  feedback: HTMLElement | null
  roundEl: HTMLElement | null
  hitsEl: HTMLElement | null
  startSection: HTMLElement | null
  summarySection: HTMLElement | null
  summaryHits: HTMLElement | null
  summaryAvgTime: HTMLElement | null
  summaryBestTime: HTMLElement | null
  targetOutline: HTMLElement | null
  targetImpact: HTMLElement | null
} = {
  rifleEl: null,
  targetEl: null,
  distanceEl: null,
  windEl: null,
  timerBar: null,
  elevationInput: null,
  windageLeftInput: null,
  windageRightInput: null,
  feedback: null,
  roundEl: null,
  hitsEl: null,
  startSection: null,
  summarySection: null,
  summaryHits: null,
  summaryAvgTime: null,
  summaryBestTime: null,
  targetOutline: null,
  targetImpact: null,
}

export function initDrill(): void {
  elements = {
    rifleEl: document.getElementById('drill-rifle'),
    targetEl: document.getElementById('drill-target'),
    distanceEl: document.getElementById('drill-distance'),
    windEl: document.getElementById('drill-wind'),
    timerBar: document.getElementById('timer-bar'),
    elevationInput: document.getElementById('drill-elevation') as HTMLInputElement,
    windageLeftInput: document.getElementById('drill-windage-left') as HTMLInputElement,
    windageRightInput: document.getElementById('drill-windage-right') as HTMLInputElement,
    feedback: document.getElementById('drill-feedback'),
    roundEl: document.getElementById('drill-round'),
    hitsEl: document.getElementById('drill-hits'),
    startSection: document.getElementById('drill-start'),
    summarySection: document.getElementById('drill-summary'),
    summaryHits: document.getElementById('summary-hits'),
    summaryAvgTime: document.getElementById('summary-avg-time'),
    summaryBestTime: document.getElementById('summary-best-time'),
    targetOutline: document.getElementById('target-outline'),
    targetImpact: document.getElementById('target-impact'),
  }

  document.getElementById('start-drill-btn')?.addEventListener('click', startDrill)
  document.getElementById('restart-drill-btn')?.addEventListener('click', startDrill)

  elements.elevationInput?.addEventListener('keydown', handleInputKeydown)
  elements.windageLeftInput?.addEventListener('keydown', handleInputKeydown)
  elements.windageRightInput?.addEventListener('keydown', handleInputKeydown)
}

function handleInputKeydown(e: KeyboardEvent): void {
  if (e.key === 'Enter' && session?.isActive && !session.isComplete) {
    e.preventDefault()
    e.stopPropagation()
    submitAnswer()
  }
}

function random(min: number, max: number): number {
  return Math.random() * (max - min) + min
}

function randomInt(min: number, max: number): number {
  return Math.floor(random(min, max + 1))
}

function generateRound(rifle: RifleProfile): DrillRound {
  const target = getRandomTarget()
  const rawDistance = random(config.minDistance, config.maxDistance)
  const distance = Math.round(rawDistance / 25) * 25

  // Generate wind (0-15 mph, random clock direction)
  const windSpeedMPH = random(0, 15)
  const windDirectionClock = randomInt(1, 12)

  // Create wind vector for ballistics calc
  const windVector = {
    distanceYards: distance / 2,
    speedMPH: windSpeedMPH,
    directionClock: windDirectionClock,
  }

  // Calculate correct holdover with wind
  const solution = solve(rifle, distance, 0, [windVector], DEFAULT_ENVIRONMENT)
  const correctElevation = -solution.dropMils
  const correctWindage = solution.windDriftMils

  // Calculate tolerances based on target size at distance
  const targetHeightMils = (target.heightInches / (distance * 36)) * 1000
  const targetWidthMils = (target.widthInches / (distance * 36)) * 1000
  const toleranceElevation = targetHeightMils / 2
  const toleranceWindage = targetWidthMils / 2

  return {
    target,
    distanceYards: distance,
    correctElevation,
    correctWindage,
    toleranceElevation,
    toleranceWindage,
    windSpeedMPH,
    windDirectionClock,
    userElevation: null,
    userWindage: null,
    responseTimeMs: null,
    elevationHit: null,
    windageHit: null,
    isHit: null,
    timedOut: false,
  }
}

export function startDrill(): void {
  const rifleSelect = document.getElementById('rifle-select') as HTMLSelectElement
  const rifleName = rifleSelect?.value

  const rifle = getRifleByName(rifleName)
  if (!rifle) return

  // Reset session
  session = {
    rifle,
    rounds: [],
    currentRound: 0,
    totalRounds: config.totalRounds,
    isActive: false,
    isComplete: false,
  }

  // Generate all rounds upfront
  for (let i = 0; i < config.totalRounds; i++) {
    session.rounds.push(generateRound(rifle))
  }

  // Update UI
  if (elements.startSection) elements.startSection.classList.add('hidden')
  if (elements.summarySection) elements.summarySection.classList.add('hidden')
  if (elements.rifleEl) elements.rifleEl.textContent = rifle.name
  if (elements.feedback) elements.feedback.innerHTML = ''

  updateStatusDisplay()

  // Start first round after brief delay
  setTimeout(() => beginRound(), 500)
}

function formatWindDirection(clock: number): string {
  if (clock === 12) return '12 (head)'
  if (clock === 6) return '6 (tail)'
  if (clock === 3) return '3 (R)'
  if (clock === 9) return '9 (L)'
  if (clock < 6) return clock + " o'clock"
  return clock + " o'clock"
}

function beginRound(): void {
  if (!session || session.currentRound >= session.totalRounds) {
    endDrill()
    return
  }

  const round = session.rounds[session.currentRound]
  session.isActive = true

  // Update display
  if (elements.targetEl) elements.targetEl.textContent = round.target.name
  if (elements.distanceEl) elements.distanceEl.textContent = round.distanceYards + ' yd'
  if (elements.windEl) {
    elements.windEl.textContent = Math.round(round.windSpeedMPH) + ' mph @ ' + formatWindDirection(round.windDirectionClock)
  }
  if (elements.feedback) elements.feedback.innerHTML = ''

  // Reset inputs
  if (elements.elevationInput) {
    elements.elevationInput.value = ''
    elements.elevationInput.disabled = false
    elements.elevationInput.classList.remove('error')
  }
  if (elements.windageLeftInput) {
    elements.windageLeftInput.value = ''
    elements.windageLeftInput.disabled = false
    elements.windageLeftInput.classList.remove('error')
  }
  if (elements.windageRightInput) {
    elements.windageRightInput.value = ''
    elements.windageRightInput.disabled = false
    elements.windageRightInput.classList.remove('error')
  }

  // Show target visual
  showTargetVisual(round)

  // Reset timer bar
  if (elements.timerBar) {
    elements.timerBar.style.width = '100%'
    elements.timerBar.classList.remove('warning', 'critical')
  }

  // Play beep and start timer
  playBeep()
  roundStartTime = performance.now()
  startTimer()

  // Focus elevation input
  setTimeout(() => elements.elevationInput?.focus(), 50)
}

function startTimer(): void {
  const startTime = performance.now()

  timerInterval = window.setInterval(() => {
    const elapsed = performance.now() - startTime
    const remaining = Math.max(0, config.timeoutMs - elapsed)
    const percent = (remaining / config.timeoutMs) * 100

    if (elements.timerBar) {
      elements.timerBar.style.width = `${percent}%`

      if (percent < 20) {
        elements.timerBar.classList.add('critical')
        elements.timerBar.classList.remove('warning')
      }
      else if (percent < 40) {
        elements.timerBar.classList.add('warning')
        elements.timerBar.classList.remove('critical')
      }
    }
  }, 50)

  timeoutId = window.setTimeout(() => {
    handleTimeout()
  }, config.timeoutMs)
}

function stopTimer(): void {
  if (timerInterval) {
    clearInterval(timerInterval)
    timerInterval = null
  }
  if (timeoutId) {
    clearTimeout(timeoutId)
    timeoutId = null
  }
}

function handleTimeout(): void {
  if (!session || !session.isActive) return

  stopTimer()
  session.isActive = false

  const round = session.rounds[session.currentRound]
  round.timedOut = true
  round.elevationHit = false
  round.windageHit = false
  round.isHit = false
  round.responseTimeMs = config.timeoutMs

  // Show feedback and impact
  showFeedback(round, true)
  showImpact(round, true)

  // Disable inputs, wait for Enter to continue
  if (elements.elevationInput) elements.elevationInput.disabled = true
  if (elements.windageLeftInput) elements.windageLeftInput.disabled = true
  if (elements.windageRightInput) elements.windageRightInput.disabled = true
  waitForContinue()
}

function submitAnswer(): void {
  if (!session || !session.isActive) return

  const elevationValue = elements.elevationInput?.value.trim()
  const windageLeftValue = elements.windageLeftInput?.value.trim()
  const windageRightValue = elements.windageRightInput?.value.trim()

  // Need at least elevation to submit
  if (!elevationValue) {
    elements.elevationInput?.classList.add('error')
    setTimeout(() => elements.elevationInput?.classList.remove('error'), 300)
    return
  }

  const userElevation = parseFloat(elevationValue)

  if (isNaN(userElevation)) {
    elements.elevationInput?.classList.add('error')
    setTimeout(() => elements.elevationInput?.classList.remove('error'), 300)
    return
  }

  // Combine windage: left is negative, right is positive
  const leftVal = parseFloat(windageLeftValue || '0') || 0
  const rightVal = parseFloat(windageRightValue || '0') || 0
  const userWindage = rightVal - leftVal

  stopTimer()
  session.isActive = false

  const responseTime = performance.now() - roundStartTime
  const round = session.rounds[session.currentRound]

  round.userElevation = userElevation
  round.userWindage = userWindage
  round.responseTimeMs = responseTime

  // Check if hits (within tolerance for each)
  const elevationError = Math.abs(userElevation - round.correctElevation)
  const windageError = Math.abs(userWindage - round.correctWindage)

  round.elevationHit = elevationError <= round.toleranceElevation
  round.windageHit = windageError <= round.toleranceWindage
  round.isHit = round.elevationHit && round.windageHit

  // Show feedback and impact
  showFeedback(round, false)
  showImpact(round, false)

  // Disable inputs, wait for Enter to continue
  if (elements.elevationInput) elements.elevationInput.disabled = true
  if (elements.windageLeftInput) elements.windageLeftInput.disabled = true
  if (elements.windageRightInput) elements.windageRightInput.disabled = true
  waitForContinue()
}

let continueHandler: ((e: KeyboardEvent) => void) | null = null

function waitForContinue(): void {
  if (continueHandler) {
    document.removeEventListener('keydown', continueHandler)
  }

  continueHandler = (e: KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault()
      document.removeEventListener('keydown', continueHandler!)
      continueHandler = null
      advanceRound()
    }
  }

  document.addEventListener('keydown', continueHandler)
}

function advanceRound(): void {
  if (!session) return
  session.currentRound++
  updateStatusDisplay()
  beginRound()
}

// Visual target scale: pixels per inch at a reference size
const TARGET_VISUAL_SCALE = 3

function showTargetVisual(round: DrillRound): void {
  if (!elements.targetOutline || !elements.targetImpact) return

  const { target } = round

  // Scale target to reasonable visual size, max 150px height
  const maxHeight = 150
  const scale = Math.min(TARGET_VISUAL_SCALE, maxHeight / target.heightInches)

  const widthPx = target.widthInches * scale
  const heightPx = target.heightInches * scale

  elements.targetOutline.style.width = widthPx + 'px'
  elements.targetOutline.style.height = heightPx + 'px'
  elements.targetOutline.style.background = 'transparent'
  elements.targetOutline.style.border = 'none'

  // Set SVG content but preserve impact element
  const impactEl = elements.targetImpact
  elements.targetOutline.innerHTML = target.svg
  elements.targetOutline.appendChild(impactEl)

  // Make SVG fill the container
  const svgEl = elements.targetOutline.querySelector('svg')
  if (svgEl) {
    svgEl.setAttribute('width', '100%')
    svgEl.setAttribute('height', '100%')
  }

  // Hide impact marker
  elements.targetImpact.className = 'target-impact'
  elements.targetImpact.style.left = ''
  elements.targetImpact.style.top = ''
}

function showImpact(round: DrillRound, timedOut: boolean): void {
  if (!elements.targetOutline || !elements.targetImpact) return

  const { target, distanceYards } = round

  // Get target visual dimensions
  const widthPx = parseFloat(elements.targetOutline.style.width) || 0
  const heightPx = parseFloat(elements.targetOutline.style.height) || 0

  if (widthPx === 0 || heightPx === 0) return

  // Calculate target dimensions in mils
  const targetHeightMils = (target.heightInches / (distanceYards * 36)) * 1000
  const targetWidthMils = (target.widthInches / (distanceYards * 36)) * 1000

  // Error in mils
  const elevationErrorMils = timedOut ? 0 : (round.userElevation! - round.correctElevation)
  const windageErrorMils = timedOut ? 0 : (round.userWindage! - round.correctWindage)

  // Convert error to pixels
  const pixelsPerMilY = heightPx / targetHeightMils
  const pixelsPerMilX = widthPx / targetWidthMils

  // Center of target
  const centerX = widthPx / 2
  const centerY = heightPx / 2

  // Impact position
  // Positive elevation error = shot high = visual goes up (subtract from centerY)
  // Positive windage error = held too far right = shot goes right (add to centerX)
  const impactY = centerY - (elevationErrorMils * pixelsPerMilY)
  const impactX = centerX + (windageErrorMils * pixelsPerMilX)

  // Clamp to visible area with margin
  const margin = 30
  const clampedY = Math.max(-margin, Math.min(heightPx + margin, impactY))
  const clampedX = Math.max(-margin, Math.min(widthPx + margin, impactX))

  elements.targetImpact.style.left = clampedX + 'px'
  elements.targetImpact.style.top = clampedY + 'px'

  // Set class based on result
  if (timedOut) {
    elements.targetImpact.className = 'target-impact timeout'
  }
  else if (round.isHit) {
    elements.targetImpact.className = 'target-impact hit'
  }
  else {
    elements.targetImpact.className = 'target-impact miss'
  }
}

function hideTargetVisual(): void {
  if (elements.targetOutline) {
    elements.targetOutline.style.width = '0'
    elements.targetOutline.style.height = '0'
    elements.targetOutline.innerHTML = ''
  }
  if (elements.targetImpact) {
    elements.targetImpact.className = 'target-impact'
  }
}

function showFeedback(round: DrillRound, timedOut: boolean): void {
  if (!elements.feedback) return

  const continueHint = '<div class="continue-hint">Press Enter to continue</div>'

  if (timedOut) {
    elements.feedback.innerHTML =
      '<div class="timeout">TIMEOUT</div>' +
      '<div class="answer-detail">Correct: ' + round.correctElevation.toFixed(1) + ' up / ' + round.correctWindage.toFixed(1) + ' right</div>' +
      continueHint
  }
  else {
    const timeStr = (round.responseTimeMs! / 1000).toFixed(2)

    // Build result string
    let resultClass = 'correct'
    let resultText = 'HIT'

    if (!round.isHit) {
      resultClass = 'incorrect'
      if (!round.elevationHit && !round.windageHit) {
        resultText = 'MISS (elev + wind)'
      }
      else if (!round.elevationHit) {
        resultText = 'MISS (elevation)'
      }
      else {
        resultText = 'MISS (windage)'
      }
    }

    // Elevation detail
    const elevError = round.userElevation! - round.correctElevation
    const elevDir = elevError > 0 ? 'high' : 'low'
    const elevDetail = round.elevationHit
      ? '<span class="hit">E: ' + round.userElevation!.toFixed(1) + '</span>'
      : '<span class="miss">E: ' + round.userElevation!.toFixed(1) + ' (' + Math.abs(elevError).toFixed(1) + ' ' + elevDir + ')</span>'

    // Windage detail
    const windError = round.userWindage! - round.correctWindage
    const windDir = windError > 0 ? 'R' : 'L'
    const windDetail = round.windageHit
      ? '<span class="hit">W: ' + round.userWindage!.toFixed(1) + '</span>'
      : '<span class="miss">W: ' + round.userWindage!.toFixed(1) + ' (' + Math.abs(windError).toFixed(1) + ' ' + windDir + ')</span>'

    elements.feedback.innerHTML =
      '<div class="' + resultClass + '">' + resultText + ' - ' + timeStr + 's</div>' +
      '<div class="answer-detail">' + elevDetail + ' | ' + windDetail + '</div>' +
      '<div class="answer-detail">Correct: ' + round.correctElevation.toFixed(1) + ' up / ' + round.correctWindage.toFixed(1) + ' right</div>' +
      continueHint
  }
}

function updateStatusDisplay(): void {
  if (!session) return

  const hitCount = session.rounds.filter((r) => r.isHit === true).length

  if (elements.roundEl) {
    elements.roundEl.textContent = `Round ${session.currentRound + 1} / ${session.totalRounds}`
  }
  if (elements.hitsEl) {
    elements.hitsEl.textContent = `Hits: ${hitCount}`
  }
}

function endDrill(): void {
  if (!session) return

  session.isComplete = true
  session.isActive = false

  // Hide target visual
  hideTargetVisual()

  // Calculate stats
  const hits = session.rounds.filter((r) => r.isHit === true)
  const hitCount = hits.length
  const completedRounds = session.rounds.filter((r) => r.responseTimeMs !== null && !r.timedOut)

  let avgTime = 0
  let bestTime = Infinity

  for (const round of completedRounds) {
    if (round.responseTimeMs !== null) {
      avgTime += round.responseTimeMs
      if (round.isHit && round.responseTimeMs < bestTime) {
        bestTime = round.responseTimeMs
      }
    }
  }

  if (completedRounds.length > 0) {
    avgTime = avgTime / completedRounds.length
  }

  // Update summary
  if (elements.summaryHits) {
    elements.summaryHits.textContent = `${hitCount}/${session.totalRounds}`
  }
  if (elements.summaryAvgTime) {
    elements.summaryAvgTime.textContent = completedRounds.length > 0
      ? `${(avgTime / 1000).toFixed(2)}s`
      : '-'
  }
  if (elements.summaryBestTime) {
    elements.summaryBestTime.textContent = bestTime < Infinity
      ? `${(bestTime / 1000).toFixed(2)}s`
      : '-'
  }

  // Show summary, hide other elements
  if (elements.summarySection) elements.summarySection.classList.remove('hidden')
  if (elements.distanceEl) elements.distanceEl.textContent = '-'
  if (elements.targetEl) elements.targetEl.textContent = ''
  if (elements.windEl) elements.windEl.textContent = ''
  if (elements.feedback) elements.feedback.innerHTML = ''
  if (elements.elevationInput) {
    elements.elevationInput.value = ''
    elements.elevationInput.disabled = true
  }
  if (elements.windageLeftInput) {
    elements.windageLeftInput.value = ''
    elements.windageLeftInput.disabled = true
  }
  if (elements.windageRightInput) {
    elements.windageRightInput.value = ''
    elements.windageRightInput.disabled = true
  }
  if (elements.timerBar) {
    elements.timerBar.style.width = '0%'
  }
}

function playBeep(): void {
  try {
    if (!audioContext) {
      audioContext = new AudioContext()
    }

    const oscillator = audioContext.createOscillator()
    const gainNode = audioContext.createGain()

    oscillator.connect(gainNode)
    gainNode.connect(audioContext.destination)

    oscillator.type = 'sine'
    oscillator.frequency.setValueAtTime(880, audioContext.currentTime)

    gainNode.gain.setValueAtTime(0.3, audioContext.currentTime)
    gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.15)

    oscillator.start(audioContext.currentTime)
    oscillator.stop(audioContext.currentTime + 0.15)
  }
  catch {
    // Audio not available, continue silently
  }
}

export function resetDrill(): void {
  stopTimer()
  session = null

  // Clean up any pending continue handler
  if (continueHandler) {
    document.removeEventListener('keydown', continueHandler)
    continueHandler = null
  }

  // Hide target visual
  hideTargetVisual()

  if (elements.startSection) elements.startSection.classList.remove('hidden')
  if (elements.summarySection) elements.summarySection.classList.add('hidden')
  if (elements.distanceEl) elements.distanceEl.textContent = '-'
  if (elements.targetEl) elements.targetEl.textContent = ''
  if (elements.windEl) elements.windEl.textContent = ''
  if (elements.rifleEl) elements.rifleEl.textContent = ''
  if (elements.feedback) elements.feedback.innerHTML = ''
  if (elements.roundEl) elements.roundEl.textContent = 'Round 1 / 10'
  if (elements.hitsEl) elements.hitsEl.textContent = 'Hits: 0'
  if (elements.elevationInput) {
    elements.elevationInput.value = ''
    elements.elevationInput.disabled = true
  }
  if (elements.windageLeftInput) {
    elements.windageLeftInput.value = ''
    elements.windageLeftInput.disabled = true
  }
  if (elements.windageRightInput) {
    elements.windageRightInput.value = ''
    elements.windageRightInput.disabled = true
  }
  if (elements.timerBar) {
    elements.timerBar.style.width = '100%'
    elements.timerBar.classList.remove('warning', 'critical')
  }
}
