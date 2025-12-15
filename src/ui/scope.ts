// DOM-based scope view with parallax terrain layers

import { initTerrain, updateParallax } from './terrain'
import { getReticle, type Reticle } from '../reticles'
import type { Target, WindVector } from '../types'
import { SVG_TARGETS } from '../drill/targets'

interface ScopeState {
  reticle: Reticle | null
  magnification: number
}

let state: ScopeState = {
  reticle: null,
  magnification: 10,
}

let elements: {
  frame: HTMLElement | null
  reticle: HTMLElement | null
  target: HTMLElement | null
  impact: HTMLElement | null
} = {
  frame: null,
  reticle: null,
  target: null,
  impact: null,
}

export function initScope(): boolean {
  elements = {
    frame: document.getElementById('scope-frame'),
    reticle: document.getElementById('scope-reticle'),
    target: document.getElementById('scope-target'),
    impact: document.getElementById('scope-impact'),
  }

  if (!elements.frame) {
    return false
  }

  // Initialize terrain layers
  initTerrain()

  return true
}

export function setReticle(reticle: Reticle): void {
  state.reticle = reticle
  renderReticle()
}

export function setMagnification(mag: number): void {
  state.magnification = mag
  renderReticle()
}

function renderReticle(): void {
  if (!elements.reticle || !state.reticle) return

  const reticle = state.reticle
  const mag = state.magnification

  // Build SVG reticle
  // Scale based on magnification (higher mag = larger reticle marks)
  const scale = mag / 10  // Normalize to 10x base

  // Reticle viewport - 20 mils total field of view at 10x
  const fov = 20 / scale
  const halfFov = fov / 2

  let svg = `<svg viewBox="-${halfFov} -${halfFov} ${fov} ${fov}" xmlns="http://www.w3.org/2000/svg">`

  // Reticle styling
  const strokeWidth = 0.03
  const color = '#111'

  // Draw main crosshairs
  svg += `<line x1="-${halfFov}" y1="0" x2="${halfFov}" y2="0" stroke="${color}" stroke-width="${strokeWidth}"/>`
  svg += `<line x1="0" y1="-${halfFov}" x2="0" y2="${halfFov}" stroke="${color}" stroke-width="${strokeWidth}"/>`

  // Draw mil marks based on reticle type
  if (reticle.id === 'mil-dot' || reticle.id === 'horus-h59' || reticle.id === 'tremor3') {
    // Horizontal mil dots
    for (let i = 1; i <= 10; i++) {
      const dotSize = i % 5 === 0 ? 0.08 : 0.05
      svg += `<circle cx="${i}" cy="0" r="${dotSize}" fill="${color}"/>`
      svg += `<circle cx="${-i}" cy="0" r="${dotSize}" fill="${color}"/>`
    }

    // Vertical mil marks (extended down for holdover)
    for (let i = 1; i <= 15; i++) {
      const markLen = i % 5 === 0 ? 0.2 : 0.1
      svg += `<line x1="${-markLen/2}" y1="${i}" x2="${markLen/2}" y2="${i}" stroke="${color}" stroke-width="${strokeWidth}"/>`
      if (i <= 5) {
        svg += `<line x1="${-markLen/2}" y1="${-i}" x2="${markLen/2}" y2="${-i}" stroke="${color}" stroke-width="${strokeWidth}"/>`
      }
    }

    // Christmas tree for Horus/Tremor style
    if (reticle.id === 'horus-h59' || reticle.id === 'tremor3') {
      for (let row = 2; row <= 12; row++) {
        const width = Math.min(row * 0.5, 5)
        for (let col = 0.5; col <= width; col += 0.5) {
          svg += `<circle cx="${col}" cy="${row}" r="0.04" fill="${color}"/>`
          svg += `<circle cx="${-col}" cy="${row}" r="0.04" fill="${color}"/>`
        }
      }
    }
  }
  else {
    // MOA style - simpler marks
    for (let i = 2; i <= 20; i += 2) {
      const markLen = i % 10 === 0 ? 0.3 : 0.15
      svg += `<line x1="${-markLen/2}" y1="${i * 0.29}" x2="${markLen/2}" y2="${i * 0.29}" stroke="${color}" stroke-width="${strokeWidth}"/>`
      svg += `<line x1="${i * 0.29}" y1="${-markLen/2}" x2="${i * 0.29}" y2="${markLen/2}" stroke="${color}" stroke-width="${strokeWidth}"/>`
      svg += `<line x1="${-i * 0.29}" y1="${-markLen/2}" x2="${-i * 0.29}" y2="${markLen/2}" stroke="${color}" stroke-width="${strokeWidth}"/>`
    }
  }

  // Center dot or gap
  svg += `<circle cx="0" cy="0" r="0.06" fill="none" stroke="${color}" stroke-width="${strokeWidth}"/>`

  svg += '</svg>'

  elements.reticle.innerHTML = svg
}

export function renderScope(
  target: Target,
  _winds: WindVector[],
  impact?: { x: number; y: number; hit: boolean },
  holdX: number = 0,
  holdY: number = 0
): void {
  // Update parallax based on hold
  updateParallax(holdX, holdY)

  // Update target
  renderTarget(target, holdX, holdY)

  // Update impact marker
  if (impact && elements.impact) {
    const frameSize = elements.frame?.clientWidth || 700
    const centerX = frameSize / 2
    const centerY = frameSize / 2
    const pixelsPerMil = 20

    // Impact position relative to center (where you aimed)
    const impactX = centerX + impact.x * pixelsPerMil
    const impactY = centerY + impact.y * pixelsPerMil

    elements.impact.style.left = `${impactX}px`
    elements.impact.style.top = `${impactY}px`
    elements.impact.className = impact.hit ? 'hit' : 'miss'
  }
  else if (elements.impact) {
    elements.impact.className = ''
  }
}

function renderTarget(target: Target, holdX: number, holdY: number): void {
  if (!elements.target) return

  // Pick a random SVG target based on target type (or use a default)
  const svgTarget = SVG_TARGETS.find(t =>
    t.name.toLowerCase().includes(target.type.toLowerCase())
  ) || SVG_TARGETS[0]

  // Calculate target size based on distance
  // At 100 yards, 1 inch = ~10 pixels
  // At 1000 yards, 1 inch = ~1 pixel
  const baseScale = 100 / target.distanceYards
  const pixelScale = baseScale * 8  // Adjust for visual appeal

  const widthPx = svgTarget.widthInches * pixelScale
  const heightPx = svgTarget.heightInches * pixelScale

  // Clamp size for visibility
  const minHeight = 30
  const maxHeight = 200
  const clampedHeight = Math.max(minHeight, Math.min(maxHeight, heightPx))
  const scaleFactor = clampedHeight / heightPx
  const finalWidth = widthPx * scaleFactor
  const finalHeight = clampedHeight

  elements.target.style.width = `${finalWidth}px`
  elements.target.style.height = `${finalHeight}px`
  elements.target.innerHTML = svgTarget.svg

  // Make SVG fill container
  const svg = elements.target.querySelector('svg')
  if (svg) {
    svg.setAttribute('width', '100%')
    svg.setAttribute('height', '100%')
  }

  // Position target (parallax is handled by layer, but we can add offset)
  const pixelsPerMil = 20
  const offsetX = -holdX * pixelsPerMil
  const offsetY = -holdY * pixelsPerMil
  elements.target.style.transform = `translate(${offsetX}px, ${offsetY}px)`
}

export function clearImpact(): void {
  if (elements.impact) {
    elements.impact.className = ''
  }
}
