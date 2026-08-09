import { Vector2D } from './Vector2D';

export enum GravityBodyType {
  PLANET = 'PLANET',
  SINGULARITY = 'SINGULARITY',
  REPULSION_NODE = 'REPULSION_NODE',
  PULSAR = 'PULSAR'
}

export class GravityBody {
  constructor(
    public id: string,
    public type: GravityBodyType,
    public position: Vector2D,
    public mass: number,
    public bodyRadius: number,
    public pullRadius: number,
    public eventHorizonRadius: number = 15,
    public pulsePeriodMs: number = 0
  ) {}
}
