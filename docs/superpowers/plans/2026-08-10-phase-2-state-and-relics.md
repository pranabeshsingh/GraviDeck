# GraviDeck — Phase 2: Roguelite State Engine & Relics

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Implement the core state management system for GraviDeck, including passive Relics (`RelicManager`), Status Effects (`StatusTracker`), Card upgrades, Deck draw/discard piles, Enemy entities with rotating Point-Defense Drones, and the Turn Phase State Machine (`CombatStateMachine`).

**Architecture:** Pure TypeScript state models handling game logic, energy deduction, relic rule overrides, status debuff decay, and phase transitions (`DRAW` $\rightarrow$ `PLAY` $\rightarrow$ `AIM` $\rightarrow$ `SIMULATE` $\rightarrow$ `ENEMY` $\rightarrow$ `END`).

**Tech Stack:** TypeScript, Vitest.

## Global Constraints

- Pure TS classes in `src/state/` with 100% Vitest unit test coverage.
- Decoupled from Phaser UI rendering.

---

### Task 1: Relic System & Passive Hook Manager

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
git commit -m "feat(phase2): add Relic system with passive rule hooks"
```

---

### Task 2: Status Effects & Card Upgrades

**Files:**
- Create: `src/state/StatusEffect.ts`
- Create: `src/state/Card.ts`
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

- [ ] **Step 3: Implement StatusEffect and Card definitions**

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
// src/state/Card.ts
export type CardType = 'field' | 'probe' | 'defense';

export interface Card {
  id: string;
  name: string;
  energyCost: number;
  type: CardType;
  description: string;
  color: string;
  isUpgraded?: boolean;
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

- [ ] **Step 4: Run test to verify it passes**

Run: `npm run test`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add src/state/StatusEffect.ts src/state/Card.ts tests/state/StatusEffect.test.ts
git commit -m "feat(phase2): add StatusEffect debuff tracker and Card definitions"
```

---

### Task 3: Deck Manager & Enemy Defense Drones

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
    const enemy = new Enemy(new Vector2D(1000, 300), 2);
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
    public orbitRadius: number = 65,
    public angle: number = 0,
    public orbitSpeed: number = 1.2,
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
    if (this.statusTracker.hasStatus('GRAV_LOCKED')) return;
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
git commit -m "feat(phase2): add Enemy with rotating Point-Defense Drones and Deck manager"
```

---

### Task 4: Combat Turn State Machine & PlayerShip

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
git commit -m "feat(phase2): implement CombatStateMachine with RelicManager integration"
```
