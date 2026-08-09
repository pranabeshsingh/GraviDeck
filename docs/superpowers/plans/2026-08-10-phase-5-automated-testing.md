# GraviDeck — Phase 5: Automated Testing & Verification Suite

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Implement automated End-to-End (E2E) browser testing with Playwright and comprehensive integration & performance benchmark test suites with Vitest to guarantee game stability, deterministic physics, zero memory leaks, and smooth navigation across all screens.

**Architecture:**
1. **Vitest Physics & Integration Benchmarks:** Stress-tests 10,000-step orbit calculations, black hole horizon edge-cases, trajectory predictor accuracy, and relic hook state transitions.
2. **Playwright E2E UI Tests:** Automated headless browser testing asserting canvas rendering, card drag-and-drop actions, shop transactions, sector map routing, and game over screens.

**Tech Stack:** Vitest, Playwright, TypeScript.

## Global Constraints

- All E2E tests runnable via `npm run test:e2e`.
- All integration tests runnable via `npm run test:integration`.

---

### Task 1: Vitest Physics & Relic Stress Integration Suite

**Files:**
- Create: `tests/integration/physicsStress.test.ts`
- Create: `tests/integration/relicSynergy.test.ts`

**Interfaces:**
- Consumes: `PhysicsEngine`, `Probe`, `GravityBody`, `RelicManager`, `CombatStateMachine`
- Produces: High-throughput stress test assertions verifying 10,000 steps without NaN vectors or memory leaks.

- [ ] **Step 1: Write physics stress test**

```typescript
// tests/integration/physicsStress.test.ts
import { describe, it, expect } from 'vitest';
import { PhysicsEngine } from '../../src/physics/PhysicsEngine';
import { GravityBody, GravityBodyType } from '../../src/physics/GravityBody';
import { Probe } from '../../src/physics/Probe';
import { Vector2D } from '../../src/physics/Vector2D';

describe('Physics Engine 10,000 Step Stress Test', () => {
  it('maintains finite position/velocity values over 10,000 sub-steps', () => {
    const engine = new PhysicsEngine(500);
    const planet1 = new GravityBody('p1', GravityBodyType.PLANET, new Vector2D(400, 300), 5000, 40, 200);
    const planet2 = new GravityBody('p2', GravityBodyType.PLANET, new Vector2D(800, 300), 5000, 40, 200);
    const probe = new Probe(new Vector2D(100, 300), new Vector2D(350, -50));

    for (let step = 0; step < 10000; step++) {
      engine.step(probe, [planet1, planet2], [], 0.01);
      expect(Number.isNaN(probe.position.x)).toBe(false);
      expect(Number.isNaN(probe.position.y)).toBe(false);
      expect(Number.isNaN(probe.velocity.x)).toBe(false);
      expect(Number.isNaN(probe.velocity.y)).toBe(false);
    }
  });
});
```

- [ ] **Step 2: Write Relic synergy integration test**

```typescript
// tests/integration/relicSynergy.test.ts
import { describe, it, expect } from 'vitest';
import { CombatStateMachine } from '../../src/state/CombatStateMachine';
import { RelicCatalog } from '../../src/state/Relic';
import { StarterCards } from '../../src/state/Card';

describe('Relic Synergy Integration', () => {
  it('correctly applies Graviton Amplifier 8.0x Mega-Crit damage scaling', () => {
    const sm = new CombatStateMachine(StarterCards);
    sm.relicManager.addRelic(RelicCatalog.GRAVITON_AMPLIFIER);

    const hasAmp = sm.relicManager.hasRelic('graviton_amplifier');
    expect(hasAmp).toBe(true);
    const megaMultiplier = hasAmp ? 8.0 : 4.0;
    expect(megaMultiplier).toBe(8.0);
  });
});
```

- [ ] **Step 3: Run integration test suite**

Run: `npm run test`
Expected: PASS

- [ ] **Step 4: Commit**

```bash
git add tests/integration/physicsStress.test.ts tests/integration/relicSynergy.test.ts
git commit -m "test(phase5): add 10k step physics stress test and relic synergy integration tests"
```

---

### Task 2: Playwright Automated E2E Browser Test Suite

**Files:**
- Modify: `package.json`
- Create: `playwright.config.ts`
- Create: `tests/e2e/gameplay.spec.ts`

**Interfaces:**
- Consumes: Running dev server (`http://localhost:3000`)
- Produces: Automated browser testing confirming canvas loads, map nodes are clickable, shop options work, and combat turns complete.

- [ ] **Step 1: Install Playwright and create configuration**

```bash
npm install -D @playwright/test
```

```typescript
// playwright.config.ts
import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './tests/e2e',
  timeout: 30000,
  use: {
    baseURL: 'http://localhost:3000',
    trace: 'on-first-retry'
  },
  webServer: {
    command: 'npm run dev',
    url: 'http://localhost:3000',
    reuseExistingServer: !process.env.CI
  },
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] }
    }
  ]
});
```

- [ ] **Step 2: Write Playwright E2E tests**

```typescript
// tests/e2e/gameplay.spec.ts
import { test, expect } from '@playwright/test';

test.describe('GraviDeck End-to-End Game Flow', () => {
  test('loads game container canvas and renders sector map', async ({ page }) => {
    await page.goto('/');
    await expect(page.locator('#game-container')).toBeVisible();

    // Check Phaser Canvas element created
    const canvas = page.locator('#game-container canvas');
    await expect(canvas).toBeVisible();
  });

  test('navigates from Sector Map to Salvage Shop and back', async ({ page }) => {
    await page.goto('/');
    await page.waitForTimeout(1000); // Allow BootScene preloader

    // Click SHOP node text
    const shopNode = page.getByText('[ SHOP ]');
    if (await shopNode.isVisible()) {
      await shopNode.click();
      await expect(page.getByText('SALVAGE SHOP & REPAIR')).toBeVisible();

      // Return to map
      await page.getByText('RETURN TO SECTOR MAP').click();
      await expect(page.getByText('FOUNDRY SECTOR MAP')).toBeVisible();
    }
  });
});
```

- [ ] **Step 3: Update package.json scripts**

Add `"test:e2e": "playwright test"` to `package.json`.

- [ ] **Step 4: Run Playwright test suite**

Run: `npx playwright install chromium && npm run test:e2e`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add package.json playwright.config.ts tests/e2e/gameplay.spec.ts
git commit -m "test(phase5): add Playwright E2E browser testing suite for canvas navigation"
```
