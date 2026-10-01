import { describe, expect, it } from 'vitest';
import { DragPhysics } from '../src/lib/drag-physics';

const points = [{ id: 'a', x: 0, y: 0 }, { id: 'b', x: 40, y: 0 }, { id: 'c', x: 80, y: 0 }, { id: 'isolated', x: 200, y: 200 }];
const springs = [{ source: 'a', target: 'b', weight: 0.5 }, { source: 'b', target: 'c', weight: 0.5 }];
const position = (physics: DragPhysics, id: string) => physics.positions().find((point) => point.id === id)!;

describe('elastic node dragging', () => {
  it('pins the held node and propagates movement through actual spring connections', () => {
    const physics = new DragPhysics(points, springs, 'a');
    physics.pin({ x: 60, y: 30 });
    for (let frame = 0; frame < 30; frame++) physics.step(1 / 60);
    expect(position(physics, 'a')).toEqual({ id: 'a', x: 60, y: 30 });
    expect(position(physics, 'b').x).toBeGreaterThan(45);
    expect(position(physics, 'c').x).toBeGreaterThan(80.5);
    expect(position(physics, 'isolated')).toEqual(points[3]);
  });

  it('oscillates and then restores the original layout within the bounded lifetime', () => {
    const physics = new DragPhysics(points, springs, 'a');
    physics.pin({ x: 90, y: 0 });
    for (let frame = 0; frame < 35; frame++) physics.step(1 / 60);
    physics.release();
    const trajectory: number[] = [];
    for (let frame = 0; frame < 160; frame++) { physics.step(1 / 60); trajectory.push(position(physics, 'a').x); }
    expect(trajectory.some((x) => x < -0.1)).toBe(true);
    expect(physics.finished).toBe(true);
    expect(physics.positions()).toEqual(points);
    expect(physics.step(1 / 60)).toBe(false);
  });

  it('moves only the pinned node with reduced motion and stays still after release', () => {
    const physics = new DragPhysics(points, springs, 'a', true);
    physics.pin({ x: 70, y: 15 });
    for (let frame = 0; frame < 30; frame++) expect(physics.step(1 / 60)).toBe(false);
    expect(position(physics, 'b')).toEqual(points[1]);
    physics.release();
    const released = physics.positions();
    for (let frame = 0; frame < 100; frame++) physics.step(1 / 60);
    expect(physics.positions()).toEqual(released);
    expect(physics.finished).toBe(true);
  });

  it('cancels immediately and rejects non-finite pointer coordinates', () => {
    const physics = new DragPhysics(points, springs, 'a');
    physics.pin({ x: Number.NaN, y: Infinity });
    expect(physics.positions()).toEqual(points);
    physics.pin({ x: 100, y: 20 });
    physics.step(1 / 60);
    physics.cancel();
    expect(physics.positions()).toEqual(points);
    expect(physics.step(100)).toBe(false);
  });

  it('ignores connections to artists outside the visible physical system', () => {
    const physics = new DragPhysics(points.slice(0, 2), [...springs, { source: 'a', target: 'outside' }], 'a');
    physics.pin({ x: 40, y: 0 });
    for (let frame = 0; frame < 30; frame++) physics.step(1 / 60);
    expect(physics.positions().map((point) => point.id)).toEqual(['a', 'b']);
    expect(physics.positions().every((point) => Number.isFinite(point.x) && Number.isFinite(point.y))).toBe(true);
  });
});
