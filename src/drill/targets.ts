// SVG target definitions for drill mode

export interface SVGTarget {
  id: string
  name: string
  widthInches: number
  heightInches: number
  svg: string
}

export const SVG_TARGETS: SVGTarget[] = [
  {
    id: 'rubber-ducky',
    name: 'Rubber Ducky',
    widthInches: 12,
    heightInches: 14,
    svg: `<svg viewBox="0 0 100 120" fill="none" xmlns="http://www.w3.org/2000/svg">
      <!-- Body -->
      <ellipse cx="50" cy="85" rx="40" ry="30" fill="#FFD700"/>
      <ellipse cx="50" cy="85" rx="40" ry="30" stroke="#E5A800" stroke-width="2"/>
      <!-- Wing -->
      <ellipse cx="30" cy="80" rx="12" ry="18" fill="#FFC000"/>
      <!-- Head -->
      <circle cx="50" cy="40" r="28" fill="#FFD700"/>
      <circle cx="50" cy="40" r="28" stroke="#E5A800" stroke-width="2"/>
      <!-- Beak -->
      <ellipse cx="78" cy="45" rx="15" ry="8" fill="#FF8C00"/>
      <ellipse cx="78" cy="45" rx="15" ry="8" stroke="#CC7000" stroke-width="1.5"/>
      <!-- Eyes -->
      <circle cx="42" cy="32" r="8" fill="white"/>
      <circle cx="58" cy="32" r="8" fill="white"/>
      <circle cx="44" cy="33" r="4" fill="black"/>
      <circle cx="60" cy="33" r="4" fill="black"/>
      <circle cx="45" cy="31" r="1.5" fill="white"/>
      <circle cx="61" cy="31" r="1.5" fill="white"/>
    </svg>`,
  },
  {
    id: 'bear',
    name: 'Bear',
    widthInches: 20,
    heightInches: 24,
    svg: `<svg viewBox="0 0 100 120" fill="none" xmlns="http://www.w3.org/2000/svg">
      <!-- Ears -->
      <circle cx="25" cy="20" r="15" fill="#8B4513"/>
      <circle cx="75" cy="20" r="15" fill="#8B4513"/>
      <circle cx="25" cy="20" r="8" fill="#A0522D"/>
      <circle cx="75" cy="20" r="8" fill="#A0522D"/>
      <!-- Head -->
      <ellipse cx="50" cy="45" rx="35" ry="32" fill="#8B4513"/>
      <!-- Snout -->
      <ellipse cx="50" cy="55" rx="15" ry="12" fill="#A0522D"/>
      <!-- Nose -->
      <ellipse cx="50" cy="50" rx="6" ry="4" fill="black"/>
      <!-- Eyes -->
      <circle cx="35" cy="38" r="7" fill="white"/>
      <circle cx="65" cy="38" r="7" fill="white"/>
      <circle cx="37" cy="39" r="4" fill="black"/>
      <circle cx="67" cy="39" r="4" fill="black"/>
      <circle cx="38" cy="37" r="1.5" fill="white"/>
      <circle cx="68" cy="37" r="1.5" fill="white"/>
      <!-- Body -->
      <ellipse cx="50" cy="95" rx="35" ry="25" fill="#8B4513"/>
      <!-- Belly -->
      <ellipse cx="50" cy="95" rx="20" ry="15" fill="#A0522D"/>
    </svg>`,
  },
  {
    id: 'zombie',
    name: 'Zombie',
    widthInches: 18,
    heightInches: 30,
    svg: `<svg viewBox="0 0 100 160" fill="none" xmlns="http://www.w3.org/2000/svg">
      <!-- Body/shirt -->
      <rect x="25" y="60" width="50" height="60" rx="5" fill="#4A5" stroke="#363" stroke-width="2"/>
      <!-- Tears in shirt -->
      <path d="M30 80 L35 90 L30 100" stroke="#363" stroke-width="2" fill="none"/>
      <path d="M70 75 L65 85 L70 95" stroke="#363" stroke-width="2" fill="none"/>
      <!-- Head -->
      <ellipse cx="50" cy="35" rx="25" ry="28" fill="#7A8B6E"/>
      <ellipse cx="50" cy="35" rx="25" ry="28" stroke="#5A6B4E" stroke-width="2"/>
      <!-- Hair patches -->
      <path d="M30 15 Q35 5 45 12" stroke="#3A3A3A" stroke-width="3" fill="none"/>
      <path d="M55 10 Q65 5 70 15" stroke="#3A3A3A" stroke-width="3" fill="none"/>
      <!-- Eyes -->
      <circle cx="40" cy="30" r="8" fill="#FF6B6B"/>
      <circle cx="60" cy="30" r="8" fill="#FF6B6B"/>
      <circle cx="40" cy="30" r="4" fill="black"/>
      <circle cx="60" cy="30" r="4" fill="black"/>
      <!-- Mouth -->
      <path d="M35 50 Q50 60 65 50" stroke="#3A3A3A" stroke-width="2" fill="none"/>
      <rect x="40" y="48" width="4" height="6" fill="#EEE"/>
      <rect x="48" y="48" width="4" height="6" fill="#EEE"/>
      <rect x="56" y="48" width="4" height="6" fill="#EEE"/>
      <!-- Arms reaching out -->
      <rect x="0" y="70" width="25" height="12" rx="5" fill="#7A8B6E" stroke="#5A6B4E" stroke-width="1"/>
      <rect x="75" y="65" width="25" height="12" rx="5" fill="#7A8B6E" stroke="#5A6B4E" stroke-width="1"/>
      <!-- Legs -->
      <rect x="30" y="120" width="15" height="35" rx="3" fill="#445"/>
      <rect x="55" y="120" width="15" height="35" rx="3" fill="#445"/>
    </svg>`,
  },
  {
    id: 'steel-gong',
    name: 'Steel Gong',
    widthInches: 12,
    heightInches: 12,
    svg: `<svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
      <!-- Hanger -->
      <rect x="45" y="0" width="10" height="15" fill="#666"/>
      <!-- Gong -->
      <circle cx="50" cy="55" r="40" fill="#C0C0C0"/>
      <circle cx="50" cy="55" r="40" stroke="#888" stroke-width="3"/>
      <!-- Inner rings -->
      <circle cx="50" cy="55" r="30" stroke="#999" stroke-width="1" fill="none"/>
      <circle cx="50" cy="55" r="20" stroke="#999" stroke-width="1" fill="none"/>
      <!-- Highlight -->
      <ellipse cx="38" cy="43" rx="10" ry="8" fill="#E8E8E8" opacity="0.5"/>
      <!-- Dings/marks -->
      <circle cx="55" cy="60" r="3" fill="#A0A0A0"/>
      <circle cx="42" cy="65" r="2" fill="#A0A0A0"/>
      <circle cx="60" cy="48" r="2.5" fill="#A0A0A0"/>
    </svg>`,
  },
  {
    id: 'ipsc-classic',
    name: 'IPSC Target',
    widthInches: 18,
    heightInches: 30,
    svg: `<svg viewBox="0 0 100 165" fill="none" xmlns="http://www.w3.org/2000/svg">
      <!-- Main body -->
      <path d="M10 45 L10 165 L90 165 L90 45 L70 45 L70 25 Q70 0 50 0 Q30 0 30 25 L30 45 Z" fill="#D2B48C" stroke="#8B7355" stroke-width="2"/>
      <!-- A zone -->
      <path d="M25 50 L25 120 L75 120 L75 50 L60 50 L60 30 Q60 15 50 15 Q40 15 40 30 L40 50 Z" fill="none" stroke="#444" stroke-width="1.5"/>
      <!-- C zone lines -->
      <line x1="15" y1="45" x2="85" y2="45" stroke="#444" stroke-width="1"/>
      <line x1="15" y1="130" x2="85" y2="130" stroke="#444" stroke-width="1"/>
      <!-- Zone labels -->
      <text x="50" y="90" text-anchor="middle" font-size="20" font-weight="bold" fill="#444">A</text>
      <text x="50" y="150" text-anchor="middle" font-size="12" fill="#444">C</text>
    </svg>`,
  },
  {
    id: 'alien',
    name: 'Alien',
    widthInches: 14,
    heightInches: 18,
    svg: `<svg viewBox="0 0 100 130" fill="none" xmlns="http://www.w3.org/2000/svg">
      <!-- Head -->
      <ellipse cx="50" cy="40" rx="40" ry="35" fill="#90EE90"/>
      <ellipse cx="50" cy="40" rx="40" ry="35" stroke="#228B22" stroke-width="2"/>
      <!-- Big eyes -->
      <ellipse cx="32" cy="38" rx="15" ry="20" fill="black"/>
      <ellipse cx="68" cy="38" rx="15" ry="20" fill="black"/>
      <ellipse cx="28" cy="32" rx="5" ry="7" fill="#333"/>
      <ellipse cx="64" cy="32" rx="5" ry="7" fill="#333"/>
      <!-- Mouth -->
      <ellipse cx="50" cy="65" rx="8" ry="4" fill="#228B22"/>
      <!-- Antennae -->
      <line x1="35" y1="8" x2="30" y2="0" stroke="#228B22" stroke-width="3" stroke-linecap="round"/>
      <line x1="65" y1="8" x2="70" y2="0" stroke="#228B22" stroke-width="3" stroke-linecap="round"/>
      <circle cx="30" cy="0" r="4" fill="#FF69B4"/>
      <circle cx="70" cy="0" r="4" fill="#FF69B4"/>
      <!-- Body -->
      <ellipse cx="50" cy="100" rx="25" ry="25" fill="#90EE90" stroke="#228B22" stroke-width="2"/>
      <!-- Arms -->
      <ellipse cx="18" cy="95" rx="10" ry="6" fill="#90EE90" stroke="#228B22" stroke-width="1.5"/>
      <ellipse cx="82" cy="95" rx="10" ry="6" fill="#90EE90" stroke="#228B22" stroke-width="1.5"/>
    </svg>`,
  },
]

export function getRandomTarget(): SVGTarget {
  return SVG_TARGETS[Math.floor(Math.random() * SVG_TARGETS.length)]
}

export function getTargetById(id: string): SVGTarget | undefined {
  return SVG_TARGETS.find(t => t.id === id)
}
