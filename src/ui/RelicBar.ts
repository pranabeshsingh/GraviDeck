import Phaser from 'phaser';
import { RelicManager } from '../state/Relic';

export class RelicBar {
  private container: Phaser.GameObjects.Container;

  constructor(scene: Phaser.Scene, rm: RelicManager) {
    this.container = scene.add.container(20, 50);
    rm.relics.forEach((relic, idx) => {
      const text = scene.add.text(idx * 35, 0, relic.icon, { fontSize: '20px' });
      this.container.add(text);
    });
  }
}
