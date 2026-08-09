import { Vector2D } from './Vector2D';
import { GravityBody } from './GravityBody';
import { Probe } from './Probe';
import { PhysicsEngine } from './PhysicsEngine';

export class TrajectoryPredictor {
  private simEngine: PhysicsEngine = new PhysicsEngine(500);

  predict(initialProbe: Probe, bodies: GravityBody[], maxSteps: number = 200, dt: number = 0.03): Vector2D[] {
    const ghost = new Probe(initialProbe.position, initialProbe.velocity);
    const points: Vector2D[] = [ghost.position.clone()];

    this.simEngine.resetTracking();

    let prevDir: Vector2D | null = null;
    let inflectionCount = 0;

    for (let step = 0; step < maxSteps - 1; step++) {
      this.simEngine.step(ghost, bodies, [], dt);

      if (ghost.isSwallowed || ghost.isDestroyed) break;

      const currentDir = ghost.velocity.normalize();
      if (prevDir !== null) {
        const turnDot = prevDir.dot(currentDir);
        if (turnDot < 0.7) {
          inflectionCount++;
          if (inflectionCount >= 1) {
            points.push(ghost.position.clone());
            break;
          }
        }
      }

      prevDir = currentDir;
      points.push(ghost.position.clone());
    }

    return points;
  }
}
