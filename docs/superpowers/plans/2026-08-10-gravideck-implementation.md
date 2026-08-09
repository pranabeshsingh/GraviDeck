# GraviDeck Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a playable web-based 2D roguelite deckbuilder physics game ("GraviDeck") in browser using Phaser 3, TypeScript, Vite, and a custom Newtonian vector gravity engine.

**Architecture:** A decoupled architecture separating pure TypeScript physics math (`src/physics/`), deck/turn state machine (`src/state/`), Phaser 3 visual rendering (`src/scenes/`), and interactive UI components (`src/ui/`). Unit testing powered by Vitest ensures physics and card logic are fully verified.

**Tech Stack:** TypeScript, Vite, Phaser 3, Vitest, HTML5 Canvas / WebGL.

## Global Constraints

- Platform: Modern web browsers (Chrome, Firefox, Safari).
- Framework: Phaser 3.x, Vite, TypeScript 5.x.
- Unit Testing: Vitest for pure TS modules (`src/physics/` and `src/state/`).
- Style: Vanilla CSS and Phaser Graphics/Particle effects for high visual flair.

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
  "version": "0.1.0",
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
Expected: FAIL with "Cannot find module '../../src/physics/Vector2D'"

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

### Task 3: GravityBody & Probe Data Models

**Files:**
- Create: `src/physics/GravityBody.ts`
- Create: `src/physics/Probe.ts`
- Create: `tests/physics/GravityBody.test.ts`

**Interfaces:**
- Consumes: `Vector2D`
- Produces: `GravityBody` class, `GravityBodyType` enum, `Probe` class.

- [ ] **Step 1: Write failing GravityBody & Probe tests**

```typescript
// tests/physics/GravityBody.test.ts
import { describe, it, expect } from 'vitest';
import { GravityBody, GravityBodyType } from '../../src/physics/GravityBody';
import { Probe } from '../../src/physics/Probe';
import { Vector2D } from '../../src/physics/Vector2D';

describe('GravityBody & Probe Models', () => {
  it('initializes planet and singularity bodies with radii', () => {
    const planet = new GravityBody('p1', GravityBodyType.PLANET, new Vector2D(400, 300), 5000, 40, 150);
    expect(planet.mass).toBe(5000);
    expect(planet.pullRadius).toBe(150);
  });

  it('initializes Probe with position, velocity, and zero slingshots', () => {
    const probe = new Probe(new Vector2D(100, 100), new Vector2D(200, 0));
    expect(probe.slingshotCount).toBe(0);
    expect(probe.isSwallowed).toBe(false);
    expect(probe.initialSpeed).toBe(200);
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npm run test`
Expected: FAIL ("Cannot find module GravityBody")

- [ ] **Step 3: Implement GravityBody and Probe**

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
    public mass: number,             // Gravitational magnitude multiplier
    public bodyRadius: number,       // Solid collision radius
    public pullRadius: number,       // Sphere of gravitational influence
    public eventHorizonRadius: number = 15, // For black holes
    public pulsePeriodMs: number = 0 // For pulsars
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

  getSpeedMultiplier(): number {
    if (this.slingshotCount === 0) return 1.0;
    if (this.slingshotCount === 1) return 1.5;
    if (this.slingshotCount === 2) return 2.5;
    return 4.0; // 3+ Mega-Crit
  }

  getCurrentDamage(): number {
    const currentSpeed = this.velocity.length();
    const speedRatio = this.initialSpeed > 0 ? currentSpeed / this.initialSpeed : 1.0;
    const ratioSq = speedRatio * speedRatio;
    return Math.round(this.baseDamage * ratioSq * this.getSpeedMultiplier());
  }
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npm run test`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add src/physics/GravityBody.ts src/physics/Probe.ts tests/physics/GravityBody.test.ts
git commit -m "feat: add GravityBody and Probe domain models with slingshot multipliers"
```

---

### Task 4: Custom Newtonian PhysicsEngine & Slingshot Tracker

**Files:**
- Create: `src/physics/PhysicsEngine.ts`
- Create: `tests/physics/PhysicsEngine.test.ts`

**Interfaces:**
- Consumes: `Vector2D`, `GravityBody`, `Probe`
- Produces: `PhysicsEngine` class with `step(probe, bodies, dt)` method.

- [ ] **Step 1: Write failing PhysicsEngine tests**

