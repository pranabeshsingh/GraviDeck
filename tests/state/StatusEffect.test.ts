import { describe, it, expect } from 'vitest';
import { StatusTracker, StatusEffectType } from '../../src/state/StatusEffect';
import { StarterCards } from '../../src/state/Card';

describe('Status Effects & Card Upgrades', () => {
  it('applies Ionized status effect and calculates +50% damage bonus', () => {
    const tracker = new StatusTracker();
    tracker.applyStatus(StatusEffectType.IONIZED, 2);

    expect(tracker.hasStatus(StatusEffectType.IONIZED)).toBe(true);
    expect(tracker.getDamageMultiplier()).toBe(1.5);
  });

  it('upgrades card to reduced energy cost and upgraded name', () => {
    const card = { ...StarterCards[0] };
    const upgraded = { ...card, isUpgraded: true, name: card.name + '+', energyCost: 0 };

    expect(upgraded.name).toBe('Micro-Singularity+');
    expect(upgraded.energyCost).toBe(0);
  });
});
