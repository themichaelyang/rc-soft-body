import { vec, Vec2 } from './vec2'
import { Point } from './point'

let points: Point[] = []
let springs: Spring[] = []

let canvas: HTMLCanvasElement
let gravity: Vec2
let ctx: CanvasRenderingContext2D

const world = {
  width: 100,
  height: 100
}

type CanvasContext = CanvasRenderingContext2D

function main() {
  canvas = document.getElementById("canvas") as HTMLCanvasElement
  ctx = canvas.getContext("2d", { alpha: false }) as CanvasContext
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

function pixelate(ctx: CanvasRenderingContext2D) {
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

class Spring {
  pointA: Point
  pointB: Point
  equilibriumLength: number
  stiffness: number

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

  // TODO: something is wrong with the spring calculations...
  force(origin: Vec2, dest: Vec2) {
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

  draw(ctx: CanvasContext) {
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