import { PointMass } from './point_mass'
import { Vec2 } from './vec2'

export class AnchoredSpring {
  anchor: Vec2
  weight: PointMass

  constructor({anchor, weight}) {
    [this.anchor, this.weight] = [anchor, weight]
  }

  
}