import { Deck } from './Deck';
import { Card } from './Card';
import { RelicManager } from './Relic';
import { PlayerShip } from './PlayerShip';
import { Enemy } from './Enemy';

export enum TurnPhase {
  DRAW = 'DRAW',
  PLAY = 'PLAY',
  AIM = 'AIM',
  SIMULATE = 'SIMULATE',
  ENEMY = 'ENEMY',
  END = 'END'
}

export class CombatStateMachine {
  public currentPhase: TurnPhase = TurnPhase.DRAW;
  public deck: Deck;
  public relicManager: RelicManager = new RelicManager();
  public player: PlayerShip = new PlayerShip();
  public enemy: Enemy = new Enemy();

  constructor(cards: Card[]) {
    this.deck = new Deck(cards);
    this.startTurn();
  }

  startTurn(): void {
    this.currentPhase = TurnPhase.DRAW;
    this.player.energy = this.player.maxEnergy;
    this.deck.drawHand(4);
    this.currentPhase = TurnPhase.PLAY;
  }

  proceedToAim(): void {
    if (this.currentPhase === TurnPhase.PLAY) {
      this.currentPhase = TurnPhase.AIM;
    }
  }

  startSimulation(): void {
    this.currentPhase = TurnPhase.SIMULATE;
  }

  executeEnemyTurn(): void {
    this.currentPhase = TurnPhase.ENEMY;
    this.player.takeDamage(this.enemy.nextIntentDamage);
    this.deck.discardHand();
    this.enemy.statusTracker.tickTurnEnd();
    this.startTurn();
  }
}
