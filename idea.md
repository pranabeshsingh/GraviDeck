# "Gravity Foundry" (GraviDeck) — Game Design & Technical Blueprint

---

## 1. Core Pitch & Theme
You play as a salvage engineer navigating an unstable, gravity-warped asteroid field known as **The Foundry**. Instead of direct lasers or static projectiles, your ship fires **Grav-Probes**. The battlefield is populated by celestial gravitational bodies (planets, mini black holes, pulse beacons, magnetic debris).

Your goal is to use gravity as your primary weapon: sling probe shots *around* planets to accelerate them, bend trajectories past enemy shields, and strike enemy hulls at terminal velocity.

---

## 2. Core Game Loop

1. **Turn Start (Draw Phase):**
   * Draw a hand of 4–5 cards from your deck.
   * Gain your base Energy allocation (e.g., 3 Energy).

2. **Setup Phase (Play Cards):**
   * **Field Modifiers:** Spawn/alter gravity wells, repulsive nodes, or orbital rings on the field.
   * **Probe Enhancers:** Grant special traits to your next shot (e.g., Splitter, EMP Wave, Fire Trail).

3. **Launch Phase (Aim & Fire):**
   * Adjust your launcher's angle and set power.
   * Release the probe and watch the real-time 2D physics simulation resolve over 5–10 seconds.

4. **Enemy Action Phase:**
   * Surviving enemies shift orbital positions, charge kinetic weapons, or deploy point-defense drones.

5. **Turn End:**
   * Discard remaining hand cards.
   * Temporary gravity fields reset or tick down their duration counter.

---

## 3. Key Physics & Combat Mechanics

### A. Velocity Multiplier (The Slingshot Damage System)
* Damage isn't static—it's directly tied to **kinetic energy** ($E_k = \frac{1}{2}mv^2$).
* Every time a probe completes a gravitational slingshot around a body, its speed and damage multiplier step up ($1.0\times \rightarrow 1.5\times \rightarrow 2.5\times \rightarrow 4.0\times$).
* Slingshotting a probe 3 times around a black hole before landing a hit yields a **Mega-Crit**.

### B. Gravity Body Types
* **Standard Planet:** Pulls probes inward in a smooth gravitational curve.
* **Repulsion Node (White Hole / Ion Field):** Pushes probes away—ideal for making sharp 90° bends or hairpin turns.
* **Singularity (Mini Black Hole):** Extremely high gravitational pull. Direct hits swallow the probe, but grazing the event horizon slingshots it at maximum velocity.
* **Pulsar Node:** Emits periodic shockwaves that push passing probes outward in predictable pulses.

---

## 4. Deck Archetypes & Card Examples

### Archetype 1: Gravity Architect (Field Manipulation)
* **Micro-Singularity (1 Energy):** Place a temporary mini black hole at target screen coordinates for 1 turn.
* **Ion Deflector (1 Energy):** Place a push-node that repels passing probes away from its center.
* **Gravity Well Boost (2 Energy):** Increase the pull radius of all natural planets by +50% this turn.

### Archetype 2: Kinetic Payload (Probe Enhancers)
* **Orbital Whip (1 Energy):** Next shot gains +20% damage for every full orbital revolution around any body before impact.
* **Graviton Splitter (2 Energy):** When your probe passes through any planet's pull radius, it splits into 3 smaller warheads inheriting the trajectory vector.
* **Gravity Tether (1 Energy):** Leaves a persistent, damaging energy line along the probe's flight path.

### Archetype 3: Tactical Defense & Control
* **Slingshot Anchor (1 Energy):** Anchor an enemy in place, preventing them from moving or dodging this turn.
* **Debris Shield (1 Energy):** Orbit 3 small asteroid shields around your ship that absorb incoming attacks.

---

## 5. Technical Implementation & Mathematics

### Tech Stack
* **Framework:** **Phaser.js** (custom update loop) or **PixiJS** + **Matter.js** / custom vector math.
* **Language:** TypeScript for strongly-typed vector calculations and state logic.

### 2D Newtonian Gravity Calculation
Update loop vector calculation for frame updates:

$$\vec{F}_g = G \frac{m_1 m_2}{r^2} \hat{r}$$

#### Physics Update Loop (JavaScript/TypeScript Example)
```typescript
function updateProbePhysics(probe: Probe, planets: Planet[], dt: number) {
    const G = 500; // Gravitational constant for game balance

    for (const planet of planets) {
        const dx = planet.x - probe.x;
        const dy = planet.y - probe.y;
        const distSq = dx * dx + dy * dy;
        const dist = Math.sqrt(distSq);

        if (dist > planet.eventHorizonRadius) {
            // Calculate force magnitude and vector components
            const force = (G * planet.mass) / distSq;
            const ax = force * (dx / dist);
            const ay = force * (dy / dist);

            // Apply acceleration to probe velocity
            probe.vx += ax * dt;
            probe.vy += ay * dt;
        }
    }

    // Step position by velocity
    probe.x += probe.vx * dt;
    probe.y += probe.vy * dt;
}
```

---

## 6. Prototyping Roadmap

1. **Phase 1 (Physics Sandbox):** Build a canvas with 1 central planet and a launch turret. Implement gravity pull vectors so firing a projectile generates orbital paths and slingshots.
2. **Phase 2 (Velocity Damage & Target):** Add an enemy hull with health. Calculate damage dynamically based on velocity upon collision. Include a visual trajectory prediction path.
3. **Phase 3 (Cards & Energy UI):** Create a minimal card UI with 3 starter cards (*Spawn Singularity*, *Double Launch Impulse*, *Triple Splitter*).
4. **Phase 4 (Roguelite Metagame):** Implement a node-based map, deck editing between battles, and relic reward systems.
