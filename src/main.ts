import { vec, Vec2 } from './vec2'
import { PointMass } from './point_mass'
import { Spring } from './spring'

let points: PointMass[] = []
let springs: Spring[] = []

let canvas: HTMLCanvasElement
let gravity: Vec2
let ctx: CanvasRenderingContext2D

const world = {
  width: 100,
  height: 100
}

function random(n) {
  return Math.floor(Math.random() * n)
}

function main() {
  canvas = document.getElementById("canvas") as HTMLCanvasElement
  ctx = canvas.getContext("2d", { alpha: false }) as CanvasRenderingContext2D
  ctx.fillStyle = "white"
  ctx.fillRect(0, 0, canvas.width, canvas.height)
  // const ratio = window.devicePixelRatio || 1

  canvas.width = world.width;
  canvas.height = world.height;

  // display width and height is different
  canvas.style.width = '500px'
  canvas.style.height = '500px'

  pixelate(ctx)

  // for (let i = 0; i < 10; i++) {
  //   points.push(new PointMass({
  //     pos: vec(random(world.width / 2), random(world.height / 2)),
  //     v: vec(random(3), random(3)),
  //     m: 1, 
  //     elasticity: random(5) / 5 + 0.2, 
  //     friction: random(10) / 50
  //   }))
  // }
  // const p1 = new PointMass({pos: vec(1, 50), m: 1, v: vec(0.1, -2), elasticity: 0.6, friction: 0.01})
  // const p2 = new PointMass({pos: vec(25, 0), m: 1, v: vec(0.2, 0), elasticity: 0.8, friction: 0.1})
  const p1 = new PointMass({pos: vec(50, 50), m: 1, v: vec(0, 0), elasticity: 0.6, friction: 0.1})
  const p2 = new PointMass({pos: vec(25, 25), m: 1, v: vec(0, 0.1), elasticity: 0.8, friction: 0.1})
  const spring = new Spring({pointA: p1, pointB: p2, equilibriumLength: 25, stiffness: 0.1})

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
  
  springs.forEach((spr) => {
    spr.pointA.updateVelocity(spr.forceA, 0.1)
    spr.pointB.updateVelocity(spr .forceB, 0.1)
    spr.draw(ctx)
  })

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