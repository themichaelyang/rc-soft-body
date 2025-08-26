"use strict"


let points = []
let gravity
let ctx
let width = 100
let height = 100

function main() {
  const canvas = document.getElementById("canvas")
  ctx = canvas.getContext("2d", { alpha: false })
  ctx.fillStyle = "white"
  ctx.fillRect(0, 0, canvas.width, canvas.height)
  // const ratio = window.devicePixelRatio || 1

  canvas.width = width;
  canvas.height = height;

  // display width and height is different
  canvas.style.width = '500px'
  canvas.style.height = '500px'

  pixelate(ctx)

  points.push(
    new Point(
      vec(50, 50),
      1,
      vec(0, 0),
      0.5
    )
  )
  gravity = vec(0, 0.1)

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
    const collision = pt.collideWithFloor()

    if (collision) {
      pt.handleCollision(collision)
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

  get dup() {
    return new Vec2(this.x, this.y)
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
  constructor(pos, m, v, elasticity) {
    [this.pos, this.m, this.v, this.elasticity] = [pos, m, v, elasticity]
  }
  
  get x() {
    return this.pos.x
  }

  get y() {
    return this.pos.y
  }

  collideWithFloor() {
    if (this.y > 100) {
      return new Collision(new Vec2(0, -1), this.y - 100)
    }
  }

  // TODO: https://lisyarus.github.io/blog/posts/soft-body-physics.html#section-collision-resolution
  handleCollision(collision) {
    // uncollide
    this.pos = this.pos.add(collision.normal.mult(collision.depth))
  
    // the dot product sign is negative, since the normal vector is facing the opposite 
    // way we want to go (consider the projection)
    const normalVelocity = collision.normal.mult(collision.normal.dot(this.v)).neg
    this.v = normalVelocity.mult(this.elasticity)
  }

  update(force, dt) {
    // Semi-implicit Euler ordering: https://gafferongames.com/post/integration_basics/
    this.updateVelocity(force, dt)
    this.updatePosition()
  }

  updateVelocity(force, dt) {
    this.v = this.v.add(force.mult(dt))
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