import { describe, it, expect } from 'vitest';
import { CombatStateMachine, TurnPhase } from '../../src/state/CombatStateMachine';
import { StarterCards } from '../../src/state/Card';

describe('CombatStateMachine Phase Flow', () => {
  it('starts in DRAW phase and replenishes energy and hand', () => {
    const sm = new CombatStateMachine(StarterCards);
    expect(sm.currentPhase).toBe(TurnPhase.PLAY);
    expect(sm.player.energy).toBe(3);
    expect(sm.deck.hand.length).toBe(4);
  });

  it('transitions from PLAY to AIM phase when player confirms play', () => {
    const sm = new CombatStateMachine(StarterCards);
    sm.proceedToAim();
    expect(sm.currentPhase).toBe(TurnPhase.AIM);
  });

  it('executes enemy turn and advances to next player turn', () => {
    const sm = new CombatStateMachine(StarterCards);
    sm.executeEnemyTurn();

    expect(sm.player.hp).toBeLessThan(80);
    expect(sm.currentPhase).toBe(TurnPhase.PLAY);
    expect(sm.player.energy).toBe(3);
  });
});
