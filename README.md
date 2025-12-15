# Holdover

A browser-based precision rifle training simulator focused on holdover skills - using the reticle to compensate for drop and wind without dialing turrets.

## Purpose

Training tool for PRS (Precision Rifle Series) shooters who lack access to long-range facilities. Focuses on the mental/calculation aspects of shooting:

- **Range estimation** - Using mil/MOA reticles to determine distance based on known target sizes
- **Wind calling** - Reading multiple wind indicators at different distances and synthesizing a hold
- **Holdover calculation** - Applying the correct reticle hold for drop and drift without adjusting turrets
- **Reticle familiarity** - Building speed with different reticle patterns

## Quick Start

```bash
bun install
bun run dev
```

Open http://localhost:5173 in your browser.

## Modes

Holdover has two training modes, selectable via the header buttons:

### Scope Mode

Visual holdover practice with a reticle overlay. You see a scope view with target and wind indicators, and use keyboard controls to dial in your hold before firing.

**Controls:**

| Key | Action |
|-----|--------|
| W | Hold up (0.1 mil per tap) |
| S | Hold down (0.1 mil per tap) |
| A | Hold left (0.1 mil per tap) |
| D | Hold right (0.1 mil per tap) |
| Shift + WASD | Coarse adjustment (1.0 mil) |
| Hold WASD | Continuous adjustment (~30fps) |
| Space / Enter | Fire shot |
| Space / Enter (after shot) | Next scenario |
| H or ? | Toggle dope card (drop table) |

**Interface:**

- **Header**
  - Rifle select - Choose rifle profile (6.5 CM, .308, 6mm CM, .300 WM)
  - Scope select - Choose reticle pattern (Mil-Dot, Horus H59, Tremor3, MOA)
  - Magnification - Slider for scope zoom (FFP reticle scales with mag)
  - Known Distance - Toggle to hide distance for ranging practice

- **Scope View**
  - Top-left: Distance to target (or "Unknown distance")
  - Top-right: Current hold values (E: +X.X | W: +X.X)
  - Bottom-left: Target type and angle info
  - Bottom-right: Wind readings at multiple distances
  - Center: Target silhouette with reticle overlay

- **Footer**: HIT/MISS result with impact offset, correct solution, and your error

**Training Loop:**

1. Scenario generates with random target, distance (200-1500 yd), wind, and angle
2. Read wind indicators to estimate required windage
3. Use WASD to adjust holdover - target moves relative to reticle center
4. Press Space to fire
5. Review feedback showing where you hit vs the correct hold
6. Press Space for next scenario

**Dope Card (H key):**

Shows a drop table for the current rifle at 100-yard increments from 100-1500 yards. Useful for memorizing elevation holds.

---

### Drill Mode

Timed Q&A training for rapid holdover calculation. Given a distance and wind, you type in the correct elevation and windage holds as fast as possible.

**How it works:**

1. Click "Start Drill" to begin a 10-round session
2. Each round shows:
   - Target type and size
   - Distance in yards
   - Wind speed and clock direction (e.g., "8 mph @ 3 o'clock")
3. A timer bar counts down from 10 seconds
4. Enter your holds:
   - **Left field (L)**: Windage hold left (for wind from the right)
   - **Center field (up)**: Elevation hold in mils
   - **Right field (R)**: Windage hold right (for wind from the left)
5. Press Enter to submit
6. Feedback shows HIT/MISS with your error and the correct solution
7. Press Enter to continue to next round
8. After 10 rounds, see summary: hits, average time, best time

**Windage Input:**

The three-field layout matches how you think about wind:
- Wind from 3 o'clock (pushing you left) → enter hold in the **Right** field
- Wind from 9 o'clock (pushing you right) → enter hold in the **Left** field
- The system calculates net windage as: `right - left`

**Scoring:**

A "hit" requires both elevation AND windage to be within tolerance. Tolerance is based on the target size at the given distance - larger targets at closer range are more forgiving.

**Tips:**

- For 6.5 Creedmoor: elevation ≈ distance/200 (e.g., 800 yd → ~4.0 mils)
- Wind from 3 or 9 o'clock has full effect; 12 or 6 o'clock has zero effect
- Quartering winds (1-2, 4-5, 7-8, 10-11 o'clock) have partial effect

## Mil-Ranging Formula

When distance is unknown, use the reticle to measure the target:

```
(Target size in inches / mil reading) × 27.78 = range in yards
```

Example: IPSC torso (18" wide) measures 1.2 mils → 416 yards

## Reference Target Sizes

| Target | Size |
|--------|------|
| IPSC Full | 18" × 30" |
| IPSC Half | 9" × 15" |
| IPSC Head | 6" × 8" |
| Human Silhouette | 18" × 40" |
| Deer (vitals) | 16" × 16" |
| Bear (vitals) | 20" × 24" |
| Vehicle Tire | 26" × 26" |
| 8" Steel | 8" × 8" |
| 12" Steel | 12" × 12" |

## Ballistics Engine

Point-mass trajectory model with:
- G1/G7 drag coefficient tables
- Air density adjustment for altitude/temperature/pressure
- Angle compensation (cosine correction for uphill/downhill)
- Wind drift calculation from multiple wind vectors
- Zero offset calculation

**Note**: The ballistics are simplified for training purposes, not match-grade accuracy.

## Preset Rifles

| Profile | BC (G7) | MV | Zero |
|---------|---------|-----|------|
| 6.5 Creedmoor 140gr | 0.610 | 2750 fps | 100 yd |
| .308 Win 175gr | 0.505 | 2600 fps | 100 yd |
| 6mm Creedmoor 105gr | 0.540 | 3000 fps | 100 yd |
| .300 Win Mag 190gr | 0.640 | 2900 fps | 100 yd |

## Reticle Patterns

- **Mil-Dot** - Classic mil-dot with 0.5 mil hash marks, extended to -10 mils
- **Horus H59** - Christmas tree pattern with 0.5 mil hash spacing
- **Tremor3** - Similar tree pattern, slightly different geometry
- **MOA Crosshair** - MOA-based with 2 MOA hash marks

All reticles are FFP (first focal plane) - they scale with magnification.

## Tech Stack

- TypeScript
- Vite (build/dev server)
- Canvas 2D API
- No framework - vanilla DOM

## Project Structure

```
src/
├── main.ts              # App initialization and event handling
├── index.html           # Single page with overlays
├── styles.css           # Dark theme styling
├── types.ts             # TypeScript interfaces
├── ballistics/
│   ├── index.ts         # Solver, unit conversions
│   └── drag.ts          # G1/G7 drag model calculations
├── drill/
│   ├── index.ts         # Drill mode logic and session management
│   └── targets.ts       # SVG target definitions
├── reticles/
│   └── index.ts         # Reticle pattern definitions
├── scenarios/
│   └── index.ts         # Random scenario generation
└── ui/
    ├── canvas.ts        # Canvas rendering (reticle, target, wind, impact)
    └── controls.ts      # UI state and DOM helpers
```

## Future Ideas

- Realistic circular scope view with eye relief
- Glass quality simulation (edge distortion, chromatic aberration)
- Mirage/shimmer effects for wind visualization
- More accurate wind flag physics (crosswind component)
- Custom rifle/scope profile editor
- Session statistics and progress tracking
- Elevation-only drill mode (no wind)
