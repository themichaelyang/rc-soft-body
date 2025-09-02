type VecOrNum = Vec2 | number

export class Vec2 {
  constructor(public x: number, public y: number) {}

  add(other: Vec2) {
    const [dx, dy] = this.unwrap(other)
    return new Vec2(this.x + dx, this.y + dy)
  }

  sub(other: VecOrNum) {
    const [dx, dy] = this.unwrap(other)
    return new Vec2(this.x - dx, this.y - dy)
  }

  mult(other: VecOrNum) {
    const [dx, dy] = this.unwrap(other)
    return new Vec2(this.x * dx, this.y * dy)
  }

  div(other: VecOrNum) {
    const [dx, dy] = this.unwrap(other)
    return new Vec2(this.x / dx, this.y / dy)
  }

  dot(other: Vec2) {
    const [dx, dy] = this.unwrap(other, true)
    return (this.x * dx) + (this.y * dy)
  }

  get neg() {
    return new Vec2(-this.x, -this.y)
  }

  get abs() {
    return new Vec2(Math.abs(this.x), Math.abs(this.y))
  }

  get dup() {
    return new Vec2(this.x, this.y)
  }

  get magnitude() {
    // TODO: could memoize
    return Math.sqrt(this.dot(this))
  }

  // rotate 90 degrees clockwise
  get right() {
    return new Vec2(this.y, -this.x)
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
}

export function vec(...params: number[]) {
  if (params.length == 2) {
    return new Vec2(params[0], params[1])
  }
  else {
    throw new Error(`Invalid number of parameters! Received: ${params.length} parameters`)
  }
}