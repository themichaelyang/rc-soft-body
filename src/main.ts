let points = []
let springs = []

let gravity
let ctx

const world = {
  width: 100,
  height: 100
}

function main() {
  const canvas = document.getElementById("canvas")
  ctx = canvas.getContext("2d", { alpha: false })
  ctx.fillStyle = "white"
  ctx.fillRect(0, 0, canvas.width, canvas.height)
  // const ratio = window.devicePixelRatio || 1

  canvas.width = world.width;
  canvas.height = world.height;

  // display width and height is different
  canvas.style.width = '500px'
  canvas.style.height = '500px'

  pixelate(ctx)
  // const p1 = new Point({pos: vec(1, 50), m: 1, v: vec(0.5, -2), elasticity: 0.6, friction: 0.1})
  // const p2 = new Point({pos: vec(25, 0), m: 1, v: vec(0.2, 0), elasticity: 0.8, friction: 0.1})
  const p1 = new Point({pos: vec(50, 50), m: 1, v: vec(0, 0), elasticity: 0.6, friction: 0.1})
  const p2 = new Point({pos: vec(25, 25), m: 1, v: vec(0, 0.1), elasticity: 0.8, friction: 0.1})
  const spring = new Spring({pointA: p1, pointB: p2, equilibriumLength: 25, stiffness: 0.001})

  points.push(p1, p2)
  springs.push(spring)

  gravity = vec(0, 0.2)

  window.requestAnimationFrame(loop)
}

function pixelate(ctx) {
  // from https://stackoverflow.com/a/68372384/7971276
  // ctx.filter = `url('data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg"><filter id="f" color-interpolation-filters="sRGB"><feComponentTransfer><feFuncA type="discrete" tableValues="0 1"/></feComponentTransfer></filter></svg>#f')`
  ctx.imageSmoothingEnabled = false
}

window.onload = () => {
  main()
}

function loop() {
  ctx.fillStyle = "white"
  ctx.fillRect(0, 0, canvas.width, canvas.height)
  // TODO: Use relative time elapsed (current time is passed into loop() by requestAnimationFrame
  // https://gameprogrammingpatterns.com/game-loop.html

  // TODO: Add mouse dragging for velocity and acceleration
  
  points.forEach((pt) => {
    const collisions = pt.collisionsWithBorders(world.width, world.height)

    if (collisions.length > 0) {
      pt.collide(collisions)
    }

    pt.update(gravity, 0.1)
    pt.draw(ctx)
  })

  springs.forEach((spr) => {
    spr.pointA.updateVelocity(spr.forceA, 0.1)
    spr.pointB.updateVelocity(spr.forceB, 0.1)
    spr.draw(ctx)
  })

  window.requestAnimationFrame(loop)
}

class Vec2 {
  constructor(x, y) {
    [this.x, this.y] = [x, y]
  }

  add(other) {
    const [dx, dy] = this.unwrap(other)
    return new Vec2(this.x + dx, this.y + dy)
  }

  sub(other) {
    const [dx, dy] = this.unwrap(other)
    return new Vec2(this.x - dx, this.y - dy)
  }

  mult(other) {
    const [dx, dy] = this.unwrap(other)
    return new Vec2(this.x * dx, this.y * dy)
  }

  div(other) {
    const [dx, dy] = this.unwrap(other)
    return new Vec2(this.x / dx, this.y / dy)
  }

  dot(other) {
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

  // TODO: could memoize
  get magnitude() {
    return Math.sqrt(this.dot(this))
  }

  // rotate 90 degrees clockwise
  get right() {
    return new Vec2(this.y, -this.x)
  }

  get unit() {
    return this.div(this.magnitude)
  }

  unwrap(other, requireVec=false) {
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

function vec(x, y) {
  return new Vec2(x, y)
}

class Collision {
  constructor(normal, depth) {
    [this.normal, this.depth] = [normal, depth]
  }
}

class Point {
  constructor({pos, m, v, elasticity, friction}) {
    [this.pos, this.m, this.v, this.elasticity, this.friction] = [pos, m, v, elasticity, friction]
  }
  
  get x() {
    return this.pos.x
  }

  get y() {
    return this.pos.y
  }

  collisionsWithBorders(width, height) {
    const collisions = []

    if (this.y > height) { collisions.push(new Collision(new Vec2(0, -1), this.y - height)) }
    else if (this.y < 0) { collisions.push(new Collision(new Vec2(0, 1), -this.y)) }

    if (this.x > width) { collisions.push(new Collision(new Vec2(-1, 0), this.x - width)) }
    else if (this.x < 0) { collisions.push(new Collision(new Vec2(1, 0), -this.x)) }

    return collisions
  }

  collide(collisions) {
    collisions.forEach((c) => this.handleCollision(c))
  }

  // TODO: https://lisyarus.github.io/blog/posts/soft-body-physics.html#section-collision-resolution
  handleCollision(collision) {
    // uncollide
    this.pos = this.pos.add(collision.normal.mult(collision.depth))
  
    // the dot product sign is negative, since the normal vector is facing the opposite 
    // way we want to go (consider the projection)
    const normalVelocity = collision.normal.mult(collision.normal.dot(this.v)).neg

    // get tangent by subtracting out velocity in normal direction
    const tangentVelocity = this.v.sub(normalVelocity)

    // TODO: fix friction so it can come to a complete stop even with constant "wind" force
    this.v = normalVelocity.mult(this.elasticity).add(tangentVelocity.mult(1 - this.friction))
  }

  update(force, dt) {
    // Semi-implicit Euler ordering: https://gafferongames.com/post/integration_basics/
    this.updateVelocity(force, dt)
    this.updatePosition()
  }

  updateVelocity(force, dt) {
    this.v = this.v.add(force.div(this.m).mult(dt))
  }

  updatePosition() {
    this.pos = this.pos.add(this.v)
  }

  draw(ctx) {
    ctx.beginPath()
    ctx.arc(this.x, this.y, this.m, 0, 2 * Math.PI)
    ctx.stroke()
  }
}

class Spring {
  constructor({pointA, pointB, equilibriumLength, stiffness}) {
    [this.pointA, this.pointB, this.equilibriumLength, this.stiffness] = [pointA, pointB, equilibriumLength, stiffness]
  }

  // force acting on point A
  get forceA() {
    return this.force(this.pointA.pos, this.pointB.pos)
  }

  get forceB() {
    return this.force(this.pointB.pos, this.pointA.pos)
  }

  force(origin, dest) {
    const delta = dest.sub(origin)
    const displacement = this.equilibriumLength - delta.magnitude
    const direction = delta.unit

    return direction.mult(this.stiffness * displacement)
  }

  get ax() {
    return this.pointA.x
  }

  get ay() {
    return this.pointA.y
  }

  get bx() {
    return this.pointB.x
  }

  get by() {
    return this.pointB.y
  }

  draw(ctx) {
    console.log([this.pointA.x, this.pointA.y])
    ctx.beginPath()
    ctx.moveTo(this.ax, this.ay)
    ctx.lineTo(this.bx, this.by)
    ctx.stroke()
    const vecA = this.forceA
    ctx.beginPath()
    ctx.strokeStyle = "blue"
    ctx.moveTo(this.ax, this.ay)
    ctx.lineTo(this.ax + vecA.x, this.ay + vecA.y)
    ctx.stroke()

    const vecB = this.forceB
    ctx.beginPath()
    ctx.moveTo(this.bx, this.by)
    ctx.lineTo(this.bx + vecB.x, this.by + vecB.y)
    ctx.stroke()
    ctx.strokeStyle = "black"
  }
}