# "GraviDeck" (Gravity Foundry) — Technical Design & Game Architecture Specification

Date: 2026-08-10
Status: Approved Design Spec
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
│       └── specs/
│           └── 2026-08-10-gravideck-design.md
├── src/
│   ├── main.ts                   # Phaser 3 game configuration & launcher
│   ├── physics/
│   │   ├── Vector2D.ts           # Pure 2D vector algebra (add, sub, scale, norm, dot)
│   │   ├── GravityBody.ts        # Planet, Singularity, RepulsionNode, Pulsar models
│   │   ├── Probe.ts              # Probe particle state, trail history, active traits
│   │   ├── PhysicsEngine.ts      # Update loop: Euler force integration, event horizon checks
│   │   └── TrajectoryPredictor.ts# Calculates partial 1st-bend predicted path arc
│   ├── state/
│   │   ├── Card.ts               # Card interface, definitions, and effect execution hooks
│   │   ├── Deck.ts               # Deck, Hand, Discard, and Exhaust pile manager
│   │   ├── PlayerShip.ts         # Player HP, Shields, Energy pool, launch angle & impulse
│   │   ├── Enemy.ts              # Enemy HP, Shields, intent preview, movement pattern
│   │   └── CombatStateMachine.ts # Turn phases (DRAW, PLAY, AIM, SIMULATE, ENEMY, END)
│   ├── scenes/
│   │   ├── BootScene.ts          # Asset preloader & procedural asset creation
│   │   ├── CombatScene.ts        # Primary scene: Canvas arena + Bottom Card Dock UI
│   │   └── GameOverScene.ts      # Victory / Defeat overlay screen
│   └── ui/
│       ├── CardContainer.ts      # Phaser interactive drag-and-drop Card GameObject
│       ├── HUD.ts                # HP/Shield bars, Energy orb, Turn phase banner, Fire button
│       └── TrajectoryRenderer.ts # Draws dotted trajectory prediction line
```

---

## 4. Physics Engine & Slingshot Kinetic Math

### A. Gravitational Acceleration & Force Field
For every frame step $dt$, gravitational acceleration $\vec{a}_{\text{total}}$ acting on a probe is:

$$\vec{a}_{\text{total}} = \sum_{i} \frac{G \cdot M_i}{r_i^2} \hat{r}_i$$

where $G$ is the game gravitational constant (default = $500$), $M_i$ is the mass of body $i$, $r_i$ is distance from probe to body center, and $\hat{r}_i$ is the unit direction vector.

### B. Gravity Body Behavior
1. **Standard Planet:** Inward attraction force.
2. **Repulsion Node (White Hole / Ion Field):** Negative mass force vector pushing passing probes away.
3. **Singularity (Mini Black Hole):** Heavy attraction force.
   * If distance $r < r_{\text{horizon}}$, probe is swallowed (destroyed, 0 damage).
   * If $r_{\text{horizon}} \le r \le r_{\text{slingshot}}$, probe receives maximum speed boost without destruction.
4. **Pulsar Node:** Emits periodic radial force pulses every $T_{\text{pulse}}$ seconds.

### C. Slingshot Multipliers & Kinetic Damage
* **Slingshot Counter:** The physics engine tracks the angular displacement $\Delta \theta$ accumulated around each body's pull radius. Completing $\ge \pi$ radians (180°) around a body increments `slingshotCount` by 1.
* **Speed & Damage Multipliers:**
  * 0 Slingshots: $1.0\times$
  * 1 Slingshot: $1.5\times$
  * 2 Slingshots: $2.5\times$
  * 3+ Slingshots: $4.0\times$ (**Mega-Crit** + screen shake & particle explosion)
* **Impact Damage Calculation:**
  $$\text{Final Damage} = \text{BaseDamage} \times \left(\frac{v_{\text{impact}}}{v_{\text{launch}}}\right)^2 \times \text{SlingshotMultiplier} + \text{CardBonus}$$

### D. Partial (First-Bend) Trajectory Preview
* While aiming or dragging cards, `TrajectoryPredictor` steps a ghost probe up to 300 steps forward.
* Prediction line truncates immediately after the probe reaches its first gravitational inflection point (where curvature vector reverses), rewarding physics intuition while providing feedback for the initial slingshot angle.

---

## 5. UI Layout & Combat State Machine

### A. UI Layout (Bottom Card Dock)
* **Upper Screen (80% height):** 2D Tactical Gravity Arena showing starfield, planets, player ship launcher, enemy ships, gravity wells, and trajectory lines.
* **Bottom Screen (20% height):** Fanned-out card hand with energy cost badges and hover expansion.
* **Top Status Bar:** Player HP & Shields, Energy Pool (3/3), Enemy HP & Intent preview.

### B. Card Drag-and-Drop Interaction
* **Field Modifiers:** Drag card directly onto screen coordinates in space to spawn or modify gravity bodies.
* **Probe Enhancers:** Drag card onto Player Ship to equip traits (Splitter, EMP, Fire Trail) before launching.
* **Tactical Defense Cards:** Drag card to player ship to generate Debris Shields or Anchor enemies.

### C. Turn Phase State Machine
1. **DRAW Phase:** Draw 4–5 cards from Deck to Hand; reset Energy to max (e.g. 3⚡).
2. **PLAY Phase:** Player drags cards to play. Temporary gravity fields render preview.
3. **AIM & LAUNCH Phase:** Adjust turret angle & impulse power. Release probe to enter simulation.
4. **SIMULATION Phase:** Physics engine steps probe over 5–10s. Collision triggers damage and effects.
5. **ENEMY Phase:** Surviving enemies move/re-orbit and execute intended attacks against player ship.
6. **TURN END Phase:** Remaining hand cards discard; temporary fields tick down duration.

---

## 6. Starter Deck Archetypes

* **Singularity (1⚡):** Spawn a temporary mini black hole at target coordinates for 1 turn.
* **Ion Deflector (1⚡):** Spawn a repulsion node that pushes probes away.
* **Orbital Whip (1⚡):** Next launch gains +30% damage per full orbital revolution.
* **Graviton Splitter (2⚡):** When probe passes through a planet pull radius, splits into 3 warheads.
* **Debris Shield (1⚡):** Spawn 3 orbital defense asteroids around ship absorbing 15 incoming damage.

---

## 7. Implementation Roadmap

1. **Phase 1 (Vite + Phaser Setup & Physics Engine):** Initialize project, build `Vector2D`, `GravityBody`, `Probe`, and `PhysicsEngine` with 1 planet + turret launcher.
2. **Phase 2 (Trajectory & Combat Resolution):** Implement partial trajectory line, enemy target collision, and kinetic velocity damage scaling.
3. **Phase 3 (Deck State & Drag Card UI):** Build card hand UI, drag-and-drop placement, energy pool, and turn state machine.
4. **Phase 4 (Visual Polish & Audio):** Add particle glow trails for black holes/probes, screen shake on Mega-Crits, audio SFX, and game victory/defeat loop.
