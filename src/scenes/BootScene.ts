import Phaser from 'phaser';

export class BootScene extends Phaser.Scene {
  constructor() {
    super('BootScene');
  }

  create() {
    const graphics = this.add.graphics();

    // Planet texture
    graphics.fillStyle(0x6366f1, 1);
    graphics.fillCircle(30, 30, 30);
    graphics.lineStyle(3, 0x818cf8, 1);
    graphics.strokeCircle(30, 30, 30);
    graphics.generateTexture('planet_blue', 60, 60);
    graphics.clear();

    // Singularity (Black Hole) texture
    graphics.fillStyle(0x0f172a, 1);
    graphics.fillCircle(25, 25, 25);
    graphics.lineStyle(2, 0xa855f7, 1);
    graphics.strokeCircle(25, 25, 25);
    graphics.generateTexture('black_hole', 50, 50);
    graphics.clear();

    // Probe texture
    graphics.fillStyle(0x38bdf8, 1);
    graphics.fillCircle(8, 8, 8);
    graphics.generateTexture('probe', 16, 16);

    this.scene.start('MapScene');
  }
}