```typescript
// tests/physics/PhysicsEngine.test.ts
import { describe, it, expect } from 'vitest';
import { PhysicsEngine } from '../../src/physics/PhysicsEngine';
import { GravityBody, GravityBodyType } from '../../src/physics/GravityBody';
import { Probe } from '../../src/physics/Probe';
import { Vector2D } from '../../src/physics/Vector2D';

describe('PhysicsEngine Gravitational Calculations', () => {
  it('accelerates probe towards a standard planet', () => {
    const engine = new PhysicsEngine(500);
    const planet = new GravityBody('p1', GravityBodyType.PLANET, new Vector2D(400, 300), 1000, 30, 200);
    const probe = new Probe(new Vector2D(200, 300), new Vector2D(0, 0));

    engine.step(probe, [planet], 0.1);

    // Velocity should be directed right (x > 0) towards planet
    expect(probe.velocity.x).toBeGreaterThan(0);
    expect(probe.position.x).toBeGreaterThan(200);
  });

  it('repels probe away from a Repulsion Node', () => {
    const engine = new PhysicsEngine(500);
    const node = new GravityBody('r1', GravityBodyType.REPULSION_NODE, new Vector2D(400, 300), 1000, 30, 200);
    const probe = new Probe(new Vector2D(200, 300), new Vector2D(0, 0));

    engine.step(probe, [node], 0.1);

    // Velocity should be directed left (x < 0) away from repulsion node
    expect(probe.velocity.x).toBeLessThan(0);
  });

  it('swallows probe if it enters a Singularity event horizon', () => {
    const engine = new PhysicsEngine(500);
    const bh = new GravityBody('bh1', GravityBodyType.SINGULARITY, new Vector2D(300, 300), 5000, 20, 200, 15);
    const probe = new Probe(new Vector2D(305, 300), new Vector2D(0, 0));

    engine.step(probe, [bh], 0.1);

    expect(probe.isSwallowed).toBe(true);
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

export class PhysicsEngine {
  private lastAngles: Map<string, number> = new Map(); // bodyId -> last angle
  private accumAngles: Map<string, number> = new Map(); // bodyId -> total rads

  constructor(public G: number = 500) {}

  step(probe: Probe, bodies: GravityBody[], dt: number): void {
    if (probe.isSwallowed || probe.isDestroyed) return;

    let totalAcc = new Vector2D(0, 0);

    for (const body of bodies) {
      const dir = body.position.sub(probe.position);
      const distSq = dir.lengthSq();
      const dist = Math.sqrt(distSq);

      if (dist < 1) continue; // Avoid singularity divide by zero

      // 1. Black hole event horizon check
      if (body.type === GravityBodyType.SINGULARITY && dist <= body.eventHorizonRadius) {
        probe.isSwallowed = true;
        return;
      }

      // 2. Gravitational force calculation if within influence
      if (dist <= body.pullRadius) {
        const normDir = dir.normalize();
        let forceMag = (this.G * body.mass) / Math.max(distSq, 100);

        if (body.type === GravityBodyType.REPULSION_NODE) {
          forceMag = -forceMag; // Push away
        }

        totalAcc = totalAcc.add(normDir.scale(forceMag));

        // 3. Angular revolution slingshot tracking
        const currentAngle = Math.atan2(probe.position.y - body.position.y, probe.position.x - body.position.x);
        const lastAngle = this.lastAngles.get(body.id);

        if (lastAngle !== undefined) {
          let diff = currentAngle - lastAngle;
          while (diff > Math.PI) diff -= 2 * Math.PI;
          while (diff < -Math.PI) diff += 2 * Math.PI;

          const currentAccum = (this.accumAngles.get(body.id) || 0) + Math.abs(diff);
          this.accumAngles.set(body.id, currentAccum);

          if (currentAccum >= Math.PI) { // Completed 180 deg bend
            probe.slingshotCount += 1;
            this.accumAngles.set(body.id, 0); // Reset for next loop
          }
        }
        this.lastAngles.set(body.id, currentAngle);
      } else {
        this.lastAngles.delete(body.id);
        this.accumAngles.delete(body.id);
      }
    }

    // Euler integration step
    probe.velocity = probe.velocity.add(totalAcc.scale(dt));
    probe.position = probe.position.add(probe.velocity.scale(dt));

    // Append to trail
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
git commit -m "feat: implement 2D Newtonian PhysicsEngine with slingshot tracking and black hole swallows"
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
      const posBefore = ghost.position.clone();
      this.simEngine.step(ghost, bodies, dt);

      if (ghost.isSwallowed || ghost.isDestroyed) break;

      const currentDir = ghost.velocity.normalize();
      if (prevDir !== null) {
        // Detect inflection point where dot product indicates major direction curve completion
        const turnDot = prevDir.dot(currentDir);
        if (turnDot < 0.7) { // Significant bend (> ~45 deg)
          inflectionCount++;
          if (inflectionCount >= 1) { // Truncate at first bend
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

### Task 6: Card & Deck State Models

**Files:**
- Create: `src/state/Card.ts`
- Create: `src/state/Deck.ts`
- Create: `tests/state/Deck.test.ts`

**Interfaces:**
- Consumes: `Vector2D`, `GravityBody`
- Produces: `Card` interface, `CardCatalog` constants, `Deck` manager class.

- [ ] **Step 1: Write failing Card and Deck tests**

```typescript
// tests/state/Deck.test.ts
import { describe, it, expect } from 'vitest';
import { Deck } from '../../src/state/Deck';
import { StarterCards } from '../../src/state/Card';

