# GraviDeck — Phase 1: Project Setup & Physics Core

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Initialize project scaffolding (Vite + TypeScript + Phaser 3 + Vitest) and implement the pure 2D Newtonian Vector Gravity physics engine (`Vector2D`, `GravityBody`, `Probe`, `OrbitalEntity`, `PhysicsEngine`, `TrajectoryPredictor`) using strict Test-Driven Development (TDD).

**Architecture:** Pure TypeScript math and physics engine decoupled from rendering. `PhysicsEngine` integrates force vectors $F = G \frac{m_1 m_2}{r^2}$, tracks 180° angular slingshot revolutions for kinetic velocity damage scaling, checks black hole event horizon swallows, handles Event Horizon Harness relic bypass, and computes 1st-bend partial trajectory predictions.

**Tech Stack:** TypeScript, Vite, Phaser 3, Vitest.

## Global Constraints

- Modern Web Standards (ES2022, ES Modules).
- Pure TS modules in `src/physics/` must have 100% Vitest unit test coverage.
- Absolute zero Phaser dependencies inside `src/physics/` for pure testability.

---

### Task 1: Project Scaffolding & Vitest Test Setup

**Files:**
- Create: `package.json`
- Create: `tsconfig.json`
- Create: `vite.config.ts`
- Create: `index.html`
- Create: `src/main.ts`
- Create: `tests/sanity.test.ts`

**Interfaces:**
- Consumes: None
- Produces: Runnable Vite dev server (`npm run dev`) and Vitest test runner (`npm run test`).

- [ ] **Step 1: Write failing sanity test**

```typescript
// tests/sanity.test.ts
import { describe, it, expect } from 'vitest';

describe('Environment Sanity Test', () => {
  it('should pass basic assertion', () => {
    expect(1 + 1).toBe(2);
  });
});
```

- [ ] **Step 2: Create package.json, tsconfig.json, vite.config.ts, and index.html**

```json
// package.json
{
  "name": "gravideck",
  "private": true,
  "version": "0.2.0",
  "type": "module",
  "scripts": {
    "dev": "vite",
    "build": "tsc && vite build",
    "preview": "vite preview",
    "test": "vitest run"
  },
  "dependencies": {
    "phaser": "^3.80.0"
  },
  "devDependencies": {
    "typescript": "^5.3.3",
    "vite": "^5.1.0",
    "vitest": "^1.3.0"
  }
}
```

```json
// tsconfig.json
{
  "compilerOptions": {
    "target": "ES2022",
    "useDefineForClassFields": true,
    "module": "ESNext",
    "lib": ["ES2022", "DOM", "DOM.Iterable"],
    "skipLibCheck": true,
    "moduleResolution": "bundler",
    "allowImportingTsExtensions": true,
    "resolveJsonModule": true,
    "isolatedModules": true,
    "noEmit": true,
    "strict": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "noImplicitReturns": true
  },
  "include": ["src", "tests"]
}
```

```typescript
// vite.config.ts
import { defineConfig } from 'vite';

export default defineConfig({
  server: {
    port: 3000,
    open: false
  }
});
```

```html
<!-- index.html -->
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>GraviDeck — Gravity Foundry</title>
    <style>
      body {
        margin: 0;
        padding: 0;
        background-color: #090d16;
        display: flex;
        justify-content: center;
        align-items: center;
        height: 100vh;
        overflow: hidden;
        font-family: system-ui, -apple-system, sans-serif;
      }
      #game-container {
        width: 1280px;
        height: 720px;
        box-shadow: 0 0 30px rgba(56, 189, 248, 0.2);
        border-radius: 8px;
        overflow: hidden;
      }
    </style>
  </head>
  <body>
    <div id="game-container"></div>
    <script type="module" src="/src/main.ts"></script>
  </body>
</html>
```

```typescript
// src/main.ts
console.log("GraviDeck Initialized");
```

- [ ] **Step 3: Install dependencies and run Vitest**

Run command: `npm install && npm run test`
Expected: PASS (`sanity.test.ts`)

- [ ] **Step 4: Commit**

```bash
git add package.json tsconfig.json vite.config.ts index.html src/main.ts tests/sanity.test.ts
git commit -m "chore(phase1): setup vite typescript phaser vitest scaffolding"
```

