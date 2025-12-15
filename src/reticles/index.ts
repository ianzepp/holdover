import type { AngleUnit } from '../types'

// Reticle mark definition
export interface ReticleMark {
  x: number // position in mils/moa from center (right positive)
  y: number // position in mils/moa from center (up positive)
  type: 'dot' | 'hash' | 'line'
  size?: number // for dots, diameter in canvas units
}

// Full reticle definition
export interface Reticle {
  id: string
  name: string
  unit: AngleUnit
  marks: ReticleMark[]
  subtensionLines: {
    // Main crosshair definitions
    horizontalExtent: number // how far left/right the main line extends
    verticalExtent: number // how far up/down the main line extends
    thickness: number // line thickness in canvas units
  }
  // Grid/tree pattern
  tree?: {
    // Christmas tree pattern below center
    startY: number // mils/moa below center where tree starts
    endY: number // mils/moa below center where tree ends
    rowSpacing: number // vertical spacing between rows
    widthAtStart: number // width at startY
    widthAtEnd: number // width at endY
    hashSpacing: number // horizontal spacing of hashes
  }
}

// Mil-dot reticle with half-mil marks
export const MIL_DOT: Reticle = {
  id: 'mil-dot',
  name: 'Mil-Dot',
  unit: 'mil',
  marks: [
    // Full mil dots along horizontal axis
    { x: -5, y: 0, type: 'dot', size: 3 },
    { x: -4, y: 0, type: 'dot', size: 3 },
    { x: -3, y: 0, type: 'dot', size: 3 },
    { x: -2, y: 0, type: 'dot', size: 3 },
    { x: -1, y: 0, type: 'dot', size: 3 },
    { x: 1, y: 0, type: 'dot', size: 3 },
    { x: 2, y: 0, type: 'dot', size: 3 },
    { x: 3, y: 0, type: 'dot', size: 3 },
    { x: 4, y: 0, type: 'dot', size: 3 },
    { x: 5, y: 0, type: 'dot', size: 3 },
    // Half-mil hashes along horizontal axis
    { x: -4.5, y: 0, type: 'hash', size: 1.5 },
    { x: -3.5, y: 0, type: 'hash', size: 1.5 },
    { x: -2.5, y: 0, type: 'hash', size: 1.5 },
    { x: -1.5, y: 0, type: 'hash', size: 1.5 },
    { x: -0.5, y: 0, type: 'hash', size: 1.5 },
    { x: 0.5, y: 0, type: 'hash', size: 1.5 },
    { x: 1.5, y: 0, type: 'hash', size: 1.5 },
    { x: 2.5, y: 0, type: 'hash', size: 1.5 },
    { x: 3.5, y: 0, type: 'hash', size: 1.5 },
    { x: 4.5, y: 0, type: 'hash', size: 1.5 },
    // Full mil dots along vertical axis (extended range for holdovers)
    { x: 0, y: 3, type: 'dot', size: 3 },
    { x: 0, y: 2, type: 'dot', size: 3 },
    { x: 0, y: 1, type: 'dot', size: 3 },
    { x: 0, y: -1, type: 'dot', size: 3 },
    { x: 0, y: -2, type: 'dot', size: 3 },
    { x: 0, y: -3, type: 'dot', size: 3 },
    { x: 0, y: -4, type: 'dot', size: 3 },
    { x: 0, y: -5, type: 'dot', size: 3 },
    { x: 0, y: -6, type: 'dot', size: 3 },
    { x: 0, y: -7, type: 'dot', size: 3 },
    { x: 0, y: -8, type: 'dot', size: 3 },
    { x: 0, y: -9, type: 'dot', size: 3 },
    { x: 0, y: -10, type: 'dot', size: 3 },
    // Half-mil hashes along vertical axis
    { x: 0, y: 2.5, type: 'hash', size: 1.5 },
    { x: 0, y: 1.5, type: 'hash', size: 1.5 },
    { x: 0, y: 0.5, type: 'hash', size: 1.5 },
    { x: 0, y: -0.5, type: 'hash', size: 1.5 },
    { x: 0, y: -1.5, type: 'hash', size: 1.5 },
    { x: 0, y: -2.5, type: 'hash', size: 1.5 },
    { x: 0, y: -3.5, type: 'hash', size: 1.5 },
    { x: 0, y: -4.5, type: 'hash', size: 1.5 },
    { x: 0, y: -5.5, type: 'hash', size: 1.5 },
    { x: 0, y: -6.5, type: 'hash', size: 1.5 },
    { x: 0, y: -7.5, type: 'hash', size: 1.5 },
    { x: 0, y: -8.5, type: 'hash', size: 1.5 },
    { x: 0, y: -9.5, type: 'hash', size: 1.5 },
  ],
  subtensionLines: {
    horizontalExtent: 5,
    verticalExtent: 10,
    thickness: 1,
  },
}

// Horus H59 style tree reticle
export const HORUS_H59: Reticle = {
  id: 'horus-h59',
  name: 'Horus H59',
  unit: 'mil',
  marks: [],
  subtensionLines: {
    horizontalExtent: 5,
    verticalExtent: 1, // Short above center
    thickness: 1,
  },
  tree: {
    startY: -1,
    endY: -10,
    rowSpacing: 1,
    widthAtStart: 2,
    widthAtEnd: 5,
    hashSpacing: 0.5,
  },
}

// Tremor3 style reticle
export const TREMOR3: Reticle = {
  id: 'tremor3',
  name: 'Tremor3',
  unit: 'mil',
  marks: [],
  subtensionLines: {
    horizontalExtent: 5,
    verticalExtent: 2,
    thickness: 1.5,
  },
  tree: {
    startY: -1,
    endY: -12,
    rowSpacing: 1,
    widthAtStart: 1.5,
    widthAtEnd: 4,
    hashSpacing: 0.5,
  },
}

// Simple MOA crosshair
export const MOA_CROSSHAIR: Reticle = {
  id: 'moa-crosshair',
  name: 'MOA Crosshair',
  unit: 'moa',
  marks: [
    // Hash marks every 2 MOA
    { x: -8, y: 0, type: 'hash' },
    { x: -6, y: 0, type: 'hash' },
    { x: -4, y: 0, type: 'hash' },
    { x: -2, y: 0, type: 'hash' },
    { x: 2, y: 0, type: 'hash' },
    { x: 4, y: 0, type: 'hash' },
    { x: 6, y: 0, type: 'hash' },
    { x: 8, y: 0, type: 'hash' },
    { x: 0, y: 8, type: 'hash' },
    { x: 0, y: 6, type: 'hash' },
    { x: 0, y: 4, type: 'hash' },
    { x: 0, y: 2, type: 'hash' },
    { x: 0, y: -2, type: 'hash' },
    { x: 0, y: -4, type: 'hash' },
    { x: 0, y: -6, type: 'hash' },
    { x: 0, y: -8, type: 'hash' },
  ],
  subtensionLines: {
    horizontalExtent: 10,
    verticalExtent: 10,
    thickness: 1,
  },
}

// Registry of all available reticles
export const RETICLES: Record<string, Reticle> = {
  'mil-dot': MIL_DOT,
  'horus-h59': HORUS_H59,
  'tremor3': TREMOR3,
  'moa-crosshair': MOA_CROSSHAIR,
}

export function getReticle(id: string): Reticle | undefined {
  return RETICLES[id]
}

export function listReticles(): Reticle[] {
  return Object.values(RETICLES)
}
