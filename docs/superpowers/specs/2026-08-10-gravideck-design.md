# "GraviDeck" (Gravity Foundry) — Technical Design & Game Architecture Specification

Date: 2026-08-10
Status: Approved Design Spec (Expanded Roguelite Systems)
Repository: GraviDeck

---

## 1. Executive Summary & Core Concept

**GraviDeck** is a 2D roguelite deckbuilder physics game set in an unstable asteroid field known as *The Foundry*. 

Instead of traditional static laser projectiles, players launch **Grav-Probes** whose flight paths are governed by gravitational forces (Planets, Black Holes, Repulsion Nodes, Pulsars). 

Players manipulate gravity fields by placing celestial cards onto the battlefield and equipping probe enhancers before launching their shots. Damage scales dynamically with kinetic velocity ($E_k = \frac{1}{2}mv^2$) and gravitational slingshot loops around celestial bodies.

---

## 2. Core Tech Stack & Framework Selection

* **Frontend Engine:** **Phaser 3** (HTML5 Canvas / WebGL renderer, particle effects, scene management, input event pipeline).
* **Language & Tooling:** **TypeScript** with **Vite** for fast bundling and strong type safety.
* **Physics Integration:** **Custom 2D Newtonian Vector Integrator** (decoupled pure TypeScript math engine for 100% deterministic gravity slingshot simulation and trajectory prediction).

---

## 3. Directory & File Structure

```
gravideck/
├── index.html
├── package.json
├── tsconfig.json
├── vite.config.ts
├── docs/
│   └── superpowers/
│       ├── specs/
│       │   └── 2026-08-10-gravideck-design.md
│       └── plans/
│           └── 2026-08-10-gravideck-implementation.md
├── src/
│   ├── main.ts                   # Phaser 3 game configuration & launcher
│   ├── physics/
│   │   ├── Vector2D.ts           # Pure 2D vector algebra (add, sub, scale, norm, dot)
│   │   ├── GravityBody.ts        # Planet, Singularity, RepulsionNode, Pulsar models
│   │   ├── Probe.ts              # Probe particle state, trail history, active traits
│   │   ├── OrbitalEntity.ts     # Energy Pods, Antimatter Crates, Asteroid Debris
│   │   ├── PhysicsEngine.ts      # Update loop: Euler force integration, event horizon checks
│   │   └── TrajectoryPredictor.ts# Calculates partial 1st-bend predicted path arc
│   ├── state/
│   │   ├── Card.ts               # Card interface, upgrade system (+ cards), effect callbacks
│   │   ├── Relic.ts              # Passive relics/artifacts modifying physics & game rules
│   │   ├── StatusEffect.ts       # Debuffs: Grav-Locked, Ionized, Thermal Friction
│   │   ├── Deck.ts               # Deck, Hand, Discard, and Exhaust pile manager
│   │   ├── PlayerShip.ts         # Player HP, Shields, Energy pool, launch angle & impulse
│   │   ├── Enemy.ts              # Enemy HP, Shields, Intent, Defense Drones, orbital movement
│   │   ├── SectorMap.ts          # Node-based branching map (Combat, Elite, Shop, Event, Boss)
│   │   └── CombatStateMachine.ts # Turn phases (DRAW, PLAY, AIM, SIMULATE, ENEMY, END)
│   ├── scenes/
│   │   ├── BootScene.ts          # Asset preloader & procedural asset creation
│   │   ├── MapScene.ts           # Sector Node Map scene
│   │   ├── CombatScene.ts        # Primary scene: Canvas arena + Bottom Card Dock UI
│   │   ├── ShopScene.ts          # Shop & card upgrade/removal UI
│   │   ├── EventScene.ts         # Anomaly text event choices
│   │   └── GameOverScene.ts      # Victory / Defeat overlay screen
│   └── ui/
│       ├── CardContainer.ts      # Phaser interactive drag-and-drop Card GameObject
│       ├── HUD.ts                # HP/Shield bars, Energy orb, Turn phase banner, Launch button
│       ├── RelicBar.ts           # Passive Relic display HUD
│       └── TrajectoryRenderer.ts # Draws dotted trajectory prediction line
```

---

## 4. Physics Engine & Expanded Mechanics

### A. Gravitational Acceleration & Force Field
For every frame step $dt$, gravitational acceleration $\vec{a}_{\text{total}}$ acting on a probe is:

$$\vec{a}_{\text{total}} = \sum_{i} \frac{G \cdot M_i}{r_i^2} \hat{r}_i$$

where $G$ is the game gravitational constant (default = $500$), $M_i$ is the mass of body $i$, $r_i$ is distance from probe to body center, and $\hat{r}_i$ is the unit direction vector.

### B. Gravity Body Types
1. **Standard Planet:** Inward attraction force.
2. **Repulsion Node (White Hole / Ion Field):** Negative mass force vector pushing passing probes away.
3. **Singularity (Mini Black Hole):** Heavy attraction force.
   * If distance $r < r_{\text{horizon}}$, probe is swallowed (destroyed, 0 damage), unless player possesses **Event Horizon Harness** relic.
   * If $r_{\text{horizon}} \le r \le r_{\text{slingshot}}$, probe receives maximum speed boost without destruction.
4. **Pulsar Node:** Emits periodic radial force pulses every $T_{\text{pulse}}$ seconds.

