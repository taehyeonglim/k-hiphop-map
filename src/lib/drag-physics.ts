export interface DragPoint { id: string; x: number; y: number }
export interface DragSpring { source: string; target: string; weight?: number }
interface Body extends DragPoint { restX: number; restY: number; vx: number; vy: number }

/** Small, scoped spring system. Springs act on displacement from the original
 * edge vector, preserving the source-backed layout rather than inventing a new
 * proximity map. Rest anchors restore the network after the gesture. */
export class DragPhysics {
  private bodies = new Map<string, Body>();
  private springs: Array<DragSpring & { stiffness: number }>;
  private pinned = true;
  private releasedTime = 0;
  private done = false;
  readonly maxSettleSeconds = 2.4;

  constructor(points: DragPoint[], springs: DragSpring[], readonly draggedId: string, readonly reducedMotion = false) {
    for (const point of points) this.bodies.set(point.id, { ...point, restX: point.x, restY: point.y, vx: 0, vy: 0 });
    const degree = new Map<string, number>();
    const valid = springs.filter((spring) => spring.source !== spring.target && this.bodies.has(spring.source) && this.bodies.has(spring.target));
    for (const spring of valid) {
      degree.set(spring.source, (degree.get(spring.source) ?? 0) + 1);
      degree.set(spring.target, (degree.get(spring.target) ?? 0) + 1);
    }
    this.springs = valid.map((spring) => ({ ...spring, stiffness: 46 * (0.75 + Math.min(0.25, Math.sqrt(Math.max(0, spring.weight ?? 1)))) / Math.sqrt((degree.get(spring.source) ?? 1) * (degree.get(spring.target) ?? 1)) }));
    if (!this.bodies.has(draggedId)) this.done = true;
  }

  pin(position: { x: number; y: number }): void {
    const body = this.bodies.get(this.draggedId);
    if (!body || this.done || !Number.isFinite(position.x) || !Number.isFinite(position.y)) return;
    body.x = position.x;
    body.y = position.y;
    body.vx = 0;
    body.vy = 0;
  }

  release(): void {
    this.pinned = false;
    this.releasedTime = 0;
    if (this.reducedMotion) this.done = true;
  }

  cancel(): void {
    for (const body of this.bodies.values()) {
      body.x = body.restX; body.y = body.restY; body.vx = 0; body.vy = 0;
    }
    this.done = true;
  }

  get finished(): boolean { return this.done; }

  positions(): DragPoint[] { return [...this.bodies.values()].map(({ id, x, y }) => ({ id, x, y })); }

  /** Returns whether another animation frame is needed. A held, motionless
   * spring network can sleep; the next pointer move wakes it again. */
  step(deltaSeconds: number): boolean {
    if (this.done || this.reducedMotion) return false;
    const elapsed = Math.min(1 / 30, Math.max(1 / 240, Number.isFinite(deltaSeconds) ? deltaSeconds : 1 / 60));
    const substeps = Math.ceil(elapsed / (1 / 120));
    const dt = elapsed / substeps;
    let maxSpeed = 0;
    let maxForce = 0;
    for (let step = 0; step < substeps; step++) {
      const force = new Map<string, { x: number; y: number }>();
      for (const body of this.bodies.values()) force.set(body.id, { x: -20 * (body.x - body.restX), y: -20 * (body.y - body.restY) });
      for (const spring of this.springs) {
        const first = this.bodies.get(spring.source)!;
        const second = this.bodies.get(spring.target)!;
        const fx = spring.stiffness * ((second.x - second.restX) - (first.x - first.restX));
        const fy = spring.stiffness * ((second.y - second.restY) - (first.y - first.restY));
        const a = force.get(first.id)!;
        const b = force.get(second.id)!;
        a.x += fx; a.y += fy; b.x -= fx; b.y -= fy;
      }
      maxSpeed = 0;
      maxForce = 0;
      for (const body of this.bodies.values()) {
        if (this.pinned && body.id === this.draggedId) continue;
        const acceleration = force.get(body.id)!;
        body.vx = (body.vx + acceleration.x * dt) * Math.exp(-7.8 * dt);
        body.vy = (body.vy + acceleration.y * dt) * Math.exp(-7.8 * dt);
        body.x += body.vx * dt;
        body.y += body.vy * dt;
        maxSpeed = Math.max(maxSpeed, Math.hypot(body.vx, body.vy));
        maxForce = Math.max(maxForce, Math.hypot(acceleration.x, acceleration.y));
      }
    }
    if (!this.pinned) {
      this.releasedTime += elapsed;
      const displacement = Math.max(0, ...[...this.bodies.values()].map((body) => Math.hypot(body.x - body.restX, body.y - body.restY)));
      if (this.releasedTime >= this.maxSettleSeconds || (displacement < 0.04 && maxSpeed < 0.15)) {
        this.cancel();
        return false;
      }
      return true;
    }
    return maxSpeed > 0.04 || maxForce > 0.25;
  }
}
