import { Vec2 } from './vec2'

export class Collision {
  constructor(public normal: Vec2, public depth: number) {}
}