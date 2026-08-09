import { describe, it, expect } from 'vitest';
import { RelicManager, RelicCatalog } from '../../src/state/Relic';
import { PlayerShip } from '../../src/state/PlayerShip';

describe('Relic System', () => {
  it('adds Gravity Dynamo relic and triggers +5 shield on orbit hook', () => {
    const rm = new RelicManager();
    const player = new PlayerShip();

    rm.addRelic(RelicCatalog.GRAVITY_DYNAMO);
    rm.triggerOrbitHook(player);

    expect(player.shields).toBe(5);
  });

  it('detects Event Horizon Harness relic ownership', () => {
    const rm = new RelicManager();
    expect(rm.hasRelic('event_horizon_harness')).toBe(false);

    rm.addRelic(RelicCatalog.EVENT_HORIZON_HARNESS);
    expect(rm.hasRelic('event_horizon_harness')).toBe(true);
  });
});
