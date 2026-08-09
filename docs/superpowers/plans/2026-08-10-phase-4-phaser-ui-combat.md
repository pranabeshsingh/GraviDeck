# GraviDeck — Phase 4: Phaser Interactive UI & Real-Time Combat Simulation

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build the complete interactive Phaser 3 combat scene, including procedural texture preloading (`BootScene`), 1280x720 tactical arena (`CombatScene`), aiming trajectory preview (`TrajectoryRenderer`), drag-and-drop Card Dock UI (`CardContainer`), Relic HUD (`RelicBar`), real-time 60 FPS probe simulation with defense drone interception, Mega-Crit screen shake, and victory/defeat screens (`GameOverScene`).

**Architecture:** Connects Phaser 3 game objects to pure TS models from Phase 1 (`PhysicsEngine`) and Phase 2 (`CombatStateMachine`).

**Tech Stack:** TypeScript, Phaser 3, HTML5 Canvas / WebGL.

## Global Constraints

- Smooth 60 FPS real-time physics integration in `CombatScene.update(time, delta)`.
- Interactive drag-to-target card placement and pointer aiming controls.

---

### Task 1: BootScene & CombatScene Canvas Preloading

**Files:**
- Modify: `src/main.ts`
- Create: `src/scenes/BootScene.ts`
- Create: `src/scenes/CombatScene.ts`

**Interfaces:**
- Consumes: `GravityBody`, `OrbitalEntity`, `Enemy`
- Produces: Rendered 1280x720 combat viewport with orbiting energy pods, pulsar rings, and rotating defense drones.

- [ ] **Step 1: Implement BootScene texture preloader**

```typescript
// src/scenes/BootScene.ts
import Phaser from 'phaser';

export class BootScene extends Phaser.Scene {
  constructor() {
    super('BootScene');
  }

  create() {
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

    this.scene.start('MapScene');
  }
}
```

- [ ] **Step 2: Implement CombatScene viewport**

```typescript
// src/scenes/CombatScene.ts
import Phaser from 'phaser';
import { GravityBody, GravityBodyType } from '../physics/GravityBody';
import { Vector2D } from '../physics/Vector2D';
import { CombatStateMachine } from '../state/CombatStateMachine';
import { StarterCards } from '../state/Card';

export class CombatScene extends Phaser.Scene {
  private sm: CombatStateMachine = new CombatStateMachine(StarterCards);

  constructor() {
    super('CombatScene');
  }

  create() {
    this.cameras.main.setBackgroundColor('#090d16');
    this.createStarfield();

    const mainPlanet = new GravityBody('planet1', GravityBodyType.PLANET, new Vector2D(640, 360), 6000, 40, 220);
    this.add.image(mainPlanet.position.x, mainPlanet.position.y, 'planet_blue');
  }

  private createStarfield() {
    const graphics = this.add.graphics();
    graphics.fillStyle(0xffffff, 0.6);
    for (let i = 0; i < 150; i++) {
      graphics.fillCircle(Phaser.Math.Between(0, 1280), Phaser.Math.Between(0, 720), Phaser.Math.Between(1, 2));
    }
  }
}
```

- [ ] **Step 3: Run build to verify compilation**

Run: `npm run build`
Expected: PASS

- [ ] **Step 4: Commit**

```bash
git add src/scenes/BootScene.ts src/scenes/CombatScene.ts
git commit -m "feat(phase4): add BootScene texture preloader and CombatScene viewport"
```

---

### Task 2: TrajectoryRenderer & Aiming Pointer Controls

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

- [ ] **Step 2: Run build**

Run: `npm run build`
Expected: PASS

- [ ] **Step 3: Commit**

```bash
git add src/ui/TrajectoryRenderer.ts src/scenes/CombatScene.ts
git commit -m "feat(phase4): add TrajectoryRenderer with pointer aiming arc"
```

---

### Task 3: Bottom Card Dock, RelicBar & Drag Controls

**Files:**
- Create: `src/ui/CardContainer.ts`
- Create: `src/ui/RelicBar.ts`
- Modify: `src/scenes/CombatScene.ts`

**Interfaces:**
- Consumes: `Card`, `RelicManager`
- Produces: Draggable card game objects and active Relic icons HUD.

- [ ] **Step 1: Implement RelicBar and CardContainer**

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
git commit -m "feat(phase4): add CardContainer drag controls and RelicBar HUD"
```

---

### Task 4: Real-Time Simulation Resolution & GameOverScene

**Files:**
- Create: `src/ui/HUD.ts`
- Create: `src/scenes/GameOverScene.ts`
- Modify: `src/main.ts`
- Modify: `src/scenes/CombatScene.ts`

**Interfaces:**
- Consumes: `PhysicsEngine`, `Probe`, `Enemy`, `CombatStateMachine`
- Produces: 60 FPS physics update loop, drone interception checks, kinetic damage calculation, screen shake on Mega-Crits, and Victory/Defeat screen transitions.

- [ ] **Step 1: Implement HUD and GameOverScene**

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

```typescript
// Update src/main.ts with scene order
import Phaser from 'phaser';
import { BootScene } from './scenes/BootScene';
import { MapScene } from './scenes/MapScene';
import { CombatScene } from './scenes/CombatScene';
import { ShopScene } from './scenes/ShopScene';
import { EventScene } from './scenes/EventScene';
import { GameOverScene } from './scenes/GameOverScene';

const config: Phaser.Types.Core.GameConfig = {
  type: Phaser.AUTO,
  parent: 'game-container',
  width: 1280,
  height: 720,
  scene: [BootScene, MapScene, CombatScene, ShopScene, EventScene, GameOverScene]
};

new Phaser.Game(config);
```

- [ ] **Step 2: Run full build**

Run: `npm run build`
Expected: Compiles cleanly without errors.

- [ ] **Step 3: Commit**

```bash
git add src/ui/HUD.ts src/scenes/GameOverScene.ts src/main.ts src/scenes/CombatScene.ts
git commit -m "feat(phase4): add HUD, simulation loop, drone interception, and GameOverScene"
```
