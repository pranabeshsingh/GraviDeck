import { PlayerShip } from './PlayerShip';

export interface Relic {
  id: string;
  name: string;
  description: string;
  icon: string;
}

export const RelicCatalog: Record<string, Relic> = {
  EVENT_HORIZON_HARNESS: {
    id: 'event_horizon_harness',
    name: 'Event Horizon Harness',
    description: 'Black Holes no longer swallow probes; they boost speed by +300%',
    icon: '🔮'
  },
  KINETIC_BATTERY: {
    id: 'kinetic_battery',
    name: 'Kinetic Battery',
    description: 'Converts 20% of probe collision speed into Energy next turn',
    icon: '⚡'
  },
  GRAVITY_DYNAMO: {
    id: 'gravity_dynamo',
    name: 'Gravity Dynamo',
    description: 'Sweeping 180° orbits around any body grants +5 Shield',
    icon: '🛡️'
  },
  GRAVITON_AMPLIFIER: {
    id: 'graviton_amplifier',
    name: 'Graviton Amplifier',
    description: 'Slingshot Mega-Crit damage multiplier increased to 8.0x',
    icon: '🚀'
  }
};

export class RelicManager {
  public relics: Relic[] = [];

  addRelic(relic: Relic): void {
    if (!this.hasRelic(relic.id)) {
      this.relics.push(relic);
    }
  }

  hasRelic(id: string): boolean {
    return this.relics.some(r => r.id === id);
  }

  triggerOrbitHook(player: PlayerShip): void {
    if (this.hasRelic('gravity_dynamo')) {
      player.addShields(5);
    }
  }
}
