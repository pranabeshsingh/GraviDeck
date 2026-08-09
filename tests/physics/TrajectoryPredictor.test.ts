import { describe, it, expect } from 'vitest';
import { TrajectoryPredictor } from '../../src/physics/TrajectoryPredictor';
import { GravityBody, GravityBodyType } from '../../src/physics/GravityBody';
import { Probe } from '../../src/physics/Probe';
import { Vector2D } from '../../src/physics/Vector2D';

describe('TrajectoryPredictor First-Bend Truncation', () => {
  it('generates points up to first major curvature inflection', () => {
    const predictor = new TrajectoryPredictor();
    const planet = new GravityBody('p1', GravityBodyType.PLANET, new Vector2D(400, 300), 5000, 30, 250);
    const probe = new Probe(new Vector2D(100, 200), new Vector2D(300, 0));

    const path = predictor.predict(probe, [planet], 300, 0.05);

    expect(path.length).toBeGreaterThan(5);
    expect(path.length).toBeLessThanOrEqual(300);
  });
});
