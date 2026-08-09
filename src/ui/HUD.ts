import Phaser from 'phaser';
import { CombatStateMachine } from '../state/CombatStateMachine';

export class HUD {
  private playerHpText: Phaser.GameObjects.Text;
  private enemyHpText: Phaser.GameObjects.Text;
  private energyText: Phaser.GameObjects.Text;

  constructor(scene: Phaser.Scene, private sm: CombatStateMachine) {
    this.playerHpText = scene.add.text(20, 680, '', { fontSize: '14px', color: '#38bdf8', fontStyle: 'bold' });
    this.enemyHpText = scene.add.text(1050, 20, '', { fontSize: '14px', color: '#ef4444', fontStyle: 'bold' });
    this.energyText = scene.add.text(320, 680, '', { fontSize: '14px', color: '#f59e0b', fontStyle: 'bold' });
    this.update();
  }

  update() {
    this.playerHpText.setText(`SHIP HP: ${this.sm.player.hp}/${this.sm.player.maxHp} [Shield: ${this.sm.player.shields}]`);
    this.enemyHpText.setText(`ENEMY HP: ${this.sm.enemy.hp}/${this.sm.enemy.maxHp}`);
    this.energyText.setText(`ENERGY: ${this.sm.player.energy}/${this.sm.player.maxEnergy}⚡`);
  }
}