---

### Task 2: Vector2D Pure Math Module

**Files:**
- Create: `src/physics/Vector2D.ts`
- Create: `tests/physics/Vector2D.test.ts`

**Interfaces:**
- Consumes: None
- Produces: `class Vector2D` with methods (`add`, `sub`, `scale`, `length`, `lengthSq`, `normalize`, `dist`, `distSq`, `dot`, `angle`).

- [ ] **Step 1: Write failing Vector2D tests**

```typescript
// tests/physics/Vector2D.test.ts
import { describe, it, expect } from 'vitest';
import { Vector2D } from '../../src/physics/Vector2D';

describe('Vector2D Math Operations', () => {
  it('calculates addition and subtraction correctly', () => {
    const v1 = new Vector2D(3, 4);
    const v2 = new Vector2D(1, 2);
    expect(v1.add(v2)).toEqual(new Vector2D(4, 6));
    expect(v1.sub(v2)).toEqual(new Vector2D(2, 2));
  });

  it('calculates length, lengthSq, and distance correctly', () => {
    const v = new Vector2D(3, 4);
    expect(v.lengthSq()).toBe(25);
    expect(v.length()).toBe(5);

    const v2 = new Vector2D(6, 8);
    expect(v.dist(v2)).toBe(5);
  });

  it('normalizes non-zero vectors correctly', () => {
    const v = new Vector2D(3, 4);
    const norm = v.normalize();
    expect(norm.x).toBeCloseTo(0.6);
    expect(norm.y).toBeCloseTo(0.8);
    expect(norm.length()).toBeCloseTo(1.0);
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npm run test`
Expected: FAIL ("Cannot find module '../../src/physics/Vector2D'")

- [ ] **Step 3: Implement Vector2D**

```typescript
// src/physics/Vector2D.ts
export class Vector2D {
  constructor(public x: number = 0, public y: number = 0) {}

  clone(): Vector2D {
    return new Vector2D(this.x, this.y);
  }

  add(v: Vector2D): Vector2D {
    return new Vector2D(this.x + v.x, this.y + v.y);
  }

  sub(v: Vector2D): Vector2D {
    return new Vector2D(this.x - v.x, this.y - v.y);
  }

  scale(s: number): Vector2D {
    return new Vector2D(this.x * s, this.y * s);
  }

  lengthSq(): number {
    return this.x * this.x + this.y * this.y;
  }

  length(): number {
    return Math.sqrt(this.lengthSq());
  }

  distSq(v: Vector2D): number {
    const dx = this.x - v.x;
    const dy = this.y - v.y;
    return dx * dx + dy * dy;
  }

  dist(v: Vector2D): number {
    return Math.sqrt(this.distSq(v));
  }

  normalize(): Vector2D {
    const len = this.length();
    if (len === 0) return new Vector2D(0, 0);
    return new Vector2D(this.x / len, this.y / len);
  }

  dot(v: Vector2D): number {
    return this.x * v.x + this.y * v.y;
  }

  angle(): number {
    return Math.atan2(this.y, this.x);
  }
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npm run test`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add src/physics/Vector2D.ts tests/physics/Vector2D.test.ts
git commit -m "feat(phase1): add Vector2D physics math module with unit tests"
```

---

### Task 3: GravityBody, Probe, & OrbitalEntity Data Models

**Files:**
- Create: `src/physics/GravityBody.ts`
- Create: `src/physics/Probe.ts`
- Create: `src/physics/OrbitalEntity.ts`
- Create: `tests/physics/GravityBody.test.ts`

**Interfaces:**
- Consumes: `Vector2D`
- Produces: `GravityBody`, `Probe`, `OrbitalEntity` (Energy Containers, Antimatter Crates, Asteroids).

- [ ] **Step 1: Write failing GravityBody & OrbitalEntity tests**

```typescript
// tests/physics/GravityBody.test.ts
import { describe, it, expect } from 'vitest';
import { GravityBody, GravityBodyType } from '../../src/physics/GravityBody';
import { Probe } from '../../src/physics/Probe';
import { OrbitalEntity, OrbitalEntityType } from '../../src/physics/OrbitalEntity';
import { Vector2D } from '../../src/physics/Vector2D';

