import { Vector2D } from './Vector2D';

export enum OrbitalEntityType {
  ENERGY_CONTAINER = 'ENERGY_CONTAINER',
  ANTIMATTER_CRATE = 'ANTIMATTER_CRATE',
  ASTEROID_DEBRIS = 'ASTEROID_DEBRIS'
}

export class OrbitalEntity {
  public isCollected: boolean = false;
  public hp: number = 20;

  constructor(
    public id: string,
    public type: OrbitalEntityType,
    public position: Vector2D,
    public radius: number = 15
  ) {}
}
