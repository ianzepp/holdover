// SVG terrain silhouettes for parallax scope view
// Styled like paper cutouts / tunnel book layers

export const TERRAIN = {
  // Distant mountains - muted blue-gray
  mountains: `<svg viewBox="0 0 1400 400" preserveAspectRatio="xMidYMax slice" xmlns="http://www.w3.org/2000/svg">
    <path d="M0 400 L0 280 L80 220 L150 260 L220 180 L300 240 L380 160 L450 200 L520 120 L600 180 L680 100 L750 160 L820 80 L900 150 L980 90 L1050 140 L1120 60 L1200 130 L1280 70 L1350 120 L1400 80 L1400 400 Z" fill="#6B7B8B"/>
    <path d="M0 400 L0 320 L100 280 L180 320 L260 260 L340 300 L420 240 L500 280 L580 220 L660 270 L740 200 L820 250 L900 190 L980 240 L1060 180 L1140 230 L1220 170 L1300 220 L1400 180 L1400 400 Z" fill="#7B8B9B" opacity="0.8"/>
  </svg>`,

  // Rolling hills - soft green-gray
  hills: `<svg viewBox="0 0 1400 350" preserveAspectRatio="xMidYMax slice" xmlns="http://www.w3.org/2000/svg">
    <path d="M0 350 L0 200 Q100 150 200 180 Q350 100 500 160 Q650 80 800 140 Q950 60 1100 120 Q1250 50 1400 100 L1400 350 Z" fill="#5A6B5A"/>
    <path d="M0 350 L0 250 Q150 180 300 220 Q450 140 600 200 Q750 120 900 180 Q1050 100 1200 160 Q1350 100 1400 140 L1400 350 Z" fill="#4A5B4A" opacity="0.9"/>
  </svg>`,

  // Tree line - dark silhouettes
  trees: `<svg viewBox="0 0 1400 300" preserveAspectRatio="xMidYMax slice" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <g id="pine">
        <path d="M0 0 L-15 40 L-8 38 L-20 70 L-10 68 L-25 100 L25 100 L10 68 L20 70 L8 38 L15 40 Z" fill="#2A3A2A"/>
        <rect x="-4" y="100" width="8" height="20" fill="#3A2A1A"/>
      </g>
      <g id="oak">
        <ellipse cx="0" cy="40" rx="30" ry="35" fill="#2A3A2A"/>
        <rect x="-5" y="70" width="10" height="30" fill="#3A2A1A"/>
      </g>
      <g id="bush">
        <ellipse cx="0" cy="15" rx="25" ry="18" fill="#3A4A3A"/>
      </g>
    </defs>
    <!-- Tree line -->
    <use href="#pine" transform="translate(50, 180) scale(0.8)"/>
    <use href="#oak" transform="translate(120, 200) scale(0.7)"/>
    <use href="#pine" transform="translate(180, 175) scale(0.9)"/>
    <use href="#bush" transform="translate(230, 280)"/>
    <use href="#pine" transform="translate(280, 185) scale(0.75)"/>
    <use href="#oak" transform="translate(360, 195) scale(0.8)"/>
    <use href="#pine" transform="translate(430, 170) scale(1.0)"/>
    <use href="#bush" transform="translate(480, 275)"/>
    <use href="#pine" transform="translate(530, 180) scale(0.85)"/>
    <use href="#oak" transform="translate(620, 190) scale(0.9)"/>
    <use href="#pine" transform="translate(700, 175) scale(0.95)"/>
    <use href="#bush" transform="translate(760, 278)"/>
    <use href="#pine" transform="translate(820, 185) scale(0.8)"/>
    <use href="#oak" transform="translate(900, 200) scale(0.75)"/>
    <use href="#pine" transform="translate(970, 172) scale(1.0)"/>
    <use href="#bush" transform="translate(1030, 276)"/>
    <use href="#pine" transform="translate(1100, 180) scale(0.9)"/>
    <use href="#oak" transform="translate(1180, 195) scale(0.85)"/>
    <use href="#pine" transform="translate(1260, 178) scale(0.88)"/>
    <use href="#bush" transform="translate(1320, 280)"/>
    <use href="#pine" transform="translate(1380, 182) scale(0.82)"/>
    <!-- Ground fill -->
    <rect x="0" y="290" width="1400" height="60" fill="#3A4A3A"/>
  </svg>`,

  // Foreground grass - darker, more detail
  grass: `<svg viewBox="0 0 1400 200" preserveAspectRatio="xMidYMax slice" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <g id="grass-tuft">
        <path d="M0 30 Q-2 15 -5 0 M0 30 Q0 12 2 0 M0 30 Q2 15 6 2 M0 30 Q-1 18 -8 5 M0 30 Q1 16 8 3" stroke="#2A3A2A" stroke-width="2" fill="none"/>
      </g>
      <g id="grass-tall">
        <path d="M0 50 Q-3 25 -8 0 M0 50 Q0 20 3 0 M0 50 Q3 25 10 2 M0 50 Q-2 30 -12 8 M0 50 Q2 28 12 5" stroke="#1A2A1A" stroke-width="2.5" fill="none"/>
      </g>
    </defs>
    <!-- Ground base -->
    <rect x="0" y="80" width="1400" height="120" fill="#3A4A3A"/>
    <!-- Grass tufts across the foreground -->
    <use href="#grass-tall" transform="translate(30, 85)"/>
    <use href="#grass-tuft" transform="translate(70, 95)"/>
    <use href="#grass-tall" transform="translate(120, 82)"/>
    <use href="#grass-tuft" transform="translate(180, 92)"/>
    <use href="#grass-tall" transform="translate(240, 88)"/>
    <use href="#grass-tuft" transform="translate(300, 90)"/>
    <use href="#grass-tall" transform="translate(360, 84)"/>
    <use href="#grass-tuft" transform="translate(420, 93)"/>
    <use href="#grass-tall" transform="translate(480, 86)"/>
    <use href="#grass-tuft" transform="translate(540, 91)"/>
    <use href="#grass-tall" transform="translate(600, 83)"/>
    <use href="#grass-tuft" transform="translate(660, 94)"/>
    <use href="#grass-tall" transform="translate(720, 87)"/>
    <use href="#grass-tuft" transform="translate(780, 89)"/>
    <use href="#grass-tall" transform="translate(840, 85)"/>
    <use href="#grass-tuft" transform="translate(900, 92)"/>
    <use href="#grass-tall" transform="translate(960, 84)"/>
    <use href="#grass-tuft" transform="translate(1020, 90)"/>
    <use href="#grass-tall" transform="translate(1080, 86)"/>
    <use href="#grass-tuft" transform="translate(1140, 93)"/>
    <use href="#grass-tall" transform="translate(1200, 82)"/>
    <use href="#grass-tuft" transform="translate(1260, 91)"/>
    <use href="#grass-tall" transform="translate(1320, 88)"/>
    <use href="#grass-tuft" transform="translate(1380, 94)"/>
  </svg>`,
}

