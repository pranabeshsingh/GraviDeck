import { describe, it, expect } from 'vitest';
import { PhysicsEngine } from '../../src/physics/PhysicsEngine';
import { GravityBody, GravityBodyType } from '../../src/physics/GravityBody';
import { Probe } from '../../src/physics/Probe';
import { OrbitalEntity, OrbitalEntityType } from '../../src/physics/OrbitalEntity';
import { Vector2D } from '../../src/physics/Vector2D';

describe('PhysicsEngine Gravitational Calculations & Collectibles', () => {
  it('accelerates probe towards a standard planet', () => {
    const engine = new PhysicsEngine(500);
    const planet = new GravityBody('p1', GravityBodyType.PLANET, new Vector2D(400, 300), 1000, 30, 200);
    const probe = new Probe(new Vector2D(200, 300), new Vector2D(0, 0));

    engine.step(probe, [planet], [], 0.1);
    expect(probe.velocity.x).toBeGreaterThan(0);
  });

  it('swallows probe if it enters a Singularity event horizon', () => {
    const engine = new PhysicsEngine(500);
    const bh = new GravityBody('bh1', GravityBodyType.SINGULARITY, new Vector2D(300, 300), 5000, 20, 200, 15);
    const probe = new Probe(new Vector2D(305, 300), new Vector2D(0, 0));

    engine.step(probe, [bh], [], 0.1, false /* hasHarness */);
    expect(probe.isSwallowed).toBe(true);
  });

  it('does not swallow probe in black hole if Event Horizon Harness relic is active', () => {
    const engine = new PhysicsEngine(500);
    const bh = new GravityBody('bh1', GravityBodyType.SINGULARITY, new Vector2D(300, 300), 5000, 20, 200, 15);
    const probe = new Probe(new Vector2D(305, 300), new Vector2D(0, 0));

    engine.step(probe, [bh], [], 0.1, true /* hasHarness */);
    expect(probe.isSwallowed).toBe(false);
  });

  it('repels probe away from a Repulsion Node', () => {
    const engine = new PhysicsEngine(500);
    const node = new GravityBody('r1', GravityBodyType.REPULSION_NODE, new Vector2D(400, 300), 1000, 30, 200);
    const probe = new Probe(new Vector2D(200, 300), new Vector2D(0, 0));

    engine.step(probe, [node], [], 0.1);
    expect(probe.velocity.x).toBeLessThan(0);
  });

  it('detects collision with Energy Container', () => {
    const engine = new PhysicsEngine(500);
    const pod = new OrbitalEntity('pod1', OrbitalEntityType.ENERGY_CONTAINER, new Vector2D(205, 300), 15);
    const probe = new Probe(new Vector2D(200, 300), new Vector2D(0, 0));

    engine.step(probe, [], [pod], 0.1);
    expect(pod.isCollected).toBe(true);
  });
});
