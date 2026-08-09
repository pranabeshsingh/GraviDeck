# GraviDeck Expanded Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a complete 2D roguelite deckbuilder physics game ("GraviDeck") in browser using Phaser 3, TypeScript, Vite, and a custom Newtonian vector gravity engine, featuring passive relics, branching sector maps, in-field orbital collectibles, card upgrades, status debuffs, and enemy defense drones.

**Architecture:** Decoupled architecture separating pure TypeScript physics math (`src/physics/`), roguelite state/relics/map (`src/state/`), Phaser 3 visual rendering (`src/scenes/`), and interactive UI components (`src/ui/`). TDD unit testing powered by Vitest guarantees correctness across physics calculations, card logic, and relic triggers.

**Tech Stack:** TypeScript, Vite, Phaser 3, Vitest, HTML5 Canvas / WebGL.

## Global Constraints

- Platform: Modern web browsers (Chrome, Firefox, Safari).
- Framework: Phaser 3.x, Vite, TypeScript 5.x.
- Unit Testing: Vitest for pure TS modules (`src/physics/` and `src/state/`).
- Style: Dark futuristic space theme with glowing Phaser particle and vector graphics.

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
git commit -m "chore: setup vite typescript phaser vitest project scaffolding"
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
git commit -m "feat: add Vector2D physics math module with unit tests"
```

---

### Task 3: GravityBody, Probe, & OrbitalEntity Models

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
  public hp: number = 20; // For breakable asteroids

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
    return megaMultiplier; // 3+ Mega-Crit
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
git commit -m "feat: add GravityBody, Probe, and OrbitalEntity collectible models"
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
import { OrbitalEntity, OrbitalEntityType } from './OrbitalEntity';

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

      // Event Horizon check
      if (body.type === GravityBodyType.SINGULARITY && dist <= body.eventHorizonRadius) {
        if (!hasEventHorizonHarness) {
          probe.isSwallowed = true;
          return;
        }
      }

      // Gravitational acceleration
      if (dist <= body.pullRadius) {
        const normDir = dir.normalize();
        let forceMag = (this.G * body.mass) / Math.max(distSq, 100);

        if (body.type === GravityBodyType.REPULSION_NODE) {
          forceMag = -forceMag;
        }

        totalAcc = totalAcc.add(normDir.scale(forceMag));

        // Slingshot angular sweep tracking
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

    // Check collisions with orbital entities
    for (const entity of orbitalEntities) {
      if (entity.isCollected) continue;
      if (probe.position.dist(entity.position) <= entity.radius + 8) {
        entity.isCollected = true;
      }
    }

    // Euler integration step
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
git commit -m "feat: implement PhysicsEngine with event horizon harness bypass and orbital entity pickups"
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
git commit -m "feat: add TrajectoryPredictor for partial first-bend trajectory previews"
```

---

### Task 6: Relic System & Passive Hook Manager

**Files:**
- Create: `src/state/Relic.ts`
- Create: `tests/state/Relic.test.ts`

**Interfaces:**
- Consumes: `RelicType`, `Probe`, `PlayerShip`
- Produces: `Relic` interface, `RelicCatalog`, `RelicManager` with hooks (`onOrbit`, `onImpact`, `onTurnStart`).

- [ ] **Step 1: Write failing Relic tests**

```typescript
// tests/state/Relic.test.ts
import { describe, it, expect } from 'vitest';
import { RelicManager, RelicCatalog } from '../../src/state/Relic';
import { PlayerShip } from '../../src/state/PlayerShip';

describe('Relic System', () => {
  it('adds Gravity Dynamo relic and triggers +5 shield on orbit hook', () => {
    const rm = new RelicManager();
    const player = new PlayerShip();

    rm.addRelic(RelicCatalog.GRAVITY_DYNAMO);
    rm.triggerOrbitHook(player);

    expect(player.shields).toBe(5);
  });

  it('detects Event Horizon Harness relic ownership', () => {
    const rm = new RelicManager();
    expect(rm.hasRelic('event_horizon_harness')).toBe(false);

    rm.addRelic(RelicCatalog.EVENT_HORIZON_HARNESS);
    expect(rm.hasRelic('event_horizon_harness')).toBe(true);
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npm run test`
Expected: FAIL ("Cannot find module Relic")

- [ ] **Step 3: Implement Relic models and RelicManager**

