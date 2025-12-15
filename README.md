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

## Controls

| Key | Action |
|-----|--------|
| W / S | Adjust elevation (0.1 mil per tap) |
| A / D | Adjust windage (0.1 mil per tap) |
| Shift + WASD | Coarse adjustment (1.0 mil) |
| Space | Fire / Next scenario |
| Hold WASD | Continuous adjustment (~30fps) |

## Interface

### Header
- **Rifle select** - Choose from preset rifle profiles (6.5 CM, .308, 6mm CM, .300 WM)
- **Scope select** - Choose reticle pattern (Mil-Dot, Horus H59, Tremor3, MOA)
- **Magnification** - Slider for scope zoom (FFP reticle scales with magnification)
- **Known Distance** - Toggle to hide distance for ranging practice

### Scope View
- **Top-left**: Distance to target (or "Unknown distance" if toggle off)
- **Top-right**: Current hold values (Elevation / Windage in mils)
- **Bottom-left**: Wind flags showing direction and relative speed
- **Bottom-right**: Wind readings at multiple depths
- **Center**: Target and reticle overlay

### Footer
- **Before firing**: "SPACE to fire"
- **After firing**: HIT/MISS status, impact offset, correct hold, your error

## Training Loop

1. Scenario generates with random target, distance, wind, and angle
2. Read wind flags and numbers to estimate crosswind
3. Use WASD to adjust your holdover (target moves relative to reticle)
4. Press SPACE to fire
5. Review feedback: where you hit vs correct hold
6. Press SPACE for next scenario

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
- Timed drill modes
