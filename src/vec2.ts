type VecOrNum = Vec2 | number

class Pool {
  
}

export class Vec2 {
  static pool: Pool; 

  constructor(public x: number, public y: number) {}

  assign(other: Vec2) {
    Object.assign(this, other)
  }

  static create(x: number, y: number) {
    return new Vec2(x, y)
  }

  add(other: Vec2) {
    const [dx, dy] = this.unwrap(other)
    return Vec2.create(this.x + dx, this.y + dy)
  }

  sub(other: VecOrNum) {
    const [dx, dy] = this.unwrap(other)
    return Vec2.create(this.x - dx, this.y - dy)
  }

  mult(other: VecOrNum) {
    const [dx, dy] = this.unwrap(other)
    return Vec2.create(this.x * dx, this.y * dy)
  }

  div(other: VecOrNum) {
    const [dx, dy] = this.unwrap(other)
    return Vec2.create(this.x / dx, this.y / dy)
  }

  dot(other: Vec2) {
    const [dx, dy] = this.unwrap(other, true)
    return (this.x * dx) + (this.y * dy)
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
    return Vec2.create(this.x, this.y)
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

  unwrap(other: VecOrNum, requireVec=false) {
    if (other instanceof Vec2) {
      return [other.x, other.y]
    }
    else {
      if (requireVec) {
        throw TypeError("Must be a Vec2!")
      }
      else {
        return [other, other]
      }
    }
  }

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