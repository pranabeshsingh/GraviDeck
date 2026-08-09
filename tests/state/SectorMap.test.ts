import { describe, it, expect } from 'vitest';
import { SectorMapGenerator, NodeType } from '../../src/state/SectorMap';

describe('SectorMap Generator', () => {
  it('generates 4-layer sector map ending in BOSS node', () => {
    const generator = new SectorMapGenerator();
    const map = generator.generateSectorMap();

    expect(map.layers.length).toBe(4);
    expect(map.layers[3][0].type).toBe(NodeType.BOSS);
  });
});
