export enum NodeType {
  COMBAT = 'COMBAT',
  ELITE = 'ELITE',
  SHOP = 'SHOP',
  EVENT = 'EVENT',
  BOSS = 'BOSS'
}

export interface MapNode {
  id: string;
  type: NodeType;
  layer: number;
  nextNodes: string[];
  isCompleted?: boolean;
}

export interface SectorMap {
  layers: MapNode[][];
}

export class SectorMapGenerator {
  generateSectorMap(): SectorMap {
    const layer0: MapNode[] = [
      { id: 'node_0_0', type: NodeType.COMBAT, layer: 0, nextNodes: ['node_1_0', 'node_1_1'] },
      { id: 'node_0_1', type: NodeType.COMBAT, layer: 0, nextNodes: ['node_1_1'] }
    ];

    const layer1: MapNode[] = [
      { id: 'node_1_0', type: NodeType.EVENT, layer: 1, nextNodes: ['node_2_0'] },
      { id: 'node_1_1', type: NodeType.SHOP, layer: 1, nextNodes: ['node_2_0', 'node_2_1'] }
    ];

    const layer2: MapNode[] = [
      { id: 'node_2_0', type: NodeType.ELITE, layer: 2, nextNodes: ['boss'] },
      { id: 'node_2_1', type: NodeType.COMBAT, layer: 2, nextNodes: ['boss'] }
    ];

    const bossLayer: MapNode[] = [
      { id: 'boss', type: NodeType.BOSS, layer: 3, nextNodes: [] }
    ];

    return { layers: [layer0, layer1, layer2, bossLayer] };
  }
}
