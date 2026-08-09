import Phaser from 'phaser';

export class GameOverScene extends Phaser.Scene {
  constructor() {
    super('GameOverScene');
  }

  create(data: { result: 'VICTORY' | 'DEFEAT' }) {
    this.cameras.main.setBackgroundColor('#090d16');

    const titleColor = data.result === 'VICTORY' ? '#10b981' : '#ef4444';
    this.add.text(640, 280, data.result || 'GAME OVER', { fontSize: '48px', color: titleColor, fontStyle: 'bold' }).setOrigin(0.5);

    const btn = this.add.text(640, 440, 'RETURN TO SECTOR MAP', {
      fontSize: '20px', color: '#38bdf8', backgroundColor: '#1e293b', padding: { x: 20, y: 10 }
    }).setOrigin(0.5).setInteractive({ useHandCursor: true });

    btn.on('pointerdown', () => this.scene.start('MapScene'));
  }
}