describe('Deck State Manager', () => {
  it('draws cards from draw pile into hand up to hand size', () => {
    const deck = new Deck(StarterCards);
    expect(deck.drawPile.length).toBe(StarterCards.length);

    deck.drawHand(3);
    expect(deck.hand.length).toBe(3);
    expect(deck.drawPile.length).toBe(StarterCards.length - 3);
  });

  it('discards hand cards to discard pile at turn end', () => {
    const deck = new Deck(StarterCards);
    deck.drawHand(3);
    deck.discardHand();

    expect(deck.hand.length).toBe(0);
    expect(deck.discardPile.length).toBe(3);
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npm run test`
Expected: FAIL ("Cannot find module Deck")

- [ ] **Step 3: Implement Card definitions and Deck manager**

```typescript
// src/state/Card.ts
export type CardType = 'field' | 'probe' | 'defense';

export interface Card {
  id: string;
  name: string;
  energyCost: number;
  type: CardType;
  description: string;
  color: string;
}

export const StarterCards: Card[] = [
  {
    id: 'singularity_1',
    name: 'Micro-Singularity',
    energyCost: 1,
    type: 'field',
    description: 'Spawn mini black hole at target location',
    color: '#818cf8'
  },
  {
    id: 'ion_1',
    name: 'Ion Deflector',
    energyCost: 1,
    type: 'field',
    description: 'Spawn a push-node repelling passing probes',
    color: '#38bdf8'
  },
  {
    id: 'whip_1',
    name: 'Orbital Whip',
    energyCost: 1,
    type: 'probe',
    description: 'Next launch +30% damage per slingshot loop',
    color: '#f59e0b'
  },
  {
    id: 'splitter_1',
    name: 'Graviton Splitter',
    energyCost: 2,
    type: 'probe',
    description: 'Probe splits into 3 warheads inside gravity fields',
    color: '#10b981'
  },
  {
    id: 'shield_1',
    name: 'Debris Shield',
    energyCost: 1,
    type: 'defense',
    description: 'Gain +15 Shield against enemy counter-attacks',
    color: '#64748b'
  }
];
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
git add src/state/Card.ts src/state/Deck.ts tests/state/Deck.test.ts
git commit -m "feat: add Card catalog and Deck pile manager"
```

---

### Task 7: Combat Turn State Machine & Ship Entities

**Files:**
- Create: `src/state/PlayerShip.ts`
- Create: `src/state/Enemy.ts`
- Create: `src/state/CombatStateMachine.ts`
- Create: `tests/state/CombatStateMachine.test.ts`

**Interfaces:**
- Consumes: `Deck`, `Vector2D`
- Produces: `PlayerShip`, `Enemy`, `CombatStateMachine` with states (`DRAW`, `PLAY`, `AIM`, `SIMULATE`, `ENEMY`, `END`).

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

  it('transitions from PLAY to AIM phase when player confirms play', () => {
    const sm = new CombatStateMachine(StarterCards);
    sm.proceedToAim();
    expect(sm.currentPhase).toBe(TurnPhase.AIM);
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npm run test`
Expected: FAIL ("Cannot find module CombatStateMachine")

- [ ] **Step 3: Implement PlayerShip, Enemy, and CombatStateMachine**

```typescript
// src/state/PlayerShip.ts
import { Vector2D } from '../physics/Vector2D';

export class PlayerShip {
  public maxHp: number = 80;
  public hp: number = 80;
  public shields: number = 0;
  public maxEnergy: number = 3;
  public energy: number = 3;
  public position: Vector2D = new Vector2D(120, 550);
  public launchAngle: number = -Math.PI / 4; // 45 deg upwards
  public launchPower: number = 350; // impulse magnitude

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
// src/state/Enemy.ts
import { Vector2D } from '../physics/Vector2D';

export class Enemy {
  public maxHp: number = 100;
  public hp: number = 100;
  public shields: number = 0;
  public position: Vector2D = new Vector2D(1100, 200);
  public nextIntentDamage: number = 15;

  takeDamage(amount: number): void {
    let unabsorbed = amount - this.shields;
    this.shields = Math.max(0, this.shields - amount);
    if (unabsorbed > 0) {
      this.hp = Math.max(0, this.hp - unabsorbed);
    }
  }
}
```

```typescript
// src/state/CombatStateMachine.ts
import { Deck } from './Deck';
import { Card } from './Card';
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
    this.startTurn();
  }
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npm run test`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add src/state/PlayerShip.ts src/state/Enemy.ts src/state/CombatStateMachine.ts tests/state/CombatStateMachine.test.ts
git commit -m "feat: implement CombatStateMachine with turn phases and player/enemy HP entities"
```

---

### Task 8: Phaser Canvas Boot & Background Starfield Scene

**Files:**
- Modify: `src/main.ts`
- Create: `src/scenes/BootScene.ts`
- Create: `src/scenes/CombatScene.ts`

**Interfaces:**
- Consumes: `Phaser.Game`
- Produces: Visual 1280x720 Phaser WebGL canvas showing glowing starfield background and planet body graphics.

- [ ] **Step 1: Implement BootScene and CombatScene**

```typescript
// src/scenes/BootScene.ts
import Phaser from 'phaser';

export class BootScene extends Phaser.Scene {
  constructor() {
    super('BootScene');
  }

  create() {
    // Generate procedural glowing textures for celestial bodies
    const graphics = this.add.graphics();

    // Planet texture
    graphics.fillStyle(0x6366f1, 1);
    graphics.fillCircle(30, 30, 30);
    graphics.lineStyle(3, 0x818cf8, 1);
    graphics.strokeCircle(30, 30, 30);
    graphics.generateTexture('planet_blue', 60, 60);
    graphics.clear();

    // Singularity (Black Hole) texture
    graphics.fillStyle(0x0f172a, 1);
    graphics.fillCircle(25, 25, 25);
    graphics.lineStyle(2, 0xa855f7, 1);
    graphics.strokeCircle(25, 25, 25);
    graphics.generateTexture('black_hole', 50, 50);
    graphics.clear();

    // Probe texture
    graphics.fillStyle(0x38bdf8, 1);
    graphics.fillCircle(8, 8, 8);
    graphics.generateTexture('probe', 16, 16);

    this.scene.start('CombatScene');
  }
}
```

```typescript
// src/scenes/CombatScene.ts
import Phaser from 'phaser';
import { GravityBody, GravityBodyType } from '../physics/GravityBody';
import { Vector2D } from '../physics/Vector2D';

export class CombatScene extends Phaser.Scene {
  private bodies: GravityBody[] = [];

  constructor() {
    super('CombatScene');
  }

  create() {
    // 1. Dark Starfield Background
    this.cameras.main.setBackgroundColor('#090d16');
    this.createStarfield();

    // 2. Initial Natural Planet
    const mainPlanet = new GravityBody('planet1', GravityBodyType.PLANET, new Vector2D(640, 360), 6000, 40, 220);
    this.bodies.push(mainPlanet);

    // Draw Planet
    this.add.image(mainPlanet.position.x, mainPlanet.position.y, 'planet_blue');

    // Draw Pull Radius Ring
    const ringGraphics = this.add.graphics();
    ringGraphics.lineStyle(1, 0x6366f1, 0.4);
    ringGraphics.strokeCircle(mainPlanet.position.x, mainPlanet.position.y, mainPlanet.pullRadius);

    // Label
    this.add.text(20, 20, 'SECTOR GRID // GRAVITY FOUNDRY', {
      fontFamily: 'system-ui',
      fontSize: '16px',
      color: '#38bdf8'
    });
  }

  private createStarfield() {
    const graphics = this.add.graphics();
    graphics.fillStyle(0xffffff, 0.6);
    for (let i = 0; i < 150; i++) {
      const x = Phaser.Math.Between(0, 1280);
      const y = Phaser.Math.Between(0, 720);
      const size = Phaser.Math.Between(1, 2);
      graphics.fillCircle(x, y, size);
    }
  }
}
```

```typescript
// src/main.ts
import Phaser from 'phaser';
import { BootScene } from './scenes/BootScene';
import { CombatScene } from './scenes/CombatScene';

const config: Phaser.Types.Core.GameConfig = {
  type: Phaser.AUTO,
  parent: 'game-container',
  width: 1280,
  height: 720,
  scene: [BootScene, CombatScene]
};

new Phaser.Game(config);
```

- [ ] **Step 2: Test dev server rendering**

Run: `npm run build`
Expected: TypeScript builds without errors.

- [ ] **Step 3: Commit**

```bash
git add src/main.ts src/scenes/BootScene.ts src/scenes/CombatScene.ts
git commit -m "feat: initialize Phaser 3 game canvas, BootScene and starfield CombatScene"
```

---

### Task 9: TrajectoryRenderer & Turret Aiming

**Files:**
- Create: `src/ui/TrajectoryRenderer.ts`
- Modify: `src/scenes/CombatScene.ts`

**Interfaces:**
- Consumes: `TrajectoryPredictor`, `Probe`, `GravityBody`, `Phaser.Graphics`
- Produces: Aiming pointer controls updating trajectory prediction graphics in real-time.

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
    for (let i = 0; i < points.length; i += 3) { // Draw dotted line
      this.graphics.fillCircle(points[i].x, points[i].y, 3);
    }
  }

  clear() {
    this.graphics.clear();
  }
}
```

- [ ] **Step 2: Wire pointer aim in CombatScene**

Add aiming pointer event listeners in `CombatScene.ts` calling `renderTrajectory`.

- [ ] **Step 3: Verify build**

Run: `npm run build`
Expected: Build passes without errors.

- [ ] **Step 4: Commit**

```bash
git add src/ui/TrajectoryRenderer.ts src/scenes/CombatScene.ts
git commit -m "feat: add TrajectoryRenderer with real-time pointer aiming arc"
```

---

### Task 10: Interactive Bottom Card Dock & Drag-to-Field UI

**Files:**
- Create: `src/ui/CardContainer.ts`
- Modify: `src/scenes/CombatScene.ts`

**Interfaces:**
- Consumes: `Card`, `CombatStateMachine`
- Produces: Phaser Card GameObjects with drag-and-drop support.

- [ ] **Step 1: Implement CardContainer**

```typescript
// src/ui/CardContainer.ts
import Phaser from 'phaser';
import { Card } from '../state/Card';

export class CardContainer extends Phaser.GameObjects.Container {
  public cardData: Card;
  private background: Phaser.GameObjects.Rectangle;

  constructor(scene: Phaser.Scene, x: number, y: number, card: Card, onDropCallback: (card: Card, dropX: number, dropY: number) => void) {
    super(scene, x, y);
    this.cardData = card;

    // Card dimensions: 110x140
    this.background = scene.add.rectangle(0, 0, 110, 140, 0x1e293b)
      .setStrokeStyle(2, Phaser.Display.Color.HexStringToColor(card.color).color);
    this.add(this.background);

    const title = scene.add.text(-48, -55, card.name, {
      fontSize: '11px',
      color: '#f8fafc',
      fontStyle: 'bold',
      wordWrap: { width: 95 }
    });
    this.add(title);

    const costBadge = scene.add.circle(42, -55, 12, 0x2563eb);
    const costText = scene.add.text(37, -62, `${card.energyCost}⚡`, { fontSize: '10px', color: '#ffffff' });
    this.add(costBadge);
    this.add(costText);

    const desc = scene.add.text(-48, 0, card.description, {
      fontSize: '9px',
      color: '#94a3b8',
      wordWrap: { width: 95 }
    });
    this.add(desc);

    // Make interactive & draggable
    this.setSize(110, 140);
    this.setInteractive();
    scene.input.setDraggable(this);

    this.on('drag', (_pointer: Phaser.Input.Pointer, dragX: number, dragY: number) => {
      this.setPosition(dragX, dragY);
    });

    this.on('dragend', (pointer: Phaser.Input.Pointer) => {
      onDropCallback(this.cardData, pointer.x, pointer.y);
    });

    scene.add.existing(this);
  }
}
```

- [ ] **Step 2: Build Card Dock in CombatScene**

In `CombatScene.ts`, spawn `CardContainer` instances along the bottom screen bar (`y = 630`) from `stateMachine.deck.hand`. When dropped, spawn corresponding `GravityBody` (if field card) or grant shields (if defense card).

- [ ] **Step 3: Verify build**

Run: `npm run build`
Expected: Build passes cleanly.

- [ ] **Step 4: Commit**

```bash
git add src/ui/CardContainer.ts src/scenes/CombatScene.ts
git commit -m "feat: add CardContainer with drag-and-drop card dock UI"
```

---

### Task 11: Probe Launch & Real-time Combat Simulation Resolution

**Files:**
- Create: `src/ui/HUD.ts`
- Modify: `src/scenes/CombatScene.ts`

**Interfaces:**
- Consumes: `PhysicsEngine`, `Probe`, `CombatStateMachine`
- Produces: Launch Probe trigger button, real-time 60 FPS probe simulation, collision damage detection on enemy ship, and HP UI updates.

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

- [ ] **Step 2: Add Fire Button and Simulation Loop in CombatScene**

1. Create a "LAUNCH PROBE" button at bottom right (`x = 1150, y = 650`).
2. Clicking Launch instantiates active `Probe`, clears trajectory preview, and sets `isSimulating = true`.
3. In `update(time, delta)`, call `physicsEngine.step(probe, bodies, delta / 1000)`.
4. Draw probe sprite and trailing glowing line.
5. If `probe.position.dist(enemy.position) <= 30`, calculate `probe.getCurrentDamage()`, subtract from `enemy.hp`, trigger screen shake if `slingshotCount >= 3`, and trigger `stateMachine.executeEnemyTurn()`.

- [ ] **Step 3: Verify build**

Run: `npm run build && npm run test`
Expected: Build passes and all tests pass.

- [ ] **Step 4: Commit**

```bash
git add src/ui/HUD.ts src/scenes/CombatScene.ts
git commit -m "feat: add HUD and full real-time probe launch combat simulation loop"
```

---

### Task 12: GameOverScene & Full Game Loop Polish

**Files:**
- Create: `src/scenes/GameOverScene.ts`
- Modify: `src/main.ts`
- Modify: `src/scenes/CombatScene.ts`

**Interfaces:**
- Consumes: Victory/Defeat state
- Produces: Game over screen with restart button.

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
    this.add.text(640, 280, data.result, {
      fontSize: '48px',
      color: titleColor,
      fontStyle: 'bold'
    }).setOrigin(0.5);

    const sub = data.result === 'VICTORY'
      ? 'Target Destroyed. Gravitational Anomaly Neutralized.'
      : 'Ship Hull Breached. Gravity Foundry Claimed Your Salvage.';
    this.add.text(640, 350, sub, { fontSize: '18px', color: '#94a3b8' }).setOrigin(0.5);

    const restartBtn = this.add.text(640, 440, 'RESTART SIMULATION', {
      fontSize: '20px',
      color: '#38bdf8',
      backgroundColor: '#1e293b',
      padding: { x: 20, y: 10 }
    }).setOrigin(0.5).setInteractive({ useHandCursor: true });

    restartBtn.on('pointerdown', () => {
      this.scene.start('CombatScene');
    });
  }
}
```

- [ ] **Step 2: Connect CombatScene to GameOverScene**

If `enemy.hp <= 0`, transition to `GameOverScene` with `VICTORY`.
If `player.hp <= 0`, transition to `GameOverScene` with `DEFEAT`.

- [ ] **Step 3: Run full verification suite**

Run: `npm run build && npm run test`
Expected: Everything compiles cleanly and test suite passes 100%.

- [ ] **Step 4: Commit**

```bash
git add src/scenes/GameOverScene.ts src/main.ts src/scenes/CombatScene.ts
git commit -m "feat: add GameOverScene with Victory/Defeat screen and restart loop"
```
