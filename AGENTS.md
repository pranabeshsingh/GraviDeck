# Agent Guidelines & Engineering Standards — GraviDeck

This document establishes the architecture rules, coding standards, and testing discipline for AI coding agents working on the GraviDeck codebase.

---

## 1. Core Architecture Principles

1. **Decouple Physics Math from Visual Rendering:**
   * All physics calculations (`Vector2D`, `GravityBody`, `Probe`, `OrbitalEntity`, `PhysicsEngine`, `TrajectoryPredictor`) live strictly in `src/physics/`.
   * Modules in `src/physics/` MUST NEVER import Phaser 3 objects or browser DOM APIs. They must remain pure TypeScript so they can be unit-tested via Vitest in node environments.

2. **Decouple State Machine from Scene Graph:**
   * Game state, card management, relics, debuffs, and turn phases live in `src/state/` (`CombatStateMachine.ts`, `Deck.ts`, `Relic.ts`, `StatusEffect.ts`, `SectorMap.ts`).
   * Phaser scenes (`src/scenes/`) read from and write to state models, acting purely as the visual and interactive layer.

3. **Strict Test-Driven Development (TDD):**
   * Before adding or modifying physics formulas or state logic, write corresponding failing tests in `tests/physics/` or `tests/state/`.
   * Always verify that `npm run test` passes 100% cleanly before committing.

---

## 2. Directory Structure & Conventions

```
src/
├── main.ts                   # Phaser game launcher
├── physics/                  # PURE TypeScript physics & vector math engine (NO Phaser imports)
├── state/                    # PURE TypeScript game models & turn state machine (NO Phaser imports)
├── scenes/                   # Phaser 3 Game Scenes (BootScene, MapScene, CombatScene, ShopScene, EventScene)
└── ui/                       # Phaser GameObjects (CardContainer, HUD, RelicBar, TrajectoryRenderer)
```

---

## 3. Code & Physics Math Rules

* **Vector Operations:** Always use `Vector2D` methods (`add`, `sub`, `scale`, `normalize`, `dist`, `dot`) rather than manual `x`/`y` mutations to keep physics math predictable and immutable.
* **Euler Integration:** `PhysicsEngine.step(probe, bodies, orbitalEntities, dt)` uses $dt$ in seconds (default `0.03s`).
* **Slingshot Angle Sweeps:** Angular tracking measures cumulative radians $\Delta \theta \ge \pi$ (180°) around a body's pull radius to increment `slingshotCount`.
* **TypeScript Strictness:** Strict mode is enabled (`tsconfig.json`). Do NOT use `any` types. Provide explicit parameter and return types for all public interfaces.

---

## 4. Verification Workflow

Before marking any task or feature as complete, execute:

```bash
npm run test    # Runs Vitest unit and integration suite
npm run build   # Type-checks with tsc and verifies Vite production bundling
```

All tests must pass and the build must compile without errors.
