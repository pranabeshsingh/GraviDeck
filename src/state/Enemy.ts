import { Vector2D } from '../physics/Vector2D';
import { StatusTracker, StatusEffectType } from './StatusEffect';

export class DefenseDrone {
  constructor(
    public orbitRadius: number = 65,
    public angle: number = 0,
    public orbitSpeed: number = 1.2,
    public isDestroyed: boolean = false
  ) {}

  getAbsolutePosition(enemyPos: Vector2D): Vector2D {
    return new Vector2D(
      enemyPos.x + Math.cos(this.angle) * this.orbitRadius,
      enemyPos.y + Math.sin(this.angle) * this.orbitRadius
    );
  }
}

export class Enemy {
  public maxHp: number = 120;
  public hp: number = 120;
  public shields: number = 0;
  public drones: DefenseDrone[] = [];
  public statusTracker: StatusTracker = new StatusTracker();
  public nextIntentDamage: number = 18;

  constructor(public position: Vector2D = new Vector2D(1100, 250), droneCount: number = 2) {
    for (let i = 0; i < droneCount; i++) {
      this.drones.push(new DefenseDrone(65, (i * 2 * Math.PI) / droneCount, 1.2));
    }
  }

  updateDrones(dt: number): void {
    if (this.statusTracker.hasStatus(StatusEffectType.GRAV_LOCKED)) return;
    for (const drone of this.drones) {
      drone.angle += drone.orbitSpeed * dt;
    }
  }

  takeDamage(amount: number): void {
    const finalDamage = Math.round(amount * this.statusTracker.getDamageMultiplier());
    let unabsorbed = finalDamage - this.shields;
    this.shields = Math.max(0, this.shields - finalDamage);
    if (unabsorbed > 0) {
      this.hp = Math.max(0, this.hp - unabsorbed);
    }
  }
}
