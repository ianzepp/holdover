import type { Reticle, ReticleMark } from '../reticles'
import type { Target, WindVector } from '../types'

export interface CanvasState {
  canvas: HTMLCanvasElement
  ctx: CanvasRenderingContext2D
  width: number
  height: number
  magnification: number
  reticle: Reticle
}

// Pixels per mil at 10x magnification (base scale)
const BASE_SCALE = 40

export function initCanvas(canvasId: string): CanvasState | null {
  const canvas = document.getElementById(canvasId) as HTMLCanvasElement
  if (!canvas) return null

  const ctx = canvas.getContext('2d')
  if (!ctx) return null

  // Size canvas buffer to match display size
  const rect = canvas.getBoundingClientRect()
  const dpr = window.devicePixelRatio || 1
  canvas.width = rect.width * dpr
  canvas.height = rect.height * dpr
  ctx.scale(dpr, dpr)

  return {
    canvas,
    ctx,
    width: rect.width,
    height: rect.height,
    magnification: 10,
    reticle: null as unknown as Reticle, // Will be set
  }
}

export function resizeCanvas(state: CanvasState): void {
  const { canvas, ctx } = state
  const rect = canvas.getBoundingClientRect()
  const dpr = window.devicePixelRatio || 1

  canvas.width = rect.width * dpr
  canvas.height = rect.height * dpr
  ctx.setTransform(1, 0, 0, 1, 0, 0) // Reset transform
  ctx.scale(dpr, dpr)

  state.width = rect.width
  state.height = rect.height
}

export function setMagnification(state: CanvasState, mag: number): void {
  state.magnification = mag
}

export function setReticle(state: CanvasState, reticle: Reticle): void {
  state.reticle = reticle
}

// Get pixels per unit (mil or moa) at current magnification
function getScale(state: CanvasState): number {
  // FFP: reticle scales with magnification
  return BASE_SCALE * (state.magnification / 10)
}

// Convert angle units to pixels
function unitToPixels(value: number, state: CanvasState): number {
  return value * getScale(state)
}

// Clear and prepare canvas
function clear(state: CanvasState): void {
  const { ctx, width, height } = state
  ctx.fillStyle = '#0d0d0d'
  ctx.fillRect(0, 0, width, height)
}

// Draw the reticle
function drawReticle(state: CanvasState): void {
  const { ctx, width, height, reticle } = state
  if (!reticle) return

  const centerX = width / 2
  const centerY = height / 2
  const scale = getScale(state)

  // Reticle color (illuminated red)
  ctx.strokeStyle = '#ff4444'
  ctx.fillStyle = '#ff4444'
  ctx.lineWidth = reticle.subtensionLines.thickness

  // Draw main crosshairs
  const hExtent = unitToPixels(reticle.subtensionLines.horizontalExtent, state)
  const vExtent = unitToPixels(reticle.subtensionLines.verticalExtent, state)

  // Horizontal line
  ctx.beginPath()
  ctx.moveTo(centerX - hExtent, centerY)
  ctx.lineTo(centerX + hExtent, centerY)
  ctx.stroke()

  // Vertical line
  ctx.beginPath()
  ctx.moveTo(centerX, centerY - vExtent)
  ctx.lineTo(centerX, centerY + vExtent)
  ctx.stroke()

  // Draw tree if present
  if (reticle.tree) {
    drawTree(state, centerX, centerY)
  }

  // Draw individual marks
  for (const mark of reticle.marks) {
    drawMark(state, mark, centerX, centerY)
  }

  // Draw center dot
  ctx.fillStyle = '#c00'
  ctx.beginPath()
  ctx.arc(centerX, centerY, 3, 0, Math.PI * 2)
  ctx.fill()
}

// Draw Christmas tree pattern
function drawTree(state: CanvasState, centerX: number, centerY: number): void {
  const { ctx, reticle } = state
  if (!reticle.tree) return

  const tree = reticle.tree
  const scale = getScale(state)

  ctx.strokeStyle = '#ff4444'
  ctx.lineWidth = 1

  const rows = Math.floor((tree.endY - tree.startY) / tree.rowSpacing)

  for (let row = 0; row <= rows; row++) {
    const yMils = tree.startY - row * tree.rowSpacing
    const yPixels = centerY - yMils * scale

    // Calculate width at this row (linear interpolation)
    const progress = row / rows
    const widthMils = tree.widthAtStart + (tree.widthAtEnd - tree.widthAtStart) * progress

    // Draw vertical line segment for this row
    if (row < rows) {
      const nextY = centerY - (yMils - tree.rowSpacing) * scale
      ctx.beginPath()
      ctx.moveTo(centerX, yPixels)
      ctx.lineTo(centerX, nextY)
      ctx.stroke()
    }

    // Draw hash marks at this row
    const numHashes = Math.floor(widthMils / tree.hashSpacing)
    for (let h = 1; h <= numHashes; h++) {
      const xOffset = h * tree.hashSpacing * scale

      // Left side
      ctx.beginPath()
      ctx.moveTo(centerX - xOffset, yPixels - 3)
      ctx.lineTo(centerX - xOffset, yPixels + 3)
      ctx.stroke()

      // Right side
      ctx.beginPath()
      ctx.moveTo(centerX + xOffset, yPixels - 3)
      ctx.lineTo(centerX + xOffset, yPixels + 3)
      ctx.stroke()
    }
  }
}

