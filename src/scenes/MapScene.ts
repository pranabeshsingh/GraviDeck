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
    // Background space nebula
    const bg = this.add.image(640, 360, 'space_bg');
    bg.setDisplaySize(1280, 720);
    bg.setAlpha(0.5);

    // Title banner
    this.add.text(640, 45, 'FOUNDRY SECTOR MAP', { fontSize: '26px', color: '#38bdf8', fontStyle: 'bold' }).setOrigin(0.5);
    this.add.text(640, 75, 'Select a Sector Node to plot your jump trajectory', { fontSize: '13px', color: '#94a3b8' }).setOrigin(0.5);

    this.sectorMap.layers.forEach((layer, lIdx) => {
      layer.forEach((node, nIdx) => {
        const x = 280 + lIdx * 240;
        const y = 240 + nIdx * 180;

        const colorMap: Record<string, string> = {
          COMBAT: '#38bdf8',
          ELITE: '#f59e0b',
          SHOP: '#10b981',
          EVENT: '#a855f7',
          BOSS: '#ef4444'
        };

        const nodeColor = colorMap[node.type] || '#ffffff';

        const container = this.add.container(x, y);

        const circle = this.add.circle(0, 0, 32, 0x0f172a, 0.85);
        circle.setStrokeStyle(3, Phaser.Display.Color.HexStringToColor(nodeColor).color);

        const label = this.add.text(0, 0, node.type.substring(0, 4), {
          fontSize: '12px',
          color: nodeColor,
          fontStyle: 'bold'
        }).setOrigin(0.5);

        container.add([circle, label]);
        container.setSize(64, 64);
        container.setInteractive({ useHandCursor: true });

        container.on('pointerover', () => circle.setFillStyle(Phaser.Display.Color.HexStringToColor(nodeColor).color, 0.3));
        container.on('pointerout', () => circle.setFillStyle(0x0f172a, 0.85));

        container.on('pointerdown', () => {
          if (node.type === 'SHOP') this.scene.start('ShopScene');
          else if (node.type === 'EVENT') this.scene.start('EventScene');
          else this.scene.start('CombatScene', { nodeType: node.type });
        });
      });
    });
  }
}
