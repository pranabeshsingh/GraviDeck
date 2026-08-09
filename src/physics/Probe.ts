import { Vector2D } from './Vector2D';

export class Probe {
  public position: Vector2D;
  public velocity: Vector2D;
  public initialSpeed: number;
  public slingshotCount: number = 0;
  public isSwallowed: boolean = false;
  public isDestroyed: boolean = false;
  public trail: Vector2D[] = [];
  public maxTrailLength: number = 40;
  public activeTraits: string[] = [];
  public baseDamage: number = 20;

  constructor(position: Vector2D, velocity: Vector2D) {
    this.position = position.clone();
    this.velocity = velocity.clone();
    this.initialSpeed = velocity.length();
  }

  getSpeedMultiplier(megaMultiplier: number = 4.0): number {
    if (this.slingshotCount === 0) return 1.0;
    if (this.slingshotCount === 1) return 1.5;
    if (this.slingshotCount === 2) return 2.5;
    return megaMultiplier;
  }

  getCurrentDamage(megaMultiplier: number = 4.0): number {
    const currentSpeed = this.velocity.length();
    const speedRatio = this.initialSpeed > 0 ? currentSpeed / this.initialSpeed : 1.0;
    const ratioSq = speedRatio * speedRatio;
    return Math.round(this.baseDamage * ratioSq * this.getSpeedMultiplier(megaMultiplier));
  }
}
