import Phaser from 'phaser';
import { GravityBody, GravityBodyType } from '../physics/GravityBody';
import { Vector2D } from '../physics/Vector2D';
import { CombatStateMachine } from '../state/CombatStateMachine';
import { StarterCards, Card } from '../state/Card';
import { TrajectoryRenderer } from '../ui/TrajectoryRenderer';
import { CardContainer } from '../ui/CardContainer';
import { RelicBar } from '../ui/RelicBar';

export class CombatScene extends Phaser.Scene {
  public sm: CombatStateMachine = new CombatStateMachine(StarterCards);
  public bodies: GravityBody[] = [];
  public trajectoryRenderer!: TrajectoryRenderer;
  public relicBar!: RelicBar;
  public cardContainers: CardContainer[] = [];

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
    this.relicBar = new RelicBar(this, this.sm.relicManager);

    this.renderCardHand();

    this.input.on('pointermove', (pointer: Phaser.Input.Pointer) => {
      const aimAngle = Math.atan2(pointer.y - this.sm.player.position.y, pointer.x - this.sm.player.position.x);
      this.trajectoryRenderer.renderTrajectory(this.sm.player.position, aimAngle, this.sm.player.launchPower, this.bodies);
    });
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

      this.renderCardHand();
    } else {
      this.renderCardHand(); // Reset card position if insufficient energy
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
