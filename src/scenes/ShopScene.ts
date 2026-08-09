import Phaser from 'phaser';

export class ShopScene extends Phaser.Scene {
  constructor() {
    super('ShopScene');
  }

  create() {
    const bg = this.add.image(640, 360, 'space_bg');
    bg.setDisplaySize(1280, 720);
    bg.setAlpha(0.6);

    this.add.text(640, 60, 'SALVAGE SHOP & REPAIR DOCK', { fontSize: '28px', color: '#f59e0b', fontStyle: 'bold' }).setOrigin(0.5);

    const relicBtn = this.add.container(640, 280);
    const box = this.add.rectangle(0, 0, 480, 80, 0x1e293b, 0.9).setStrokeStyle(2, 0x818cf8);
    const text = this.add.text(0, 0, '🔮 Buy Event Horizon Harness (150c)\nBlack Holes boost probe launch speed +300%', {
      fontSize: '15px', color: '#818cf8', align: 'center'
    }).setOrigin(0.5);
    relicBtn.add([box, text]);
    relicBtn.setSize(480, 80);
    relicBtn.setInteractive({ useHandCursor: true });

    const leaveBtn = this.add.text(640, 550, 'RETURN TO SECTOR MAP', {
      fontSize: '18px', color: '#38bdf8', backgroundColor: '#0f172a', padding: { x: 20, y: 12 }
    }).setOrigin(0.5).setInteractive({ useHandCursor: true });

    leaveBtn.on('pointerdown', () => this.scene.start('MapScene'));
  }
}
