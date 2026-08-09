import Phaser from 'phaser';
import { Card } from '../state/Card';

export class CardContainer extends Phaser.GameObjects.Container {
  public cardData: Card;

  constructor(scene: Phaser.Scene, x: number, y: number, card: Card, onDropCallback: (card: Card, dropX: number, dropY: number) => void) {
    super(scene, x, y);
    this.cardData = card;

    const bg = scene.add.rectangle(0, 0, 110, 140, 0x1e293b)
      .setStrokeStyle(2, Phaser.Display.Color.HexStringToColor(card.color).color);
    this.add(bg);

    const titleText = card.isUpgraded ? card.name + '+' : card.name;
    const title = scene.add.text(-48, -55, titleText, { fontSize: '11px', color: '#f8fafc', fontStyle: 'bold', wordWrap: { width: 95 } });
    this.add(title);

    const costBadge = scene.add.circle(42, -55, 12, 0x2563eb);
    const costText = scene.add.text(37, -62, `${card.energyCost}⚡`, { fontSize: '10px', color: '#ffffff' });
    this.add(costBadge);
    this.add(costText);

    const desc = scene.add.text(-48, 0, card.description, { fontSize: '9px', color: '#94a3b8', wordWrap: { width: 95 } });
    this.add(desc);

    this.setSize(110, 140);
    this.setInteractive();
    scene.input.setDraggable(this);

    this.on('drag', (_p: any, dragX: number, dragY: number) => this.setPosition(dragX, dragY));
    this.on('dragend', (p: Phaser.Input.Pointer) => onDropCallback(this.cardData, p.x, p.y));

    scene.add.existing(this);
  }
}
