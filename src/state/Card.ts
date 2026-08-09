export type CardType = 'field' | 'probe' | 'defense';

export interface Card {
  id: string;
  name: string;
  energyCost: number;
  type: CardType;
  description: string;
  color: string;
  isUpgraded?: boolean;
}

export const StarterCards: Card[] = [
  {
    id: 'singularity_1',
    name: 'Micro-Singularity',
    energyCost: 1,
    type: 'field',
    description: 'Spawn mini black hole at target location',
    color: '#818cf8'
  },
  {
    id: 'ion_1',
    name: 'Ion Deflector',
    energyCost: 1,
    type: 'field',
    description: 'Spawn a push-node repelling passing probes',
    color: '#38bdf8'
  },
  {
    id: 'whip_1',
    name: 'Orbital Whip',
    energyCost: 1,
    type: 'probe',
    description: 'Next launch +30% damage per slingshot loop',
    color: '#f59e0b'
  },
  {
    id: 'splitter_1',
    name: 'Graviton Splitter',
    energyCost: 2,
    type: 'probe',
    description: 'Probe splits into 3 warheads inside gravity fields',
    color: '#10b981'
  },
  {
    id: 'shield_1',
    name: 'Debris Shield',
    energyCost: 1,
    type: 'defense',
    description: 'Gain +15 Shield against enemy counter-attacks',
    color: '#64748b'
  }
];
