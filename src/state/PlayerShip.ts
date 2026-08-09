import { Vector2D } from '../physics/Vector2D';

export class PlayerShip {
  public maxHp: number = 80;
  public hp: number = 80;
  public shields: number = 0;
  public maxEnergy: number = 3;
  public energy: number = 3;
  public credits: number = 100;
  public position: Vector2D = new Vector2D(120, 550);
  public launchAngle: number = -Math.PI / 4;
  public launchPower: number = 350;

  takeDamage(amount: number): void {
    let unabsorbed = amount - this.shields;
    this.shields = Math.max(0, this.shields - amount);
    if (unabsorbed > 0) {
      this.hp = Math.max(0, this.hp - unabsorbed);
    }
  }

  addShields(amount: number): void {
    this.shields += amount;
  }
}
