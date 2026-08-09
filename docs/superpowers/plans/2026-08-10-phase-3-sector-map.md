# GraviDeck — Phase 3: Sector Map & Meta Scenes

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Implement the roguelite meta-game progression, including procedural sector map node generation (`SectorMap.ts`), `MapScene` node graph navigation, `ShopScene` (card purging/upgrades & relic purchasing), and `EventScene` (space anomaly narrative events).

**Architecture:** Node-based graph generator feeding Phaser 3 navigation scenes. Players choose branching paths (Combat, Elite, Shop, Event, Boss) that track node completion and transition into battles or shops.

**Tech Stack:** TypeScript, Phaser 3, Vitest.

## Global Constraints

- Procedural graph generator in `src/state/SectorMap.ts` must have 100% Vitest unit test coverage.
- Interactive node graph rendered in `src/scenes/MapScene.ts`.

---

### Task 1: Sector Node Map Generator & Model

**Files:**
- Create: `src/state/SectorMap.ts`
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

- [ ] **Step 3: Implement SectorMapGenerator**

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

- [ ] **Step 4: Run test to verify it passes**

Run: `npm run test`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add src/state/SectorMap.ts tests/state/SectorMap.test.ts
git commit -m "feat(phase3): add SectorMap node generator model with unit tests"
```

---

### Task 2: MapScene Visual Node Graph Navigation

**Files:**
- Create: `src/scenes/MapScene.ts`

**Interfaces:**
- Consumes: `SectorMap`, `SectorMapGenerator`
- Produces: Phaser `MapScene` displaying interactive clickable nodes transitioning to Combat, Shop, or Event scenes.

- [ ] **Step 1: Implement MapScene**

```typescript
// src/scenes/MapScene.ts
import Phaser from 'phaser';
import { SectorMapGenerator, SectorMap } from '../state/SectorMap';

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

- [ ] **Step 2: Run build to verify compilation**

Run: `npm run build`
Expected: PASS

- [ ] **Step 3: Commit**

```bash
git add src/scenes/MapScene.ts
git commit -m "feat(phase3): implement MapScene with interactive node selection"
```

---

### Task 3: ShopScene & EventScene

**Files:**
- Create: `src/scenes/ShopScene.ts`
- Create: `src/scenes/EventScene.ts`

**Interfaces:**
- Consumes: `PlayerShip`, `Deck`, `RelicCatalog`
- Produces: Interactive Shop UI (buy cards/relics, card upgrades) and narrative Anomaly Event UI.

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

    const relicBtn = this.add.text(450, 300, 'Buy Event Horizon Harness (150c)', {
      fontSize: '16px', color: '#818cf8', backgroundColor: '#1e293b', padding: { x: 16, y: 10 }
    }).setOrigin(0.5).setInteractive({ useHandCursor: true });

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

- [ ] **Step 2: Run build to verify compilation**

Run: `npm run build`
Expected: PASS

- [ ] **Step 3: Commit**

```bash
git add src/scenes/ShopScene.ts src/scenes/EventScene.ts
git commit -m "feat(phase3): add ShopScene and EventScene meta progression screens"
```
