import Phaser from 'phaser';

export class EventScene extends Phaser.Scene {
  constructor() {
    super('EventScene');
  }

  create() {
    this.cameras.main.setBackgroundColor('#0b0f19');
    this.add.text(640, 100, 'GRAVITATIONAL ANOMALY EVENT', { fontSize: '24px', color: '#a855f7', fontStyle: 'bold' }).setOrigin(0.5);
    this.add.text(640, 200, 'You detect an abandoned derelict probe drifting near a pulsar horizon.', { fontSize: '16px', color: '#94a3b8' }).setOrigin(0.5);

    const option1 = this.add.text(640, 320, '1. Salvage Probe Core (Gain +50 Credits, lose 10 HP)', {
      fontSize: '16px', color: '#10b981', backgroundColor: '#1e293b', padding: { x: 16, y: 10 }
    }).setOrigin(0.5).setInteractive({ useHandCursor: true });

    option1.on('pointerdown', () => this.scene.start('MapScene'));
  }
}
