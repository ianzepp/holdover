# Holdover

A browser-based precision rifle training simulator focused on holdover skills - using the reticle to compensate for drop and wind without dialing turrets.

## Purpose

Training tool for PRS (Precision Rifle Series) shooters who lack access to long-range facilities. Focuses on the mental/calculation aspects of shooting:

- **Range estimation** - Using mil/MOA reticles to determine distance based on known target sizes
- **Wind calling** - Reading multiple wind indicators at different distances and synthesizing a hold
- **Holdover calculation** - Applying the correct reticle hold for drop and drift without adjusting turrets
- **Reticle familiarity** - Building speed with different reticle patterns (mil-dot, Tremor, H59, etc.)

## Core Concepts

### Why Holdover?

PRS stages throw multiple targets at varied distances under time pressure. Dialing turrets for each target is too slow. Competitors need to:

1. Range the target (or be given distance)
2. Read wind conditions
3. Calculate the hold
4. Place the correct reticle mark on target
5. Send it

This tool trains steps 1-4 in a repeatable way.

### Training Loop

1. Set rifle zero once (e.g., 100 yard zero)
2. Scenario presents: target, wind indicators at multiple depths, terrain angle
3. Estimate range via mil-ranging (or given for wind-focused drills)
4. Calculate hold: X mils up, Y mils left/right
5. Place reticle mark on target, take the shot
6. Feedback shows true POI vs your hold, with breakdown of errors

### Mil-Ranging Formula

```
(Target size in inches / mil reading) * 27.78 = range in yards
```

Example: IPSC torso (18" wide) reads 1.2 mils = 416 yards

## Data Model

### Rifle Profile
- Caliber
- Bullet BC (G1/G7)
- Bullet weight (grains)
- Muzzle velocity
- Zero distance
- Twist rate (for spin drift)

### Scope Profile
- MOA or MIL
- Reticle pattern
- Magnification range
- FFP (first focal plane)

### Scenario
- Target type and size
- True distance
- Terrain angle (uphill/downhill)
- Wind vectors at multiple depths (shooter, mid-range, target)

### Environment
- Altitude
- Temperature
- Barometric pressure
- Humidity

## Reference Target Sizes

| Target | Width/Height |
|--------|--------------|
| IPSC A-zone | 6" x 11" |
| IPSC torso | 18" wide |
| Half-IPSC | 9" wide |
| Human head | 6-8" |
| Deer chest | 16-18" |
| Vehicle tire | 24-28" |

## Ballistics Engine

Uses standard G1/G7 drag models to calculate:
- Bullet drop at distance
- Time of flight
- Wind drift (function of crosswind and TOF)
- Spin drift
- Coriolis effect (long range)
- Angle compensation (cosine of incline)

## Roadmap

### Phase 1: Functional Trainer
- Schematic/diagrammatic view
- Reticle overlay (selectable patterns)
- Wind indicators at 3-4 depth points
- Ballistics engine with real calculations
- Ranging practice mode
- Holdover practice mode
- Shot feedback with error breakdown

### Phase 2: Realistic Scope View
- Circular scope view with eye relief simulation
- FFP reticle scaling with magnification
- Glass quality profiles (edge sharpness, light transmission, chromatic aberration)
- Mirage/shimmer effects for wind indication
- Comparison mode for different optic quality levels

## Tech Stack

- TypeScript
- Vite (build tooling)
- Canvas 2D API (Phase 1)
- WebGPU (Phase 2, for glass/mirage effects)
- No framework - vanilla DOM for UI controls
