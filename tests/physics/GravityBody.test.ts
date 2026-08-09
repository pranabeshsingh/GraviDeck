import { describe, it, expect } from 'vitest';
import { GravityBody, GravityBodyType } from '../../src/physics/GravityBody';
import { Probe } from '../../src/physics/Probe';
import { OrbitalEntity, OrbitalEntityType } from '../../src/physics/OrbitalEntity';
import { Vector2D } from '../../src/physics/Vector2D';

describe('GravityBody & OrbitalEntity Models', () => {
  it('initializes planet body with pull radius', () => {
    const planet = new GravityBody('p1', GravityBodyType.PLANET, new Vector2D(400, 300), 5000, 40, 150);
    expect(planet.mass).toBe(5000);
    expect(planet.pullRadius).toBe(150);
  });

  it('initializes OrbitalEntity energy pod', () => {
    const pod = new OrbitalEntity('pod1', OrbitalEntityType.ENERGY_CONTAINER, new Vector2D(450, 300), 15);
    expect(pod.type).toBe(OrbitalEntityType.ENERGY_CONTAINER);
    expect(pod.isCollected).toBe(false);
  });

  it('initializes Probe with position, velocity, and calculates damage scaling', () => {
    const probe = new Probe(new Vector2D(100, 100), new Vector2D(200, 0));
    expect(probe.slingshotCount).toBe(0);
    expect(probe.isSwallowed).toBe(false);
    expect(probe.getSpeedMultiplier()).toBe(1.0);
    expect(probe.getCurrentDamage()).toBe(20);

    probe.slingshotCount = 3;
    expect(probe.getSpeedMultiplier()).toBe(4.0);
    expect(probe.getCurrentDamage()).toBe(80);
  });
});