// Draw individual mark
function drawMark(
  state: CanvasState,
  mark: ReticleMark,
  centerX: number,
  centerY: number
): void {
  const { ctx } = state
  const scale = getScale(state)

  const x = centerX + mark.x * scale
  const y = centerY - mark.y * scale // Y is inverted (up is negative in canvas)

  ctx.fillStyle = '#ff4444'
  ctx.strokeStyle = '#ff4444'

  // Scale mark size with magnification (FFP behavior)
  const scaledSize = ((mark.size ?? 2) * scale) / 40 // 40 is base scale at 10x

  switch (mark.type) {
    case 'dot':
      ctx.beginPath()
      ctx.arc(x, y, scaledSize, 0, Math.PI * 2)
      ctx.fill()
      break

    case 'hash':
      ctx.lineWidth = Math.max(1, scaledSize / 2)
      const hashLen = scaledSize * 2
      ctx.beginPath()
      if (mark.x === 0) {
        // Vertical axis - horizontal hash
        ctx.moveTo(x - hashLen, y)
        ctx.lineTo(x + hashLen, y)
      }
      else {
        // Horizontal axis - vertical hash
        ctx.moveTo(x, y - hashLen)
        ctx.lineTo(x, y + hashLen)
      }
      ctx.stroke()
      break

    case 'line':
      // For future use
      break
  }
}

// Draw target at calculated size
export function drawTarget(
  state: CanvasState,
  target: Target,
  offsetXMils: number = 0,
  offsetYMils: number = 0
): void {
  const { ctx, width, height } = state
  const centerX = width / 2
  const centerY = height / 2
  const scale = getScale(state)

  // Calculate target size in mils at its distance
  const widthMils = (target.widthInches / (target.distanceYards * 36)) * 1000
  const heightMils = (target.heightInches / (target.distanceYards * 36)) * 1000

  const widthPx = widthMils * scale
  const heightPx = heightMils * scale

  // Position (offset from center)
  const x = centerX + offsetXMils * scale - widthPx / 2
  const y = centerY - offsetYMils * scale - heightPx / 2

  // Draw target silhouette
  ctx.fillStyle = '#3a3a3a'
  ctx.strokeStyle = '#666'
  ctx.lineWidth = 1

  ctx.fillRect(x, y, widthPx, heightPx)
  ctx.strokeRect(x, y, widthPx, heightPx)
}

// Draw wind indicators in bottom-left corner
export function drawWindIndicators(
  state: CanvasState,
  winds: WindVector[],
  maxDistance: number
): void {
  const { ctx, height } = state

  const flagHeight = 40
  const flagSpacing = 50
  const startX = 30
  const startY = height - 60

  for (let i = 0; i < winds.length; i++) {
    const wind = winds[i]
    const x = startX + i * flagSpacing

    // Draw flag pole
    ctx.strokeStyle = '#666'
    ctx.lineWidth = 2
    ctx.beginPath()
    ctx.moveTo(x, startY)
    ctx.lineTo(x, startY - flagHeight)
    ctx.stroke()

    // Calculate flag angle based on wind speed
    const flagLength = 15 + wind.speedMPH * 0.8
    const angle = Math.min(wind.speedMPH / 15, 1) * (Math.PI / 4) // Max 45 degrees

    // Direction determines which way flag points
    const clockTo3or9 = ((wind.directionClock - 3 + 12) % 12) - 6
    const direction = clockTo3or9 > 0 ? 1 : clockTo3or9 < 0 ? -1 : 0

    // Draw flag
    ctx.fillStyle = direction > 0 ? '#c44' : direction < 0 ? '#4a7' : '#888'
    ctx.beginPath()
    ctx.moveTo(x, startY - flagHeight)
    ctx.lineTo(x + direction * flagLength * Math.cos(angle), startY - flagHeight + flagLength * Math.sin(angle))
    ctx.lineTo(x, startY - flagHeight + 12)
    ctx.closePath()
    ctx.fill()

    // Distance label below pole
    ctx.font = '10px sans-serif'
    ctx.fillStyle = '#666'
    ctx.textAlign = 'center'
    ctx.fillText(`${wind.distanceYards}y`, x, startY + 12)
  }
}

// Draw shot impact point
export function drawImpact(
  state: CanvasState,
  offsetXMils: number,
  offsetYMils: number,
  isHit: boolean,
  targetOffsetX: number = 0,
  targetOffsetY: number = 0
): void {
  const { ctx, width, height } = state
  const centerX = width / 2
  const centerY = height / 2
  const scale = getScale(state)

  // Impact is relative to target, so apply target offset
  const x = centerX + (offsetXMils + targetOffsetX) * scale
  const y = centerY - (offsetYMils + targetOffsetY) * scale

  ctx.fillStyle = isHit ? '#4a7c59' : '#c44'
  ctx.strokeStyle = '#fff'
  ctx.lineWidth = 2

  ctx.beginPath()
  ctx.arc(x, y, 6, 0, Math.PI * 2)
  ctx.fill()
  ctx.stroke()
}

// Main render function
export function render(
  state: CanvasState,
  target?: Target,
  winds?: WindVector[],
  impact?: { x: number; y: number; hit: boolean },
  targetOffsetX: number = 0,
  targetOffsetY: number = 0
): void {
  clear(state)

  if (target) {
    drawTarget(state, target, targetOffsetX, targetOffsetY)
  }

  if (winds && target) {
    drawWindIndicators(state, winds, target.distanceYards)
  }

  drawReticle(state)

  if (impact) {
    drawImpact(state, impact.x, impact.y, impact.hit, targetOffsetX, targetOffsetY)
  }
}