// Parallax depth factors - how much each layer moves relative to hold adjustment
// Higher = moves more (closer to viewer)
export const PARALLAX_FACTORS = {
  sky: 0.05,
  mountains: 0.15,
  hills: 0.3,
  trees: 0.5,
  target: 1.0,  // Target moves 1:1 with hold adjustment
  grass: 1.5,   // Foreground moves most
}

export function initTerrain(): void {
  const mountains = document.getElementById('layer-mountains')
  const hills = document.getElementById('layer-hills')
  const trees = document.getElementById('layer-trees')
  const grass = document.getElementById('layer-grass')

  if (mountains) mountains.innerHTML = TERRAIN.mountains
  if (hills) hills.innerHTML = TERRAIN.hills
  if (trees) trees.innerHTML = TERRAIN.trees
  if (grass) grass.innerHTML = TERRAIN.grass
}

export function updateParallax(holdX: number, holdY: number): void {
  // Convert hold values (mils) to pixel offsets
  // Positive holdX = holding right = world shifts left
  // Positive holdY = holding up = world shifts down
  const pixelsPerMil = 20  // Adjust for feel

  const layers = [
    { id: 'layer-sky', factor: PARALLAX_FACTORS.sky },
    { id: 'layer-mountains', factor: PARALLAX_FACTORS.mountains },
    { id: 'layer-hills', factor: PARALLAX_FACTORS.hills },
    { id: 'layer-trees', factor: PARALLAX_FACTORS.trees },
    { id: 'layer-target', factor: PARALLAX_FACTORS.target },
    { id: 'layer-grass', factor: PARALLAX_FACTORS.grass },
  ]

  for (const layer of layers) {
    const el = document.getElementById(layer.id)
    if (el) {
      const offsetX = -holdX * pixelsPerMil * layer.factor
      const offsetY = -holdY * pixelsPerMil * layer.factor
      // Use CSS custom properties so animations can combine with parallax
      el.style.setProperty('--parallax-x', `${offsetX}px`)
      el.style.setProperty('--parallax-y', `${offsetY}px`)
    }
  }
}
