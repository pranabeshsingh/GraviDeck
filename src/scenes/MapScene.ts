import Phaser from 'phaser';
import { SectorMapGenerator, SectorMap } from '../state/SectorMap';

export class MapScene extends Phaser.Scene {
  private sectorMap: SectorMap;

  constructor() {
    super('MapScene');
    const generator = new SectorMapGenerator();
    this.sectorMap = generator.generateSectorMap();
  }

  create() {
    this.cameras.main.setBackgroundColor('#090d16');
    this.add.text(640, 50, 'FOUNDRY SECTOR MAP', { fontSize: '24px', color: '#38bdf8', fontStyle: 'bold' }).setOrigin(0.5);

    this.sectorMap.layers.forEach((layer, lIdx) => {
      layer.forEach((node, nIdx) => {
        const x = 300 + lIdx * 220;
        const y = 200 + nIdx * 150;

        const btn = this.add.text(x, y, `[ ${node.type} ]`, {
          fontSize: '14px',
          color: '#f8fafc',
          backgroundColor: '#1e293b',
          padding: { x: 12, y: 8 }
        }).setOrigin(0.5).setInteractive({ useHandCursor: true });

        btn.on('pointerdown', () => {
          if (node.type === 'SHOP') this.scene.start('ShopScene');
          else if (node.type === 'EVENT') this.scene.start('EventScene');
          else this.scene.start('CombatScene', { nodeType: node.type });
        });
      });
    });
  }
}
