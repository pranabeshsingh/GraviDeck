import Phaser from 'phaser';

export class EventScene extends Phaser.Scene {
  constructor() {
    super('EventScene');
  }

  create() {
    const bg = this.add.image(640, 360, 'space_bg');
    bg.setDisplaySize(1280, 720);
    bg.setAlpha(0.6);

    this.add.text(640, 100, 'GRAVITATIONAL ANOMALY EVENT', { fontSize: '26px', color: '#a855f7', fontStyle: 'bold' }).setOrigin(0.5);
    this.add.text(640, 180, 'You detect an abandoned derelict probe drifting near an active pulsar horizon.', { fontSize: '15px', color: '#cbd5e1' }).setOrigin(0.5);

    const option1 = this.add.container(640, 320);
    const box = this.add.rectangle(0, 0, 520, 60, 0x1e293b, 0.9).setStrokeStyle(2, 0x10b981);
    const label = this.add.text(0, 0, '1. Salvage Probe Core (Gain +50 Credits, take 10 HP damage)', { fontSize: '15px', color: '#10b981' }).setOrigin(0.5);
    option1.add([box, label]);
    option1.setSize(520, 60);
    option1.setInteractive({ useHandCursor: true });

    option1.on('pointerdown', () => this.scene.start('MapScene'));
  }
}