describe('GravityBody & OrbitalEntity Models', () => {
  it('initializes planet body with pull radius', () => {
    const planet = new GravityBody('p1', GravityBodyType.PLANET, new Vector2D(400, 300), 5000, 40, 150);
    expect(planet.mass).toBe(5000);
    expect(planet.pullRadius).toBe(150);
  });

  it('initializes OrbitalEntity energy pod', () => {
    const pod = new OrbitalEntity('pod1', OrbitalEntityType.ENERGY_CONTAINER, new Vector2D(450, 300), 15);
    expect(pod.type).toBe(OrbitalEntityType.ENERGY_CONTAINER);
    expect(pod.isCollected).toBe(false);
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npm run test`
Expected: FAIL ("Cannot find module GravityBody")

- [ ] **Step 3: Implement models**

```typescript
// src/physics/GravityBody.ts
import { Vector2D } from './Vector2D';

export enum GravityBodyType {
  PLANET = 'PLANET',
  SINGULARITY = 'SINGULARITY',
  REPULSION_NODE = 'REPULSION_NODE',
  PULSAR = 'PULSAR'
}

export class GravityBody {
  constructor(
    public id: string,
    public type: GravityBodyType,
    public position: Vector2D,
    public mass: number,
    public bodyRadius: number,
    public pullRadius: number,
    public eventHorizonRadius: number = 15,
    public pulsePeriodMs: number = 0
  ) {}
}
```

```typescript
// src/physics/OrbitalEntity.ts
import { Vector2D } from './Vector2D';

export enum OrbitalEntityType {
  ENERGY_CONTAINER = 'ENERGY_CONTAINER',
  ANTIMATTER_CRATE = 'ANTIMATTER_CRATE',
  ASTEROID_DEBRIS = 'ASTEROID_DEBRIS'
}

export class OrbitalEntity {
  public isCollected: boolean = false;
  public hp: number = 20;

  constructor(
    public id: string,
    public type: OrbitalEntityType,
    public position: Vector2D,
    public radius: number = 15
  ) {}
}
```

```typescript
// src/physics/Probe.ts
import { Vector2D } from './Vector2D';

export class Probe {
  public position: Vector2D;
  public velocity: Vector2D;
  public initialSpeed: number;
  public slingshotCount: number = 0;
  public isSwallowed: boolean = false;
  public isDestroyed: boolean = false;
  public trail: Vector2D[] = [];
  public maxTrailLength: number = 40;
  public activeTraits: string[] = [];
  public baseDamage: number = 20;

  constructor(position: Vector2D, velocity: Vector2D) {
    this.position = position.clone();
    this.velocity = velocity.clone();
    this.initialSpeed = velocity.length();
  }

  getSpeedMultiplier(megaMultiplier: number = 4.0): number {
    if (this.slingshotCount === 0) return 1.0;
    if (this.slingshotCount === 1) return 1.5;
    if (this.slingshotCount === 2) return 2.5;
    return megaMultiplier;
  }

  getCurrentDamage(megaMultiplier: number = 4.0): number {
    const currentSpeed = this.velocity.length();
    const speedRatio = this.initialSpeed > 0 ? currentSpeed / this.initialSpeed : 1.0;
    const ratioSq = speedRatio * speedRatio;
    return Math.round(this.baseDamage * ratioSq * this.getSpeedMultiplier(megaMultiplier));
  }
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npm run test`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add src/physics/GravityBody.ts src/physics/OrbitalEntity.ts src/physics/Probe.ts tests/physics/GravityBody.test.ts
git commit -m "feat(phase1): add GravityBody, Probe, and OrbitalEntity collectible models"
```

---

### Task 4: Custom Newtonian PhysicsEngine & Slingshot Tracker

**Files:**
- Create: `src/physics/PhysicsEngine.ts`
- Create: `tests/physics/PhysicsEngine.test.ts`

**Interfaces:**
- Consumes: `Vector2D`, `GravityBody`, `Probe`, `OrbitalEntity`
- Produces: `PhysicsEngine` class with `step(probe, bodies, orbitalEntities, dt, hasEventHorizonHarness)` method.

- [ ] **Step 1: Write failing PhysicsEngine tests**

```typescript
// tests/physics/PhysicsEngine.test.ts
import { describe, it, expect } from 'vitest';
import { PhysicsEngine } from '../../src/physics/PhysicsEngine';
import { GravityBody, GravityBodyType } from '../../src/physics/GravityBody';
import { Probe } from '../../src/physics/Probe';
import { OrbitalEntity, OrbitalEntityType } from '../../src/physics/OrbitalEntity';
import { Vector2D } from '../../src/physics/Vector2D';

describe('PhysicsEngine Gravitational Calculations & Collectibles', () => {
  it('accelerates probe towards a standard planet', () => {
    const engine = new PhysicsEngine(500);
    const planet = new GravityBody('p1', GravityBodyType.PLANET, new Vector2D(400, 300), 1000, 30, 200);
    const probe = new Probe(new Vector2D(200, 300), new Vector2D(0, 0));

    engine.step(probe, [planet], [], 0.1);
    expect(probe.velocity.x).toBeGreaterThan(0);
  });

  it('does not swallow probe in black hole if Event Horizon Harness relic is active', () => {
    const engine = new PhysicsEngine(500);
    const bh = new GravityBody('bh1', GravityBodyType.SINGULARITY, new Vector2D(300, 300), 5000, 20, 200, 15);
    const probe = new Probe(new Vector2D(305, 300), new Vector2D(0, 0));

    engine.step(probe, [bh], [], 0.1, true /* hasHarness */);
    expect(probe.isSwallowed).toBe(false);
  });

  it('detects collision with Energy Container', () => {
    const engine = new PhysicsEngine(500);
    const pod = new OrbitalEntity('pod1', OrbitalEntityType.ENERGY_CONTAINER, new Vector2D(205, 300), 15);
    const probe = new Probe(new Vector2D(200, 300), new Vector2D(0, 0));

    engine.step(probe, [], [pod], 0.1);
    expect(pod.isCollected).toBe(true);
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npm run test`
Expected: FAIL ("Cannot find module PhysicsEngine")

- [ ] **Step 3: Implement PhysicsEngine**

```typescript
// src/physics/PhysicsEngine.ts
import { Vector2D } from './Vector2D';
import { GravityBody, GravityBodyType } from './GravityBody';
import { Probe } from './Probe';
import { OrbitalEntity } from './OrbitalEntity';

export class PhysicsEngine {
  private lastAngles: Map<string, number> = new Map();
  private accumAngles: Map<string, number> = new Map();

  constructor(public G: number = 500) {}

  step(probe: Probe, bodies: GravityBody[], orbitalEntities: OrbitalEntity[] = [], dt: number = 0.03, hasEventHorizonHarness: boolean = false): void {
    if (probe.isSwallowed || probe.isDestroyed) return;

    let totalAcc = new Vector2D(0, 0);

    for (const body of bodies) {
      const dir = body.position.sub(probe.position);
      const distSq = dir.lengthSq();
      const dist = Math.sqrt(distSq);

      if (dist < 1) continue;

      if (body.type === GravityBodyType.SINGULARITY && dist <= body.eventHorizonRadius) {
        if (!hasEventHorizonHarness) {
          probe.isSwallowed = true;
          return;
        }
      }

      if (dist <= body.pullRadius) {
        const normDir = dir.normalize();
        let forceMag = (this.G * body.mass) / Math.max(distSq, 100);

        if (body.type === GravityBodyType.REPULSION_NODE) {
          forceMag = -forceMag;
        }

        totalAcc = totalAcc.add(normDir.scale(forceMag));

        const currentAngle = Math.atan2(probe.position.y - body.position.y, probe.position.x - body.position.x);
        const lastAngle = this.lastAngles.get(body.id);

        if (lastAngle !== undefined) {
          let diff = currentAngle - lastAngle;
          while (diff > Math.PI) diff -= 2 * Math.PI;
          while (diff < -Math.PI) diff += 2 * Math.PI;

          const currentAccum = (this.accumAngles.get(body.id) || 0) + Math.abs(diff);
          this.accumAngles.set(body.id, currentAccum);

          if (currentAccum >= Math.PI) {
            probe.slingshotCount += 1;
            this.accumAngles.set(body.id, 0);
          }
        }
        this.lastAngles.set(body.id, currentAngle);
      }
    }

    for (const entity of orbitalEntities) {
      if (entity.isCollected) continue;
      if (probe.position.dist(entity.position) <= entity.radius + 8) {
        entity.isCollected = true;
      }
    }

    probe.velocity = probe.velocity.add(totalAcc.scale(dt));
    probe.position = probe.position.add(probe.velocity.scale(dt));

    probe.trail.push(probe.position.clone());
    if (probe.trail.length > probe.maxTrailLength) {
      probe.trail.shift();
    }
  }

  resetTracking(): void {
    this.lastAngles.clear();
    this.accumAngles.clear();
  }
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npm run test`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add src/physics/PhysicsEngine.ts tests/physics/PhysicsEngine.test.ts
git commit -m "feat(phase1): implement PhysicsEngine with event horizon harness bypass and orbital entity pickups"
```

---

### Task 5: TrajectoryPredictor Module

**Files:**
- Create: `src/physics/TrajectoryPredictor.ts`
- Create: `tests/physics/TrajectoryPredictor.test.ts`

**Interfaces:**
- Consumes: `Vector2D`, `GravityBody`, `Probe`, `PhysicsEngine`
- Produces: `TrajectoryPredictor` with `predict(probe, bodies, maxSteps)` returning `Vector2D[]`.

- [ ] **Step 1: Write failing TrajectoryPredictor tests**

```typescript
// tests/physics/TrajectoryPredictor.test.ts
import { describe, it, expect } from 'vitest';
import { TrajectoryPredictor } from '../../src/physics/TrajectoryPredictor';
import { GravityBody, GravityBodyType } from '../../src/physics/GravityBody';
import { Probe } from '../../src/physics/Probe';
import { Vector2D } from '../../src/physics/Vector2D';

describe('TrajectoryPredictor First-Bend Truncation', () => {
  it('generates points up to first major curvature inflection', () => {
    const predictor = new TrajectoryPredictor();
    const planet = new GravityBody('p1', GravityBodyType.PLANET, new Vector2D(400, 300), 5000, 30, 250);
    const probe = new Probe(new Vector2D(100, 200), new Vector2D(300, 0));

    const path = predictor.predict(probe, [planet], 300, 0.05);

    expect(path.length).toBeGreaterThan(5);
    expect(path.length).toBeLessThanOrEqual(300);
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npm run test`
Expected: FAIL ("Cannot find module TrajectoryPredictor")

- [ ] **Step 3: Implement TrajectoryPredictor**

```typescript
// src/physics/TrajectoryPredictor.ts
import { Vector2D } from './Vector2D';
import { GravityBody } from './GravityBody';
import { Probe } from './Probe';
import { PhysicsEngine } from './PhysicsEngine';

export class TrajectoryPredictor {
  private simEngine: PhysicsEngine = new PhysicsEngine(500);

  predict(initialProbe: Probe, bodies: GravityBody[], maxSteps: number = 200, dt: number = 0.03): Vector2D[] {
    const ghost = new Probe(initialProbe.position, initialProbe.velocity);
    const points: Vector2D[] = [ghost.position.clone()];

    this.simEngine.resetTracking();

    let prevDir: Vector2D | null = null;
    let inflectionCount = 0;

    for (let step = 0; step < maxSteps; step++) {
      this.simEngine.step(ghost, bodies, [], dt);

      if (ghost.isSwallowed || ghost.isDestroyed) break;

      const currentDir = ghost.velocity.normalize();
      if (prevDir !== null) {
        const turnDot = prevDir.dot(currentDir);
        if (turnDot < 0.7) {
          inflectionCount++;
          if (inflectionCount >= 1) {
            points.push(ghost.position.clone());
            break;
          }
        }
      }

      prevDir = currentDir;
      points.push(ghost.position.clone());
    }

    return points;
  }
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npm run test`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add src/physics/TrajectoryPredictor.ts tests/physics/TrajectoryPredictor.test.ts
git commit -m "feat(phase1): add TrajectoryPredictor for partial first-bend trajectory previews"
```
