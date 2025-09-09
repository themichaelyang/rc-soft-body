import { Pool } from './pool'

type VecOrNum = Vec2 | number

export class Vec2 {
  static pool: Pool; 
  static usePool: boolean = true;

  constructor(public x: number, public y: number) {}

  // TODO: make pool copy references out more naturally
  assign(other: Vec2) {
    this.x = other.x
    this.y = other.y
    // Object.assign(this, other)
  }

  static create(x: number, y: number): Vec2 {
    this.pool ||= new Pool(10000)

    if (this.usePool) { return this.pool.get(x, y) }
    else { return new Vec2(x, y) }
  }

  add(other: Vec2) {
    // const [dx, dy] = this.unwrap(other)
    // return Vec2.create(this.x + dx, this.y + dy)
    other = this.broadcast(other)
    return Vec2.create(this.x + other.x, this.y + other.y)
  }

  sub(other: VecOrNum) {
    // const [dx, dy] = this.unwrap(other)
    // return Vec2.create(this.x - dx, this.y - dy)
    other = this.broadcast(other)
    return Vec2.create(this.x - other.x, this.y - other.y)
  }

  mult(other: VecOrNum) {
    // const [dx, dy] = this.unwrap(other)
    other = this.broadcast(other)
    return Vec2.create(this.x * other.x, this.y * other.y)
  }

  div(other: VecOrNum) {
    other = this.broadcast(other)
    return Vec2.create(this.x / other.x, this.y / other.y)
  }

  dot(other: Vec2) {
    other = this.broadcast(other)
    // const [dx, dy] = this.unwrap(other, true)
    return (this.x * other.x) + (this.y * other.y)
  }

  distance(other: Vec2) {
    return this.sub(other).magnitude
  }

  get neg() {
    return Vec2.create(-this.x, -this.y)
  }

  get abs() {
    return Vec2.create(Math.abs(this.x), Math.abs(this.y))
  }

  get dup() {
    // always creates a new Vector, so you can free it from the pool
    return new Vec2(this.x, this.y)
  }

  get magnitude() {
    // TODO: could memoize
    return Math.sqrt(this.dot(this))
  }

  // rotate 90 degrees clockwise
  get right() {
    return Vec2.create(this.y, -this.x)
  }

  get unit() {
    return this.div(this.magnitude)
  }

  broadcast(other: VecOrNum, requireVec=false) {
    if (typeof(other) == "number") {
      if (requireVec) {
        throw TypeError("Must be a Vec2!")
      } else {
        return Vec2.create(other, other)
      }
    } else {
      return other
    }
  }

  // unwrap(other: VecOrNum, requireVec=false) {
  //   if (other instanceof Vec2) {
  //     return [other.x, other.y]
  //   }
  //   else {
  //     if (requireVec) {
  //       throw TypeError("Must be a Vec2!")
  //     }
  //     else {
  //       return [other, other]
  //     }
  //   }
  // }

  toString() {
    return `(${this.x.toFixed(4)}, ${this.y.toFixed(4)})`
  }
}

export function vec(...params: number[]) {
  if (params.length == 2) {
    return new Vec2(params[0], params[1])
  }
  else {
    throw new Error(`Invalid number of parameters! Received: ${params.length} parameters`)
  }
}