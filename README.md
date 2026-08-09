# GraviDeck ("Gravity Foundry")

[![TypeScript](https://img.shields.io/badge/TypeScript-5.3-blue.svg)](https://www.typescriptlang.org/)
[![Phaser 3](https://img.shields.io/badge/Phaser-3.80-orange.svg)](https://phaser.io/)
[![Vite](https://img.shields.io/badge/Vite-5.1-purple.svg)](https://vitejs.dev/)
[![Vitest](https://img.shields.io/badge/Vitest-1.3-green.svg)](https://vitest.dev/)

> A tactical 2D roguelite deckbuilder physics game set in an unstable, gravity-warped asteroid field.

Instead of direct lasers or static projectiles, you play as a salvage engineer launching **Grav-Probes**. The battlefield is populated by celestial gravitational bodies (Planets, Mini Black Holes, Repulsion Nodes, Pulsar Beacons) and floating orbital collectibles. Use gravity as your primary weapon: sling probe shots *around* celestial bodies to accelerate them, bend trajectories past enemy point-defense drones, and strike enemy hulls at terminal kinetic velocity!

---

## 🎮 Key Features

* **Custom Newtonian Vector Gravity Engine:** Real-time 2D gravitational force integration ($F = G \frac{m_1 m_2}{r^2}$) with 180° angular revolution tracking.
* **Velocity-Scaled Kinetic Damage:** Damage scales dynamically with kinetic energy ($E_k = \frac{1}{2}mv^2$) and slingshot loops ($1.0\times \rightarrow 1.5\times \rightarrow 2.5\times \rightarrow 4.0\times \text{ Mega-Crit}$).
* **First-Bend Trajectory Preview:** Aiming pointer renders a predicted path arc truncated at the first gravitational inflection point, rewarding physics intuition while providing tactical feedback.
* **Passive Relics & Artifact System:** Game-changing passives such as *Event Horizon Harness* (Black Holes boost probe speed by +300% instead of swallowing them) and *Kinetic Battery* (converts collision speed into Energy).
* **Card Deckbuilding & Upgrades:** Field Modifiers (Micro-Singularity, Ion Deflector), Probe Enhancers (Orbital Whip, Graviton Splitter), and Defense Cards (Debris Shield). Cards can be upgraded at Salvage Shops.
* **Orbital Collectibles & In-Field Hazards:** Floating Energy Containers (+1⚡ mid-flight), Antimatter Crates (AOE explosions), and breakable Asteroid Debris fields.
* **Point-Defense Drones:** Enemy ships deploy rotating defense drones that intercept direct head-on shots, forcing players to use curved gravity slingshots to strike unshielded engine thrusters from behind.
* **Branching Sector Node Map:** 4-layer procedural map with Combat, Elite Battles, Salvage Shops, Space Anomaly Events, and Sector Bosses.

---

## 🏗️ Project Architecture & Directory Layout

GraviDeck follows a decoupled architecture separating pure math, roguelite state, Phaser rendering, and UI:

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
│           ├── 2026-08-10-phase-1-physics-core.md
│           ├── 2026-08-10-phase-2-state-and-relics.md
│           ├── 2026-08-10-phase-3-sector-map.md
│           ├── 2026-08-10-phase-4-phaser-ui-combat.md
│           └── 2026-08-10-phase-5-automated-testing.md
├── src/
│   ├── main.ts                   # Phaser 3 game entrypoint & configuration
│   ├── physics/
│   │   ├── Vector2D.ts           # Pure 2D vector math (add, sub, scale, norm, dot)
│   │   ├── GravityBody.ts        # Planet, Singularity, Repulsion Node, Pulsar models
│   │   ├── Probe.ts              # Probe particle state, trail history, active traits
│   │   ├── OrbitalEntity.ts     # Energy Pods, Antimatter Crates, Asteroids
│   │   ├── PhysicsEngine.ts      # Euler force integration, event horizon checks
│   │   └── TrajectoryPredictor.ts# Partial 1st-bend predicted path arc
│   ├── state/
│   │   ├── Card.ts               # Card interface, upgrade system, effect callbacks
│   │   ├── Relic.ts              # Passive relics modifying physics & game rules
│   │   ├── StatusEffect.ts       # Debuffs: Grav-Locked, Ionized, Thermal Friction
│   │   ├── Deck.ts               # Hand, draw pile, discard pile, exhaust pile manager
│   │   ├── PlayerShip.ts         # Player HP, Shields, Energy pool, launch angle & impulse
│   │   ├── Enemy.ts              # Enemy HP, Shields, Intent, Defense Drones
│   │   ├── SectorMap.ts          # Node-based branching map (Combat, Elite, Shop, Event, Boss)
│   │   └── CombatStateMachine.ts # Turn phase state machine (DRAW -> PLAY -> AIM -> SIMULATE -> ENEMY -> END)
│   ├── scenes/
│   │   ├── BootScene.ts          # Asset preloader & procedural graphics generation
│   │   ├── MapScene.ts           # Sector Node Map scene
│   │   ├── CombatScene.ts        # Tactical physics viewport + Bottom Card Dock UI
│   │   ├── ShopScene.ts          # Salvage Shop UI
│   │   ├── EventScene.ts         # Space Anomaly event choices UI
│   │   └── GameOverScene.ts      # Victory / Defeat screen
│   └── ui/
│       ├── CardContainer.ts      # Phaser interactive drag-and-drop Card GameObject
│       ├── HUD.ts                # HP/Shield bars, Energy orb, Turn phase banner
│       ├── RelicBar.ts           # Passive Relic display HUD
│       └── TrajectoryRenderer.ts # Dotted trajectory prediction line renderer
└── tests/
    ├── physics/                  # Vitest unit tests for pure physics modules
    ├── state/                    # Vitest unit tests for deck, relic, and state models
    ├── integration/              # Vitest 10,000-step physics stress tests & relic synergies
    └── e2e/                      # Playwright automated browser UI test suite
```

---

## 🛠️ Getting Started & Commands

### Prerequisites
* **Node.js:** v18.0.0 or higher
* **npm:** v9.0.0 or higher

### Installation
```bash
git clone git@github.com:pranabeshsingh/GraviDeck.git
cd GraviDeck
npm install
```

### Development Server
Run the local Vite dev server on `http://localhost:3000`:
```bash
npm run dev
```

### Unit & Integration Testing
Run the Vitest test suite:
```bash
npm run test
```

### Production Build
Type-check with `tsc` and bundle with Vite into `dist/`:
```bash
npm run build
```

---

## 📜 Documentation & Design Specs

* **Technical Design Specification:** [docs/superpowers/specs/2026-08-10-gravideck-design.md](docs/superpowers/specs/2026-08-10-gravideck-design.md)
* **Phase 1 Plan (Physics Core):** [docs/superpowers/plans/2026-08-10-phase-1-physics-core.md](docs/superpowers/plans/2026-08-10-phase-1-physics-core.md)
* **Phase 2 Plan (State & Relics):** [docs/superpowers/plans/2026-08-10-phase-2-state-and-relics.md](docs/superpowers/plans/2026-08-10-phase-2-state-and-relics.md)
* **Phase 3 Plan (Sector Map):** [docs/superpowers/plans/2026-08-10-phase-3-sector-map.md](docs/superpowers/plans/2026-08-10-phase-3-sector-map.md)
* **Phase 4 Plan (Phaser UI & Combat):** [docs/superpowers/plans/2026-08-10-phase-4-phaser-ui-combat.md](docs/superpowers/plans/2026-08-10-phase-4-phaser-ui-combat.md)
* **Phase 5 Plan (Automated Testing):** [docs/superpowers/plans/2026-08-10-phase-5-automated-testing.md](docs/superpowers/plans/2026-08-10-phase-5-automated-testing.md)

---

## 📄 License

[MIT License](LICENSE)