### C. In-Field Orbital Collectibles & Obstacles (`OrbitalEntity.ts`)
* **Energy Containers:** Orbiting planets. Hitting them with a probe instantly grants +1 Energy to the player.
* **Antimatter Crates:** Explode on probe impact, dealing 25 AOE damage to surrounding targets.
* **Asteroid Fields:** Breakable rock barriers that absorb probe impacts, requiring gravity curvature to shoot around.

### D. Slingshot Multipliers & Kinetic Damage
* **Slingshot Counter:** The physics engine tracks the angular displacement $\Delta \theta$ accumulated around each body's pull radius. Completing $\ge \pi$ radians (180°) around a body increments `slingshotCount` by 1.
* **Speed & Damage Multipliers:**
  * 0 Slingshots: $1.0\times$
  * 1 Slingshot: $1.5\times$
  * 2 Slingshots: $2.5\times$
  * 3+ Slingshots: $4.0\times$ (**Mega-Crit** + screen shake & particle explosion)
* **Impact Damage Calculation:**
  $$\text{Final Damage} = \text{BaseDamage} \times \left(\frac{v_{\text{impact}}}{v_{\text{launch}}}\right)^2 \times \text{SlingshotMultiplier} + \text{CardBonus}$$

---

## 5. Expanded Roguelite Systems

### A. Passive Relics & Artifact System (`Relic.ts`)
* **Event Horizon Harness:** Black Holes no longer swallow probes; instead they boost speed by +300%.
* **Kinetic Battery:** Converts 20% of probe impact speed into Energy for the next turn.
* **Gravity Dynamo:** Sweeping 180° orbits around any body grants +5 Shield automatically.
* **Graviton Amplifier:** Increases slingshot Mega-Crit multiplier from $4.0\times \rightarrow 8.0\times$.

### B. Sector Node Map (`SectorMap.ts` & `MapScene.ts`)
* Procedurally generated 4-layer branching node graph per sector:
  * **Combat Node:** Standard enemy encounter.
  * **Elite Node:** High difficulty combat yielding guaranteed Relic rewards.
  * **Shop Node:** Spend Credits to buy cards, relics, upgrade cards, or purge unwanted cards.
  * **Anomaly Event Node:** Narrative risk/reward events (e.g. trade HP for rare cards).
  * **Boss Node:** Sector Boss encounter with Point-Defense Drones.

### C. Card Upgrades & Status Debuffs (`StatusEffect.ts`)
* **Upgrades ($+$ cards):** Upgrading at Shops reduces Energy cost or improves effect values (e.g. *Micro-Singularity+* costs 0⚡, *Graviton Splitter+* splits into 5 warheads).
* **Debuffs:**
  * **Grav-Locked:** Enemy ship is locked in place and cannot dodge or rotate shields for 2 turns.
  * **Ionized:** Takes +50% kinetic damage from all incoming hits.
  * **Thermal Friction:** Takes passive damage over time proportional to probe speed passing nearby.

### D. Enemy Point-Defense Drones & Rotating Shields
* Enemies spawn with 1-3 **Point-Defense Drones** orbiting them at radius $R_{\text{drone}}$.
* Drones intercept direct head-on probe shots, forcing the player to use gravitational slingshots to curve shots around the drones and hit vulnerable unshielded engine thrusters!

---

## 6. UI Layout & Combat State Machine

### A. UI Layout (Bottom Card Dock + Relic Bar)
* **Top Screen Bar:** Relic Bar showing collected passive icons, Player HP/Shields, Energy Pool (3/3), Enemy HP & Intent preview.
* **Center Screen (75% height):** 2D Tactical Gravity Arena showing starfield, planets, orbital collectibles, enemy drones, player ship launcher, and trajectory lines.
* **Bottom Screen (20% height):** Fanned-out card hand with energy cost badges and hover expansion.

### B. Turn Phase State Machine
1. **DRAW Phase:** Draw 4–5 cards from Deck; reset Energy; trigger turn-start Relic hooks.
2. **PLAY Phase:** Player drags field/probe/defense cards.
3. **AIM & LAUNCH Phase:** Adjust turret angle & impulse power. Release probe to enter simulation.
4. **SIMULATION Phase:** Physics engine steps probe over 5–10s. Collisions trigger damage, orbital entity pickups, and debuffs.
5. **ENEMY Phase:** Surviving enemies execute intended attacks and rotate defense drones.
6. **TURN END Phase:** Discard hand cards; tick down status debuffs.

---

## 7. Implementation Roadmap

1. **Phase 1 (Physics Core & Collectibles):** Vite/Phaser setup, `Vector2D`, `GravityBody`, `Probe`, `OrbitalEntity`, `PhysicsEngine` (with 180° slingshot tracking), and `TrajectoryPredictor`.
2. **Phase 2 (Expanded State, Cards, Relics & Debuffs):** `Card` upgrade system, `Relic` manager, `StatusEffect` tracker, `Enemy` with `DefenseDrone`, and `CombatStateMachine`.
3. **Phase 3 (Sector Map & Scenes):** `SectorMap` generator, `MapScene`, `ShopScene`, `EventScene`, and `GameOverScene`.
4. **Phase 4 (Phaser Visual UI & Drag Controls):** Canvas graphics, `CardContainer` drag-to-space, `RelicBar`, `HUD`, `TrajectoryRenderer`, and full real-time combat simulation.
5. **Phase 5 (Polish & Balancing):** Audio SFX, particle glow trails, Mega-Crit screen shake, and end-to-end game loop testing.
