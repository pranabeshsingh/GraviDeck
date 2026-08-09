import Phaser from 'phaser';

export class ShopScene extends Phaser.Scene {
  constructor() {
    super('ShopScene');
  }

  create() {
    this.cameras.main.setBackgroundColor('#0b0f19');
    this.add.text(640, 60, 'SALVAGE SHOP & REPAIR', { fontSize: '28px', color: '#f59e0b', fontStyle: 'bold' }).setOrigin(0.5);

    this.add.text(450, 300, 'Buy Event Horizon Harness (150c)', {
      fontSize: '16px', color: '#818cf8', backgroundColor: '#1e293b', padding: { x: 16, y: 10 }
    }).setOrigin(0.5).setInteractive({ useHandCursor: true });

    const leaveBtn = this.add.text(640, 550, 'RETURN TO SECTOR MAP', {
      fontSize: '18px', color: '#38bdf8', backgroundColor: '#0f172a', padding: { x: 20, y: 10 }
    }).setOrigin(0.5).setInteractive({ useHandCursor: true });

    leaveBtn.on('pointerdown', () => this.scene.start('MapScene'));
  }
}
