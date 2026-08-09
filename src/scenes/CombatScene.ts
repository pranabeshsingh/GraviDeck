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
  public droneSprites: Phaser.GameObjects.Arc[] = [];
  public playerShipImage!: Phaser.GameObjects.Image;
  public enemyShipImage!: Phaser.GameObjects.Image;

  public activeProbe: Probe | null = null;
  public probeImage: Phaser.GameObjects.Image | null = null;
  public isSimulating: boolean = false;
  
  // Aim locking state
  public currentAimAngle: number = -Math.PI / 4;
  public isAimLocked: boolean = false;
  public lockBadgeText!: Phaser.GameObjects.Text;

  constructor() {
    super('CombatScene');
  }

  create() {
    // 1. Background Nebula
    const bg = this.add.image(640, 360, 'space_bg');
    bg.setDisplaySize(1280, 720);
    bg.setAlpha(0.65);

    this.createStarfield();

    // 2. Planets & Gravity Fields
    const mainPlanet = new GravityBody('planet1', GravityBodyType.PLANET, new Vector2D(640, 360), 6500, 50, 240);
    this.bodies = [mainPlanet];

    const planetImg = this.add.image(mainPlanet.position.x, mainPlanet.position.y, 'planet_blue');
    planetImg.setDisplaySize(100, 100);

    const ringGraphics = this.add.graphics();
    ringGraphics.lineStyle(2, 0x38bdf8, 0.35);
    ringGraphics.strokeCircle(mainPlanet.position.x, mainPlanet.position.y, mainPlanet.pullRadius);

    // 3. Ships
    this.playerShipImage = this.add.image(this.sm.player.position.x, this.sm.player.position.y, 'player_ship');
    this.playerShipImage.setDisplaySize(70, 70);

    this.enemyShipImage = this.add.image(this.sm.enemy.position.x, this.sm.enemy.position.y, 'enemy_ship');
    this.enemyShipImage.setDisplaySize(90, 90);

    // 4. Enemy Point-Defense Drones
    this.sm.enemy.drones.forEach(() => {
      const drone = this.add.circle(0, 0, 8, 0xef4444);
      drone.setStrokeStyle(2, 0xffffff);
      this.droneSprites.push(drone);
    });

    // 5. Title & Trajectory UI
    this.add.text(20, 20, 'SECTOR GRID // TACTICAL GRAVITY FIELD', {
      fontSize: '15px',
      color: '#38bdf8',
      fontStyle: 'bold'
    });

    this.lockBadgeText = this.add.text(640, 30, 'CLICK SPACE ARENA TO LOCK AIMING ANGLE', {
      fontSize: '13px',
      color: '#f59e0b',
      backgroundColor: '#0f172a',
      padding: { x: 10, y: 5 }
    }).setOrigin(0.5);

    this.trajectoryRenderer = new TrajectoryRenderer(this);
    this.relicBar = new RelicBar(this, this.sm.relicManager);
    this.hud = new HUD(this, this.sm);

    this.renderCardHand();

    // 6. Launch Probe Button
    const fireBtn = this.add.text(1150, 650, '🚀 LAUNCH PROBE', {
      fontSize: '16px',
      color: '#ffffff',
      backgroundColor: '#2563eb',
      padding: { x: 18, y: 12 }
    }).setOrigin(0.5).setInteractive({ useHandCursor: true });

    fireBtn.on('pointerdown', (pointer: Phaser.Input.Pointer) => {
      pointer.event.stopPropagation();
      this.launchProbe();
    });

    // 7. Arena Click Aiming Lock Handler
    this.input.on('pointerdown', (pointer: Phaser.Input.Pointer) => {
      if (this.isSimulating) return;
      if (pointer.y > 540 || pointer.x > 1050) return; // Don't lock if clicking Card Dock or Launch button

      this.isAimLocked = !this.isAimLocked;

      if (this.isAimLocked) {
        this.currentAimAngle = Math.atan2(pointer.y - this.sm.player.position.y, pointer.x - this.sm.player.position.x);
        this.lockBadgeText.setText('🔒 AIM ANGLE LOCKED! Click Launch Probe or click Arena to unlock').setColor('#10b981');
      } else {
        this.lockBadgeText.setText('CLICK SPACE ARENA TO LOCK AIMING ANGLE').setColor('#f59e0b');
      }

      this.updateTrajectoryPreview();
    });

    // 8. Mouse Pointer Motion Handler
    this.input.on('pointermove', (pointer: Phaser.Input.Pointer) => {
      if (!this.isSimulating && !this.isAimLocked) {
        this.currentAimAngle = Math.atan2(pointer.y - this.sm.player.position.y, pointer.x - this.sm.player.position.x);
        this.updateTrajectoryPreview();
      }
    });
  }

  private updateTrajectoryPreview() {
    this.playerShipImage.setRotation(this.currentAimAngle);
    this.trajectoryRenderer.renderTrajectory(
      this.sm.player.position,
      this.currentAimAngle,
      this.sm.player.launchPower,
      this.bodies
    );
  }

  update(_time: number, delta: number) {
    const dt = delta / 1000;

    // Update enemy defense drones visual positions
    this.sm.enemy.updateDrones(dt);
    this.sm.enemy.drones.forEach((drone, idx) => {
      if (this.droneSprites[idx]) {
        const pos = drone.getAbsolutePosition(this.sm.enemy.position);
        this.droneSprites[idx].setPosition(pos.x, pos.y);
      }
    });

    // Real-Time Probe Physics Integration Loop
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

      // Check collision with Rotating Defense Drones
      for (const drone of this.sm.enemy.drones) {
        const dronePos = drone.getAbsolutePosition(this.sm.enemy.position);
        if (this.activeProbe.position.dist(dronePos) <= 16) {
          this.cameras.main.shake(150, 0.01);
          this.endSimulation();
          return;
        }
      }

      // Check collision with Enemy hull
      if (this.activeProbe.position.dist(this.sm.enemy.position) <= 45) {
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
    this.isAimLocked = false;
    this.lockBadgeText.setText('CLICK SPACE ARENA TO LOCK AIMING ANGLE').setColor('#f59e0b');

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
        const isSingularity = card.id.includes('singularity');
        const newBody = new GravityBody(
          `spawn_${Date.now()}`,
          isSingularity ? GravityBodyType.SINGULARITY : GravityBodyType.REPULSION_NODE,
          new Vector2D(dropX, dropY),
          isSingularity ? 8000 : 4000,
          30,
          180
        );
        this.bodies.push(newBody);

        const imgKey = isSingularity ? 'black_hole' : 'planet_blue';
        const img = this.add.image(dropX, dropY, imgKey);
        img.setDisplaySize(60, 60);
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
