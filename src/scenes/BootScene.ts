import Phaser from 'phaser';

export class BootScene extends Phaser.Scene {
  constructor() {
    super('BootScene');
  }

  preload() {
    this.load.image('space_bg', 'assets/space_background.png');
    this.load.image('planet_blue', 'assets/planet_blue.png');
    this.load.image('black_hole', 'assets/black_hole.png');
    this.load.image('player_ship', 'assets/player_ship.png');
    this.load.image('enemy_ship', 'assets/enemy_ship.png');
  }

  create() {
    const graphics = this.add.graphics();

    // Probe texture
    graphics.fillStyle(0x38bdf8, 1);
    graphics.fillCircle(8, 8, 8);
    graphics.lineStyle(2, 0xffffff, 1);
    graphics.strokeCircle(8, 8, 8);
    graphics.generateTexture('probe', 16, 16);

    this.scene.start('MapScene');
  }
}