```typescript
// src/state/Relic.ts
import { PlayerShip } from './PlayerShip';

export interface Relic {
  id: string;
  name: string;
  description: string;
  icon: string;
}

export const RelicCatalog: Record<string, Relic> = {
  EVENT_HORIZON_HARNESS: {
    id: 'event_horizon_harness',
    name: 'Event Horizon Harness',
    description: 'Black Holes no longer swallow probes; they boost speed by +300%',
    icon: '🔮'
  },
  KINETIC_BATTERY: {
    id: 'kinetic_battery',
    name: 'Kinetic Battery',
    description: 'Converts 20% of probe collision speed into Energy next turn',
    icon: '⚡'
  },
  GRAVITY_DYNAMO: {
    id: 'gravity_dynamo',
    name: 'Gravity Dynamo',
    description: 'Sweeping 180° orbits around any body grants +5 Shield',
    icon: '🛡️'
  },
  GRAVITON_AMPLIFIER: {
    id: 'graviton_amplifier',
    name: 'Graviton Amplifier',
    description: 'Slingshot Mega-Crit damage multiplier increased to 8.0x',
    icon: '🚀'
  }
};

export class RelicManager {
  public relics: Relic[] = [];

  addRelic(relic: Relic): void {
    if (!this.hasRelic(relic.id)) {
      this.relics.push(relic);
    }
  }

  hasRelic(id: string): boolean {
    return this.relics.some(r => r.id === id);
  }

  triggerOrbitHook(player: PlayerShip): void {
    if (this.hasRelic('gravity_dynamo')) {
      player.addShields(5);
    }
  }
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npm run test`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add src/state/Relic.ts tests/state/Relic.test.ts
git commit -m "feat: add Relic system with passive rule hooks"
```

---

### Task 7: Status Effects & Card Upgrades

**Files:**
- Create: `src/state/StatusEffect.ts`
- Modify: `src/state/Card.ts`
- Create: `tests/state/StatusEffect.test.ts`

**Interfaces:**
- Consumes: `Card`, `Enemy`
- Produces: `StatusEffectType` enum (`GRAV_LOCKED`, `IONIZED`, `THERMAL_FRICTION`), `StatusTracker`, upgraded `Card` properties (`isUpgraded`, `energyCost`).

- [ ] **Step 1: Write failing StatusEffect and Card Upgrade tests**

```typescript
// tests/state/StatusEffect.test.ts
import { describe, it, expect } from 'vitest';
import { StatusTracker, StatusEffectType } from '../../src/state/StatusEffect';
import { StarterCards } from '../../src/state/Card';

