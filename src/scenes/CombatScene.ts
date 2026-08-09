import Phaser from 'phaser';
import { GravityBody, GravityBodyType } from '../physics/GravityBody';
import { Vector2D } from '../physics/Vector2D';
import { Probe } from '../physics/Probe';
import { PhysicsEngine } from '../physics/PhysicsEngine';
import { CombatStateMachine } from '../state/CombatStateMachine';
import { StarterCards, Card } from '../state/Card';
import { TrajectoryRenderer } from '../ui/TrajectoryRenderer';
import { CardContainer } from '../ui/CardContainer';
import { RelicBar } from '../ui/RelicBar';
import { HUD } from '../ui/HUD';

export class CombatScene extends Phaser.Scene {
  public sm: CombatStateMachine = new CombatStateMachine(StarterCards);
  public bodies: GravityBody[] = [];
  public physicsEngine: PhysicsEngine = new PhysicsEngine(500);
  public trajectoryRenderer!: TrajectoryRenderer;
  public relicBar!: RelicBar;
  public hud!: HUD;
  public cardContainers: CardContainer[] = [];
  
  public activeProbe: Probe | null = null;
  public probeImage: Phaser.GameObjects.Image | null = null;
  public isSimulating: boolean = false;
  public currentAimAngle: number = -Math.PI / 4;

  constructor() {
    super('CombatScene');
  }

  create() {
    this.cameras.main.setBackgroundColor('#090d16');
    this.createStarfield();

    const mainPlanet = new GravityBody('planet1', GravityBodyType.PLANET, new Vector2D(640, 360), 6000, 40, 220);
    this.bodies = [mainPlanet];

    this.add.image(mainPlanet.position.x, mainPlanet.position.y, 'planet_blue');

    const ringGraphics = this.add.graphics();
    ringGraphics.lineStyle(1, 0x6366f1, 0.4);
    ringGraphics.strokeCircle(mainPlanet.position.x, mainPlanet.position.y, mainPlanet.pullRadius);

    this.add.text(20, 20, 'SECTOR GRID // GRAVITY FOUNDRY', {
      fontSize: '16px',
      color: '#38bdf8'
    });

    this.trajectoryRenderer = new TrajectoryRenderer(this);
    this.relicBar = new RelicBar(this, this.sm.relicManager);
    this.hud = new HUD(this, this.sm);

    this.renderCardHand();

    // Fire Button
    const fireBtn = this.add.text(1120, 650, 'LAUNCH PROBE', {
      fontSize: '16px',
      color: '#ffffff',
      backgroundColor: '#2563eb',
      padding: { x: 16, y: 10 }
    }).setOrigin(0.5).setInteractive({ useHandCursor: true });

    fireBtn.on('pointerdown', () => this.launchProbe());

    this.input.on('pointermove', (pointer: Phaser.Input.Pointer) => {
      if (!this.isSimulating) {
        this.currentAimAngle = Math.atan2(pointer.y - this.sm.player.position.y, pointer.x - this.sm.player.position.x);
        this.trajectoryRenderer.renderTrajectory(this.sm.player.position, this.currentAimAngle, this.sm.player.launchPower, this.bodies);
      }
    });
  }

  update(_time: number, delta: number) {
    const dt = delta / 1000;

    // Rotate enemy defense drones
    this.sm.enemy.updateDrones(dt);

    if (this.isSimulating && this.activeProbe) {
      const hasHarness = this.sm.relicManager.hasRelic('event_horizon_harness');
      this.physicsEngine.step(this.activeProbe, this.bodies, [], dt, hasHarness);

      if (this.probeImage) {
        this.probeImage.setPosition(this.activeProbe.position.x, this.activeProbe.position.y);
      }

      // Check swallowed or out of bounds
      if (this.activeProbe.isSwallowed || this.activeProbe.position.x < -100 || this.activeProbe.position.x > 1380 || this.activeProbe.position.y < -100 || this.activeProbe.position.y > 820) {
        this.endSimulation();
        return;
      }

      // Check collision with Enemy hull
      if (this.activeProbe.position.dist(this.sm.enemy.position) <= 35) {
        const hasAmplifier = this.sm.relicManager.hasRelic('graviton_amplifier');
        const damage = this.activeProbe.getCurrentDamage(hasAmplifier ? 8.0 : 4.0);

        if (this.activeProbe.slingshotCount >= 3) {
          this.cameras.main.shake(300, 0.02);
        }

        this.sm.enemy.takeDamage(damage);
        this.hud.update();

        if (this.sm.enemy.hp <= 0) {
          this.scene.start('GameOverScene', { result: 'VICTORY' });
          return;
        }

        this.endSimulation();
      }
    }
  }

  private launchProbe() {
    if (this.isSimulating) return;

    this.isSimulating = true;
    this.trajectoryRenderer.clear();

    const initialVel = new Vector2D(
      Math.cos(this.currentAimAngle) * this.sm.player.launchPower,
      Math.sin(this.currentAimAngle) * this.sm.player.launchPower
    );
    this.activeProbe = new Probe(this.sm.player.position, initialVel);

    if (this.probeImage) this.probeImage.destroy();
    this.probeImage = this.add.image(this.activeProbe.position.x, this.activeProbe.position.y, 'probe');
  }

  private endSimulation() {
    this.isSimulating = false;
    if (this.probeImage) {
      this.probeImage.destroy();
      this.probeImage = null;
    }
    this.activeProbe = null;

    this.sm.executeEnemyTurn();
    this.hud.update();

    if (this.sm.player.hp <= 0) {
      this.scene.start('GameOverScene', { result: 'DEFEAT' });
      return;
    }

    this.renderCardHand();
  }

  private renderCardHand() {
    this.cardContainers.forEach(c => c.destroy());
    this.cardContainers = [];

    const hand = this.sm.deck.hand;
    const startX = 640 - ((hand.length - 1) * 125) / 2;

    hand.forEach((card, idx) => {
      const cardObj = new CardContainer(this, startX + idx * 125, 630, card, (playedCard, dropX, dropY) => {
        this.handleCardDrop(playedCard, dropX, dropY);
      });
      this.cardContainers.push(cardObj);
    });
  }

  private handleCardDrop(card: Card, dropX: number, dropY: number) {
    if (this.sm.player.energy >= card.energyCost) {
      this.sm.player.energy -= card.energyCost;
      this.sm.deck.playCard(card.id);

      if (card.type === 'field') {
        const newBody = new GravityBody(
          `spawn_${Date.now()}`,
          card.id.includes('singularity') ? GravityBodyType.SINGULARITY : GravityBodyType.REPULSION_NODE,
          new Vector2D(dropX, dropY),
          card.id.includes('singularity') ? 8000 : 4000,
          25,
          180
        );
        this.bodies.push(newBody);
        this.add.image(dropX, dropY, card.id.includes('singularity') ? 'black_hole' : 'planet_blue');
      } else if (card.type === 'defense') {
        this.sm.player.addShields(15);
      }

      this.hud.update();
      this.renderCardHand();
    } else {
      this.renderCardHand();
    }
  }

  private createStarfield() {
    const graphics = this.add.graphics();
    graphics.fillStyle(0xffffff, 0.6);
    for (let i = 0; i < 150; i++) {
      graphics.fillCircle(Phaser.Math.Between(0, 1280), Phaser.Math.Between(0, 720), Phaser.Math.Between(1, 2));
    }
  }
}
