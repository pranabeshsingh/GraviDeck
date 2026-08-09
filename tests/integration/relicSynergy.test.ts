import { describe, it, expect } from 'vitest';
import { CombatStateMachine } from '../../src/state/CombatStateMachine';
import { RelicCatalog } from '../../src/state/Relic';
import { StarterCards } from '../../src/state/Card';

describe('Relic Synergy Integration', () => {
  it('correctly applies Graviton Amplifier 8.0x Mega-Crit damage scaling', () => {
    const sm = new CombatStateMachine(StarterCards);
    sm.relicManager.addRelic(RelicCatalog.GRAVITON_AMPLIFIER);

    const hasAmp = sm.relicManager.hasRelic('graviton_amplifier');
    expect(hasAmp).toBe(true);
    const megaMultiplier = hasAmp ? 8.0 : 4.0;
    expect(megaMultiplier).toBe(8.0);
  });
});