describe('Status Effects & Card Upgrades', () => {
  it('applies Ionized status effect and calculates +50% damage bonus', () => {
    const tracker = new StatusTracker();
    tracker.applyStatus(StatusEffectType.IONIZED, 2);

    expect(tracker.hasStatus(StatusEffectType.IONIZED)).toBe(true);
    expect(tracker.getDamageMultiplier()).toBe(1.5);
  });

  it('upgrades card to reduced energy cost and upgraded name', () => {
    const card = { ...StarterCards[0] };
    const upgraded = { ...card, isUpgraded: true, name: card.name + '+', energyCost: 0 };

    expect(upgraded.name).toBe('Micro-Singularity+');
    expect(upgraded.energyCost).toBe(0);
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npm run test`
Expected: FAIL ("Cannot find module StatusEffect")

- [ ] **Step 3: Implement StatusEffect and Card extensions**

```typescript
// src/state/StatusEffect.ts
export enum StatusEffectType {
  GRAV_LOCKED = 'GRAV_LOCKED',
  IONIZED = 'IONIZED',
  THERMAL_FRICTION = 'THERMAL_FRICTION'
}

export class StatusTracker {
  private durationMap: Map<StatusEffectType, number> = new Map();

  applyStatus(type: StatusEffectType, turns: number): void {
    const existing = this.durationMap.get(type) || 0;
    this.durationMap.set(type, existing + turns);
  }

  hasStatus(type: StatusEffectType): boolean {
    return (this.durationMap.get(type) || 0) > 0;
  }

  getDamageMultiplier(): number {
    return this.hasStatus(StatusEffectType.IONIZED) ? 1.5 : 1.0;
  }

  tickTurnEnd(): void {
    for (const [type, turns] of this.durationMap.entries()) {
      if (turns > 1) {
        this.durationMap.set(type, turns - 1);
      } else {
        this.durationMap.delete(type);
      }
    }
  }
}
```

```typescript
// Modify src/state/Card.ts to include isUpgraded
export interface Card {
  id: string;
  name: string;
  energyCost: number;
  type: CardType;
  description: string;
  color: string;
  isUpgraded?: boolean;
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npm run test`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add src/state/StatusEffect.ts src/state/Card.ts tests/state/StatusEffect.test.ts
git commit -m "feat: add StatusEffect debuff tracker and card upgrade properties"
```

---

### Task 8: Deck Manager & Enemy Defense Drones

**Files:**
- Create: `src/state/Enemy.ts`
- Create: `src/state/Deck.ts`
- Create: `tests/state/Enemy.test.ts`

**Interfaces:**
- Consumes: `Vector2D`, `StatusTracker`
- Produces: `DefenseDrone` model, `Enemy` class with rotating drones, `Deck` manager.

- [ ] **Step 1: Write failing Enemy & Drone tests**

```typescript
// tests/state/Enemy.test.ts
import { describe, it, expect } from 'vitest';
import { Enemy, DefenseDrone } from '../../src/state/Enemy';
import { Vector2D } from '../../src/physics/Vector2D';

describe('Enemy & Point Defense Drones', () => {
  it('rotates defense drones on tick', () => {
    const enemy = new Enemy(new Vector2D(1000, 300), 2 /* droneCount */);
    expect(enemy.drones.length).toBe(2);

    const initialPos = enemy.drones[0].getAbsolutePosition(enemy.position);
    enemy.updateDrones(0.5);
    const newPos = enemy.drones[0].getAbsolutePosition(enemy.position);

    expect(initialPos).not.toEqual(newPos);
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npm run test`
Expected: FAIL ("Cannot find module Enemy")

- [ ] **Step 3: Implement DefenseDrone, Enemy, and Deck**

```typescript
// src/state/Enemy.ts
import { Vector2D } from '../physics/Vector2D';
import { StatusTracker } from './StatusEffect';

export class DefenseDrone {
  constructor(
    public orbitRadius: number = 60,
    public angle: number = 0,
    public orbitSpeed: number = 1.0, // rads per sec
    public isDestroyed: boolean = false
  ) {}

  getAbsolutePosition(enemyPos: Vector2D): Vector2D {
    return new Vector2D(
      enemyPos.x + Math.cos(this.angle) * this.orbitRadius,
      enemyPos.y + Math.sin(this.angle) * this.orbitRadius
    );
  }
}

export class Enemy {
  public maxHp: number = 120;
  public hp: number = 120;
  public shields: number = 0;
  public drones: DefenseDrone[] = [];
  public statusTracker: StatusTracker = new StatusTracker();
  public nextIntentDamage: number = 18;

  constructor(public position: Vector2D = new Vector2D(1100, 250), droneCount: number = 2) {
    for (let i = 0; i < droneCount; i++) {
      this.drones.push(new DefenseDrone(65, (i * 2 * Math.PI) / droneCount, 1.2));
    }
  }

  updateDrones(dt: number): void {
    if (this.statusTracker.hasStatus('GRAV_LOCKED')) return; // Locked in place
    for (const drone of this.drones) {
      drone.angle += drone.orbitSpeed * dt;
    }
  }

  takeDamage(amount: number): void {
    const finalDamage = Math.round(amount * this.statusTracker.getDamageMultiplier());
    let unabsorbed = finalDamage - this.shields;
    this.shields = Math.max(0, this.shields - finalDamage);
    if (unabsorbed > 0) {
      this.hp = Math.max(0, this.hp - unabsorbed);
    }
  }
}
```

```typescript
// src/state/Deck.ts
import { Card } from './Card';

export class Deck {
  public drawPile: Card[] = [];
  public hand: Card[] = [];
  public discardPile: Card[] = [];
  public exhaustPile: Card[] = [];

  constructor(initialCards: Card[]) {
    this.drawPile = [...initialCards];
    this.shuffleDrawPile();
  }

  shuffleDrawPile(): void {
    for (let i = this.drawPile.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [this.drawPile[i], this.drawPile[j]] = [this.drawPile[j], this.drawPile[i]];
    }
  }

  drawHand(count: number = 4): void {
    for (let i = 0; i < count; i++) {
      if (this.drawPile.length === 0) {
        if (this.discardPile.length === 0) break;
        this.drawPile = [...this.discardPile];
        this.discardPile = [];
        this.shuffleDrawPile();
      }
      const card = this.drawPile.pop();
      if (card) this.hand.push(card);
    }
  }

  playCard(cardId: string): Card | null {
    const idx = this.hand.findIndex(c => c.id === cardId);
    if (idx === -1) return null;
    const [played] = this.hand.splice(idx, 1);
    this.discardPile.push(played);
    return played;
  }

  discardHand(): void {
    this.discardPile.push(...this.hand);
    this.hand = [];
  }
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npm run test`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add src/state/Enemy.ts src/state/Deck.ts tests/state/Enemy.test.ts
git commit -m "feat: add Enemy with rotating Point-Defense Drones and Deck manager"
```

---

### Task 9: Combat Turn State Machine

**Files:**
- Create: `src/state/PlayerShip.ts`
- Create: `src/state/CombatStateMachine.ts`
- Create: `tests/state/CombatStateMachine.test.ts`

**Interfaces:**
- Consumes: `Deck`, `RelicManager`, `PlayerShip`, `Enemy`
- Produces: `CombatStateMachine` managing full turn loop.

- [ ] **Step 1: Write failing CombatStateMachine tests**

```typescript
// tests/state/CombatStateMachine.test.ts
import { describe, it, expect } from 'vitest';
import { CombatStateMachine, TurnPhase } from '../../src/state/CombatStateMachine';
import { StarterCards } from '../../src/state/Card';

describe('CombatStateMachine Phase Flow', () => {
  it('starts in DRAW phase and replenishes energy and hand', () => {
    const sm = new CombatStateMachine(StarterCards);
    expect(sm.currentPhase).toBe(TurnPhase.DRAW);
    expect(sm.player.energy).toBe(3);
    expect(sm.deck.hand.length).toBe(4);
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npm run test`
Expected: FAIL ("Cannot find module CombatStateMachine")

- [ ] **Step 3: Implement PlayerShip and CombatStateMachine**

```typescript
// src/state/PlayerShip.ts
import { Vector2D } from '../physics/Vector2D';

export class PlayerShip {
  public maxHp: number = 80;
  public hp: number = 80;
  public shields: number = 0;
  public maxEnergy: number = 3;
  public energy: number = 3;
  public credits: number = 100;
  public position: Vector2D = new Vector2D(120, 550);
  public launchAngle: number = -Math.PI / 4;
  public launchPower: number = 350;

  takeDamage(amount: number): void {
    let unabsorbed = amount - this.shields;
    this.shields = Math.max(0, this.shields - amount);
    if (unabsorbed > 0) {
      this.hp = Math.max(0, this.hp - unabsorbed);
    }
  }

  addShields(amount: number): void {
    this.shields += amount;
  }
}
```

```typescript
// src/state/CombatStateMachine.ts
import { Deck } from './Deck';
import { Card } from './Card';
import { RelicManager } from './Relic';
import { PlayerShip } from './PlayerShip';
import { Enemy } from './Enemy';

export enum TurnPhase {
  DRAW = 'DRAW',
  PLAY = 'PLAY',
  AIM = 'AIM',
  SIMULATE = 'SIMULATE',
  ENEMY = 'ENEMY',
  END = 'END'
}

export class CombatStateMachine {
  public currentPhase: TurnPhase = TurnPhase.DRAW;
  public deck: Deck;
  public relicManager: RelicManager = new RelicManager();
  public player: PlayerShip = new PlayerShip();
  public enemy: Enemy = new Enemy();

  constructor(cards: Card[]) {
    this.deck = new Deck(cards);
    this.startTurn();
  }

  startTurn(): void {
    this.currentPhase = TurnPhase.DRAW;
    this.player.energy = this.player.maxEnergy;
    this.deck.drawHand(4);
    this.currentPhase = TurnPhase.PLAY;
  }

  proceedToAim(): void {
    if (this.currentPhase === TurnPhase.PLAY) {
      this.currentPhase = TurnPhase.AIM;
    }
  }

  startSimulation(): void {
    this.currentPhase = TurnPhase.SIMULATE;
  }

  executeEnemyTurn(): void {
    this.currentPhase = TurnPhase.ENEMY;
    this.player.takeDamage(this.enemy.nextIntentDamage);
    this.deck.discardHand();
    this.enemy.statusTracker.tickTurnEnd();
    this.startTurn();
  }
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npm run test`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add src/state/PlayerShip.ts src/state/CombatStateMachine.ts tests/state/CombatStateMachine.test.ts
git commit -m "feat: implement CombatStateMachine with RelicManager integration"
```

---

### Task 10: Sector Node Map Generator & MapScene

**Files:**
- Create: `src/state/SectorMap.ts`
- Create: `src/scenes/MapScene.ts`
- Create: `tests/state/SectorMap.test.ts`

**Interfaces:**
- Consumes: `MapNode`, `NodeType` (`COMBAT`, `ELITE`, `SHOP`, `EVENT`, `BOSS`)
- Produces: `SectorMapGenerator` generating 4-layer branching node graphs.

- [ ] **Step 1: Write failing SectorMap tests**

```typescript
// tests/state/SectorMap.test.ts
import { describe, it, expect } from 'vitest';
import { SectorMapGenerator, NodeType } from '../../src/state/SectorMap';

describe('SectorMap Generator', () => {
  it('generates 4-layer sector map ending in BOSS node', () => {
    const generator = new SectorMapGenerator();
    const map = generator.generateSectorMap();

    expect(map.layers.length).toBe(4);
    expect(map.layers[3][0].type).toBe(NodeType.BOSS);
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npm run test`
Expected: FAIL ("Cannot find module SectorMap")

- [ ] **Step 3: Implement SectorMapGenerator and MapScene**

```typescript
// src/state/SectorMap.ts
export enum NodeType {
  COMBAT = 'COMBAT',
  ELITE = 'ELITE',
  SHOP = 'SHOP',
  EVENT = 'EVENT',
  BOSS = 'BOSS'
}

export interface MapNode {
  id: string;
  type: NodeType;
  layer: number;
  nextNodes: string[];
  isCompleted?: boolean;
}

export interface SectorMap {
  layers: MapNode[][];
}

export class SectorMapGenerator {
  generateSectorMap(): SectorMap {
    const layer0: MapNode[] = [
      { id: 'node_0_0', type: NodeType.COMBAT, layer: 0, nextNodes: ['node_1_0', 'node_1_1'] },
      { id: 'node_0_1', type: NodeType.COMBAT, layer: 0, nextNodes: ['node_1_1'] }
    ];

    const layer1: MapNode[] = [
      { id: 'node_1_0', type: NodeType.EVENT, layer: 1, nextNodes: ['node_2_0'] },
      { id: 'node_1_1', type: NodeType.SHOP, layer: 1, nextNodes: ['node_2_0', 'node_2_1'] }
    ];

    const layer2: MapNode[] = [
      { id: 'node_2_0', type: NodeType.ELITE, layer: 2, nextNodes: ['boss'] },
      { id: 'node_2_1', type: NodeType.COMBAT, layer: 2, nextNodes: ['boss'] }
    ];

    const bossLayer: MapNode[] = [
      { id: 'boss', type: NodeType.BOSS, layer: 3, nextNodes: [] }
    ];

    return { layers: [layer0, layer1, layer2, bossLayer] };
  }
}
```

```typescript
// src/scenes/MapScene.ts
import Phaser from 'phaser';
import { SectorMapGenerator, SectorMap, MapNode } from '../state/SectorMap';

export class MapScene extends Phaser.Scene {
  private sectorMap: SectorMap;

  constructor() {
    super('MapScene');
    const generator = new SectorMapGenerator();
    this.sectorMap = generator.generateSectorMap();
  }

  create() {
    this.cameras.main.setBackgroundColor('#090d16');
    this.add.text(640, 50, 'FOUNDRY SECTOR MAP', { fontSize: '24px', color: '#38bdf8', fontStyle: 'bold' }).setOrigin(0.5);

    // Render node graph
    this.sectorMap.layers.forEach((layer, lIdx) => {
      layer.forEach((node, nIdx) => {
        const x = 300 + lIdx * 220;
        const y = 200 + nIdx * 150;

        const btn = this.add.text(x, y, `[ ${node.type} ]`, {
          fontSize: '14px',
          color: '#f8fafc',
          backgroundColor: '#1e293b',
          padding: { x: 12, y: 8 }
        }).setOrigin(0.5).setInteractive({ useHandCursor: true });

        btn.on('pointerdown', () => {
          if (node.type === 'SHOP') this.scene.start('ShopScene');
          else if (node.type === 'EVENT') this.scene.start('EventScene');
          else this.scene.start('CombatScene', { nodeType: node.type });
        });
      });
    });
  }
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npm run test`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add src/state/SectorMap.ts src/scenes/MapScene.ts tests/state/SectorMap.test.ts
git commit -m "feat: add SectorMap node generator and MapScene"
```

---

### Task 11: ShopScene & EventScene

**Files:**
- Create: `src/scenes/ShopScene.ts`
- Create: `src/scenes/EventScene.ts`

**Interfaces:**
- Consumes: `PlayerShip`, `Deck`, `RelicCatalog`
- Produces: Interactive Shop UI (buy cards/relics) and Anomaly Event UI.

- [ ] **Step 1: Implement ShopScene and EventScene**

```typescript
// src/scenes/ShopScene.ts
import Phaser from 'phaser';

export class ShopScene extends Phaser.Scene {
  constructor() {
    super('ShopScene');
  }

  create() {
    this.cameras.main.setBackgroundColor('#0b0f19');
    this.add.text(640, 60, 'SALVAGE SHOP & REPAIR', { fontSize: '28px', color: '#f59e0b', fontStyle: 'bold' }).setOrigin(0.5);

    // Buy Relic Button
    const relicBtn = this.add.text(450, 300, 'Buy Event Horizon Harness (150c)', {
      fontSize: '16px', color: '#818cf8', backgroundColor: '#1e293b', padding: { x: 16, y: 10 }
    }).setOrigin(0.5).setInteractive({ useHandCursor: true });

    // Leave Button
    const leaveBtn = this.add.text(640, 550, 'RETURN TO SECTOR MAP', {
      fontSize: '18px', color: '#38bdf8', backgroundColor: '#0f172a', padding: { x: 20, y: 10 }
    }).setOrigin(0.5).setInteractive({ useHandCursor: true });

    leaveBtn.on('pointerdown', () => this.scene.start('MapScene'));
  }
}
```

```typescript
// src/scenes/EventScene.ts
import Phaser from 'phaser';

export class EventScene extends Phaser.Scene {
  constructor() {
    super('EventScene');
  }

  create() {
    this.cameras.main.setBackgroundColor('#0b0f19');
    this.add.text(640, 100, 'GRAVITATIONAL ANOMALY EVENT', { fontSize: '24px', color: '#a855f7', fontStyle: 'bold' }).setOrigin(0.5);
    this.add.text(640, 200, 'You detect an abandoned derelict probe drifting near a pulsar horizon.', { fontSize: '16px', color: '#94a3b8' }).setOrigin(0.5);

    const option1 = this.add.text(640, 320, '1. Salvage Probe Core (Gain +50 Credits, lose 10 HP)', {
      fontSize: '16px', color: '#10b981', backgroundColor: '#1e293b', padding: { x: 16, y: 10 }
    }).setOrigin(0.5).setInteractive({ useHandCursor: true });

    option1.on('pointerdown', () => this.scene.start('MapScene'));
  }
}
```

- [ ] **Step 2: Verify build**

Run: `npm run build`
Expected: Build passes without errors.

- [ ] **Step 3: Commit**

```bash
git add src/scenes/ShopScene.ts src/scenes/EventScene.ts
git commit -m "feat: add ShopScene and EventScene for roguelite meta progression"
```

---

### Task 12: BootScene & CombatScene Canvas Renderer

**Files:**
- Modify: `src/main.ts`
- Modify: `src/scenes/BootScene.ts`
- Modify: `src/scenes/CombatScene.ts`

**Interfaces:**
- Consumes: `GravityBody`, `OrbitalEntity`, `Enemy`
- Produces: Rendered 1280x720 combat viewport with orbiting energy pods, pulsar rings, and rotating defense drones.

- [ ] **Step 1: Update BootScene with procedural textures**

Generate textures for Repulsion Node, Pulsar, Energy Pod, and Defense Drone in `BootScene.ts`.

- [ ] **Step 2: Update CombatScene renderer**

Render planet pull radius, black hole accretion disk, energy containers, and enemy rotating defense drones.

- [ ] **Step 3: Verify build**

Run: `npm run build`
Expected: Passes.

- [ ] **Step 4: Commit**

```bash
git add src/main.ts src/scenes/BootScene.ts src/scenes/CombatScene.ts
git commit -m "feat: render celestial bodies, orbital collectibles, and rotating defense drones in CombatScene"
```

---

### Task 13: TrajectoryRenderer & Launcher Aiming

**Files:**
- Create: `src/ui/TrajectoryRenderer.ts`
- Modify: `src/scenes/CombatScene.ts`

**Interfaces:**
- Consumes: `TrajectoryPredictor`, `Probe`, `GravityBody`
- Produces: Real-time dotted trajectory arc pointer tracking.

- [ ] **Step 1: Implement TrajectoryRenderer**

```typescript
// src/ui/TrajectoryRenderer.ts
import Phaser from 'phaser';
import { Vector2D } from '../physics/Vector2D';
import { TrajectoryPredictor } from '../physics/TrajectoryPredictor';
import { Probe } from '../physics/Probe';
import { GravityBody } from '../physics/GravityBody';

export class TrajectoryRenderer {
  private graphics: Phaser.GameObjects.Graphics;
  private predictor: TrajectoryPredictor = new TrajectoryPredictor();

  constructor(scene: Phaser.Scene) {
    this.graphics = scene.add.graphics();
  }

  renderTrajectory(origin: Vector2D, angle: number, power: number, bodies: GravityBody[]) {
    this.graphics.clear();
    const initialVel = new Vector2D(Math.cos(angle) * power, Math.sin(angle) * power);
    const probe = new Probe(origin, initialVel);

    const points = this.predictor.predict(probe, bodies, 200, 0.03);

    this.graphics.fillStyle(0xf59e0b, 0.9);
    for (let i = 0; i < points.length; i += 3) {
      this.graphics.fillCircle(points[i].x, points[i].y, 3);
    }
  }

  clear() {
    this.graphics.clear();
  }
}
```

- [ ] **Step 2: Commit**

```bash
git add src/ui/TrajectoryRenderer.ts src/scenes/CombatScene.ts
git commit -m "feat: add TrajectoryRenderer with real-time pointer aiming arc"
```

---

### Task 14: Bottom Card Dock, RelicBar & Drag Controls

**Files:**
- Create: `src/ui/CardContainer.ts`
- Create: `src/ui/RelicBar.ts`
- Modify: `src/scenes/CombatScene.ts`

**Interfaces:**
- Consumes: `Card`, `RelicManager`
- Produces: Draggable card game objects and active Relic icons HUD.

- [ ] **Step 1: Implement CardContainer and RelicBar**

```typescript
// src/ui/RelicBar.ts
import Phaser from 'phaser';
import { RelicManager } from '../state/Relic';

export class RelicBar {
  private container: Phaser.GameObjects.Container;

  constructor(scene: Phaser.Scene, rm: RelicManager) {
    this.container = scene.add.container(20, 50);
    rm.relics.forEach((relic, idx) => {
      const text = scene.add.text(idx * 35, 0, relic.icon, { fontSize: '20px' });
      this.container.add(text);
    });
  }
}
```

```typescript
// src/ui/CardContainer.ts
import Phaser from 'phaser';
import { Card } from '../state/Card';

export class CardContainer extends Phaser.GameObjects.Container {
  public cardData: Card;

  constructor(scene: Phaser.Scene, x: number, y: number, card: Card, onDropCallback: (card: Card, dropX: number, dropY: number) => void) {
    super(scene, x, y);
    this.cardData = card;

    const bg = scene.add.rectangle(0, 0, 110, 140, 0x1e293b)
      .setStrokeStyle(2, Phaser.Display.Color.HexStringToColor(card.color).color);
    this.add(bg);

    const titleText = card.isUpgraded ? card.name + '+' : card.name;
    const title = scene.add.text(-48, -55, titleText, { fontSize: '11px', color: '#f8fafc', fontStyle: 'bold', wordWrap: { width: 95 } });
    this.add(title);

    const costBadge = scene.add.circle(42, -55, 12, 0x2563eb);
    const costText = scene.add.text(37, -62, `${card.energyCost}⚡`, { fontSize: '10px', color: '#ffffff' });
    this.add(costBadge);
    this.add(costText);

    this.setSize(110, 140);
    this.setInteractive();
    scene.input.setDraggable(this);

    this.on('drag', (_p: any, dragX: number, dragY: number) => this.setPosition(dragX, dragY));
    this.on('dragend', (p: Phaser.Input.Pointer) => onDropCallback(this.cardData, p.x, p.y));

    scene.add.existing(this);
  }
}
```

- [ ] **Step 2: Commit**

```bash
git add src/ui/CardContainer.ts src/ui/RelicBar.ts src/scenes/CombatScene.ts
git commit -m "feat: add CardContainer drag controls and RelicBar HUD"
```

---

### Task 15: Probe Launch Real-Time Simulation & Collision Resolution

**Files:**
- Create: `src/ui/HUD.ts`
- Modify: `src/scenes/CombatScene.ts`

**Interfaces:**
- Consumes: `PhysicsEngine`, `Probe`, `Enemy`, `CombatStateMachine`
- Produces: Launch Probe trigger button, 60 FPS physics update loop, drone interception checks, kinetic damage calculation, and screen shake on Mega-Crits.

- [ ] **Step 1: Implement HUD**

```typescript
// src/ui/HUD.ts
import Phaser from 'phaser';
import { CombatStateMachine } from '../state/CombatStateMachine';

export class HUD {
  private playerHpText: Phaser.GameObjects.Text;
  private enemyHpText: Phaser.GameObjects.Text;
  private energyText: Phaser.GameObjects.Text;

  constructor(scene: Phaser.Scene, private sm: CombatStateMachine) {
    this.playerHpText = scene.add.text(20, 680, '', { fontSize: '14px', color: '#38bdf8', fontStyle: 'bold' });
    this.enemyHpText = scene.add.text(1050, 20, '', { fontSize: '14px', color: '#ef4444', fontStyle: 'bold' });
    this.energyText = scene.add.text(200, 680, '', { fontSize: '14px', color: '#f59e0b', fontStyle: 'bold' });
    this.update();
  }

  update() {
    this.playerHpText.setText(`SHIP HP: ${this.sm.player.hp}/${this.sm.player.maxHp} [Shield: ${this.sm.player.shields}]`);
    this.enemyHpText.setText(`ENEMY HP: ${this.sm.enemy.hp}/${this.sm.enemy.maxHp}`);
    this.energyText.setText(`ENERGY: ${this.sm.player.energy}/${this.sm.player.maxEnergy}⚡`);
  }
}
```

- [ ] **Step 2: Wire simulation loop & drone interception in CombatScene**

In `CombatScene.ts`:
1. Check if probe collides with any `drone.getAbsolutePosition(enemy.position)`. If hit, destroy drone and stop probe.
2. If probe hits `enemy.position`, apply `probe.getCurrentDamage(hasAmplifier ? 8.0 : 4.0)`.
3. If `slingshotCount >= 3`, trigger `this.cameras.main.shake(300, 0.02)`.

- [ ] **Step 3: Commit**

```bash
git add src/ui/HUD.ts src/scenes/CombatScene.ts
git commit -m "feat: implement real-time simulation with defense drone interception and Mega-Crit screen shake"
```

---

### Task 16: GameOverScene & Full Roguelite Loop Verification

**Files:**
- Create: `src/scenes/GameOverScene.ts`
- Modify: `src/main.ts`
- Modify: `src/scenes/CombatScene.ts`

**Interfaces:**
- Consumes: Victory/Defeat state
- Produces: Game Over screen with return to Map button.

- [ ] **Step 1: Implement GameOverScene**

```typescript
// src/scenes/GameOverScene.ts
import Phaser from 'phaser';

export class GameOverScene extends Phaser.Scene {
  constructor() {
    super('GameOverScene');
  }

  create(data: { result: 'VICTORY' | 'DEFEAT' }) {
    this.cameras.main.setBackgroundColor('#090d16');

    const titleColor = data.result === 'VICTORY' ? '#10b981' : '#ef4444';
    this.add.text(640, 280, data.result, { fontSize: '48px', color: titleColor, fontStyle: 'bold' }).setOrigin(0.5);

    const btn = this.add.text(640, 440, 'RETURN TO SECTOR MAP', {
      fontSize: '20px', color: '#38bdf8', backgroundColor: '#1e293b', padding: { x: 20, y: 10 }
    }).setOrigin(0.5).setInteractive({ useHandCursor: true });

    btn.on('pointerdown', () => this.scene.start('MapScene'));
  }
}
```

- [ ] **Step 2: Update main.ts scene list**

Add `MapScene`, `ShopScene`, `EventScene`, `GameOverScene` to Phaser GameConfig in `main.ts`.

- [ ] **Step 3: Run full verification suite**

Run: `npm run build && npm run test`
Expected: Everything compiles cleanly and 100% of Vitest unit tests pass.

- [ ] **Step 4: Commit**

```bash
git add src/scenes/GameOverScene.ts src/main.ts src/scenes/CombatScene.ts
git commit -m "feat: complete full roguelite game loop with MapScene navigation and victory/defeat screens"
```
