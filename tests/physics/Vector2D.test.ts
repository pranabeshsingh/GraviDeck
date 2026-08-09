import { describe, it, expect } from 'vitest';
import { Vector2D } from '../../src/physics/Vector2D';

describe('Vector2D Math Operations', () => {
  it('calculates addition and subtraction correctly', () => {
    const v1 = new Vector2D(3, 4);
    const v2 = new Vector2D(1, 2);
    expect(v1.add(v2)).toEqual(new Vector2D(4, 6));
    expect(v1.sub(v2)).toEqual(new Vector2D(2, 2));
  });

  it('calculates length, lengthSq, and distance correctly', () => {
    const v = new Vector2D(3, 4);
    expect(v.lengthSq()).toBe(25);
    expect(v.length()).toBe(5);

    const v2 = new Vector2D(6, 8);
    expect(v.dist(v2)).toBe(5);
  });

  it('normalizes non-zero vectors correctly', () => {
    const v = new Vector2D(3, 4);
    const norm = v.normalize();
    expect(norm.x).toBeCloseTo(0.6);
    expect(norm.y).toBeCloseTo(0.8);
    expect(norm.length()).toBeCloseTo(1.0);
  });
});
