export enum StatusEffectType {
  GRAV_LOCKED = 'GRAV_LOCKED',
  IONIZED = 'IONIZED',
  THERMAL_FRICTION = 'THERMAL_FRICTION'
}

export class StatusTracker {
  private durationMap: Map<StatusEffectType, number> = new Map();

  applyStatus(type: StatusEffectType, turns: number): void {
    const existing = this.durationMap.get(type) || 0;
    this.durationMap.set(type, existing + turns);
  }

  hasStatus(type: StatusEffectType): boolean {
    return (this.durationMap.get(type) || 0) > 0;
  }

  getDamageMultiplier(): number {
    return this.hasStatus(StatusEffectType.IONIZED) ? 1.5 : 1.0;
  }

  tickTurnEnd(): void {
    for (const [type, turns] of this.durationMap.entries()) {
      if (turns > 1) {
        this.durationMap.set(type, turns - 1);
      } else {
        this.durationMap.delete(type);
      }
    }
  }
}
