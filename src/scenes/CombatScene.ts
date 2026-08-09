import Phaser from 'phaser';
import { GravityBody, GravityBodyType } from '../physics/GravityBody';
import { Vector2D } from '../physics/Vector2D';
import { CombatStateMachine } from '../state/CombatStateMachine';
import { StarterCards } from '../state/Card';
import { TrajectoryRenderer } from '../ui/TrajectoryRenderer';

export class CombatScene extends Phaser.Scene {
  public sm: CombatStateMachine = new CombatStateMachine(StarterCards);
  public bodies: GravityBody[] = [];
  public trajectoryRenderer!: TrajectoryRenderer;

  constructor() {
    super('CombatScene');
  }

  create() {
    this.cameras.main.setBackgroundColor('#090d16');
    this.createStarfield();

    const mainPlanet = new GravityBody('planet1', GravityBodyType.PLANET, new Vector2D(640, 360), 6000, 40, 220);
    this.bodies.push(mainPlanet);

    this.add.image(mainPlanet.position.x, mainPlanet.position.y, 'planet_blue');

    const ringGraphics = this.add.graphics();
    ringGraphics.lineStyle(1, 0x6366f1, 0.4);
    ringGraphics.strokeCircle(mainPlanet.position.x, mainPlanet.position.y, mainPlanet.pullRadius);

    this.add.text(20, 20, 'SECTOR GRID // GRAVITY FOUNDRY', {
      fontSize: '16px',
      color: '#38bdf8'
    });

    this.trajectoryRenderer = new TrajectoryRenderer(this);

    this.input.on('pointermove', (pointer: Phaser.Input.Pointer) => {
      const aimAngle = Math.atan2(pointer.y - this.sm.player.position.y, pointer.x - this.sm.player.position.x);
      this.trajectoryRenderer.renderTrajectory(this.sm.player.position, aimAngle, this.sm.player.launchPower, this.bodies);
    });
  }

  private createStarfield() {
    const graphics = this.add.graphics();
    graphics.fillStyle(0xffffff, 0.6);
    for (let i = 0; i < 150; i++) {
      graphics.fillCircle(Phaser.Math.Between(0, 1280), Phaser.Math.Between(0, 720), Phaser.Math.Between(1, 2));
    }
  }
}
