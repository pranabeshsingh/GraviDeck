import { describe, it, expect } from 'vitest';
import { Enemy } from '../../src/state/Enemy';
import { Deck } from '../../src/state/Deck';
import { StarterCards } from '../../src/state/Card';
import { Vector2D } from '../../src/physics/Vector2D';

describe('Enemy, Point Defense Drones & Deck Manager', () => {
  it('rotates defense drones on tick', () => {
    const enemy = new Enemy(new Vector2D(1000, 300), 2);
    expect(enemy.drones.length).toBe(2);

    const initialPos = enemy.drones[0].getAbsolutePosition(enemy.position);
    enemy.updateDrones(0.5);
    const newPos = enemy.drones[0].getAbsolutePosition(enemy.position);

    expect(initialPos).not.toEqual(newPos);
  });

  it('manages deck drawing and discard piles', () => {
    const deck = new Deck(StarterCards);
    expect(deck.drawPile.length).toBe(StarterCards.length);

    deck.drawHand(3);
    expect(deck.hand.length).toBe(3);
    expect(deck.drawPile.length).toBe(StarterCards.length - 3);

    deck.discardHand();
    expect(deck.hand.length).toBe(0);
    expect(deck.discardPile.length).toBe(3);
  });
});
