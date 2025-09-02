import { Vec2 } from './Vec2'

export class Collision {
  constructor(public normal: Vec2, public depth: number) {}
}