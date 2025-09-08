type VecOrNum = Vec2 | number

// TODO: make this generic
class Pool {
  objects: Vec2[]
  numAllocated: number

  constructor(size: number) {
    this.numAllocated = 0
    this.objects = []
    for (let i = 0; i < size; i++) {
      this.objects.push(new Vec2(0, 0))
    }
  }

  get(x, y) {
    let nextObject;

    if (this.numAllocated >= this.objects.length) {
      console.log(`Pooling up! ${this.objects.length}`)
      nextObject = new Vec2(x, y)
      this.objects.push(nextObject)
    }
    else {
      nextObject = this.objects[this.numAllocated]
      nextObject.x = x
      nextObject.y = y
    }

    this.numAllocated += 1
    return nextObject 
  }

  // TODO: maybe add way to recycle with more granularity (after a set of ops instead of the entire loop)
  // even automagically? See: https://erikonarheim.com/posts/value-objects-in-javascript-object-pools/
  recycle() {
    this.numAllocated = 0
  }
}

export class Vec2 {
  static pool: Pool; 
  static usePool: boolean = true;

  constructor(public x: number, public y: number) {}

  // TODO: make pool copy references out more naturally
  assign(other: Vec2) {
    Object.assign(this, other)
  }

  static create(x: number, y: number) {
    this.pool ||= new Pool(100)

    if (this.usePool) { return this.pool.get(x, y) }
    else { return new Vec2(x, y) }
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