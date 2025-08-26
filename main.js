"use strict"


let points = []
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

  points.push(
    new Point({pos: vec(0, 0), m: 1, v: vec(0, 0), elasticity: 0.6, friction: 0.1})
  )
  gravity = vec(0.01, 0.2)

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
    return new Vec2(this.x + dx, this.y + dy)
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

  get magnitude() {
    return Math.sqrt(this.dot(this))
  }

  // rotate 90 degrees clockwise
  get right() {
    return new Vec2(this.y, -this.x)
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
    this.v = normalVelocity.mult(this.elasticity).add(tangentVelocity.mult(this.friction))
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
  // F = -k(|x|-d)(x/|x|) - bv
  // constructor(posA, posB, damping, )
}