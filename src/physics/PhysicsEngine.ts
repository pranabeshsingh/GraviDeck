import { Vector2D } from './Vector2D';
import { GravityBody, GravityBodyType } from './GravityBody';
import { Probe } from './Probe';
import { OrbitalEntity } from './OrbitalEntity';

export class PhysicsEngine {
  private lastAngles: Map<string, number> = new Map();
  private accumAngles: Map<string, number> = new Map();

  constructor(public G: number = 500) {}

  step(probe: Probe, bodies: GravityBody[], orbitalEntities: OrbitalEntity[] = [], dt: number = 0.03, hasEventHorizonHarness: boolean = false): void {
    if (probe.isSwallowed || probe.isDestroyed) return;

    let totalAcc = new Vector2D(0, 0);

    for (const body of bodies) {
      const dir = body.position.sub(probe.position);
      const distSq = dir.lengthSq();
      const dist = Math.sqrt(distSq);

      if (dist < 1) continue;

      if (body.type === GravityBodyType.SINGULARITY && dist <= body.eventHorizonRadius) {
        if (!hasEventHorizonHarness) {
          probe.isSwallowed = true;
          return;
        }
      }

      if (dist <= body.pullRadius) {
        const normDir = dir.normalize();
        let forceMag = (this.G * body.mass) / Math.max(distSq, 100);

        if (body.type === GravityBodyType.REPULSION_NODE) {
          forceMag = -forceMag;
        }

        totalAcc = totalAcc.add(normDir.scale(forceMag));

        const currentAngle = Math.atan2(probe.position.y - body.position.y, probe.position.x - body.position.x);
        const lastAngle = this.lastAngles.get(body.id);

        if (lastAngle !== undefined) {
          let diff = currentAngle - lastAngle;
          while (diff > Math.PI) diff -= 2 * Math.PI;
          while (diff < -Math.PI) diff += 2 * Math.PI;

          const currentAccum = (this.accumAngles.get(body.id) || 0) + Math.abs(diff);
          this.accumAngles.set(body.id, currentAccum);

          if (currentAccum >= Math.PI) {
            probe.slingshotCount += 1;
            this.accumAngles.set(body.id, 0);
          }
        }
        this.lastAngles.set(body.id, currentAngle);
      }
    }

    for (const entity of orbitalEntities) {
      if (entity.isCollected) continue;
      if (probe.position.dist(entity.position) <= entity.radius + 8) {
        entity.isCollected = true;
      }
    }

    probe.velocity = probe.velocity.add(totalAcc.scale(dt));
    probe.position = probe.position.add(probe.velocity.scale(dt));

    probe.trail.push(probe.position.clone());
    if (probe.trail.length > probe.maxTrailLength) {
      probe.trail.shift();
    }
  }

  resetTracking(): void {
    this.lastAngles.clear();
    this.accumAngles.clear();
  }
}
