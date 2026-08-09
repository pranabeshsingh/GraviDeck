import Phaser from 'phaser';
import { Vector2D } from '../physics/Vector2D';
import { TrajectoryPredictor } from '../physics/TrajectoryPredictor';
import { Probe } from '../physics/Probe';
import { GravityBody } from '../physics/GravityBody';

export class TrajectoryRenderer {
  private graphics: Phaser.GameObjects.Graphics;
  private predictor: TrajectoryPredictor = new TrajectoryPredictor();

  constructor(scene: Phaser.Scene) {
    this.graphics = scene.add.graphics();
  }

  renderTrajectory(origin: Vector2D, angle: number, power: number, bodies: GravityBody[]) {
    this.graphics.clear();
    const initialVel = new Vector2D(Math.cos(angle) * power, Math.sin(angle) * power);
    const probe = new Probe(origin, initialVel);

    const points = this.predictor.predict(probe, bodies, 200, 0.03);

    this.graphics.fillStyle(0xf59e0b, 0.9);
    for (let i = 0; i < points.length; i += 3) {
      this.graphics.fillCircle(points[i].x, points[i].y, 3);
    }
  }

  clear() {
    this.graphics.clear();
  }
}
