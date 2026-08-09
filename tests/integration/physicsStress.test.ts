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
