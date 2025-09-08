import { vec, Vec2 } from './vec2'
import { PointMass } from './point_mass'
import { Spring } from './spring'

// TODO: get rid of these globals!
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

function addPointsAndSprings([morePoints, moreSprings]) {
  points.push(...morePoints)
  springs.push(...moreSprings)
}

function makeSpringyRectangle(topLeft: Vec2, v: Vec2, width, height, cornerMass, elasticity, friction, stiffness): [PointMass[], Spring[]] {
  let corners: PointMass[] = [
    new PointMass({pos: topLeft, m: cornerMass, elasticity, friction, v}),
    new PointMass({pos: topLeft.add(vec(width, 0)), m: cornerMass, elasticity, friction, v}),
    new PointMass({pos: topLeft.add(vec(0, height)), m: cornerMass, elasticity, friction, v}),
    new PointMass({pos: topLeft.add(vec(width, height)), m: cornerMass, elasticity, friction, v})
  ]

  let springs: Spring[] = []
  for (let i = 0; i < corners.length; i++) {
    for (let j = i+1; j < corners.length; j++) {
      springs.push(
        new Spring({ pointA: corners[i], pointB: corners[j], equilibriumLength: null, stiffness})
      )
    }
  }

  return [corners, springs]
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

  // const p1 = new PointMass({pos: vec(1, 50), m: 1, v: vec(0.1, -2), elasticity: 1, friction: 0})
  // const p2 = new PointMass({pos: vec(25, 0), m: 1, v: vec(0.2, 0), elasticity: 1, friction: 0})

  // const p1 = new PointMass({pos: vec(25, 25), m: 1, v: vec(0, -0.1), elasticity: 0.6, friction: 0.1})
  // const p2 = new PointMass({pos: vec(75, 25), m: 1, v: vec(0, 0.1), elasticity: 0.8, friction: 0.1})
  // const spring = new Spring({pointA: p1, pointB: p2, equilibriumLength: null, stiffness: 1})

  // points.push(p1, p2)
  // springs.push(spring)

  // let rect = makeSpringyRectangle(vec(50, 50), 10, 10, 1, 0.5, 0.1, 0.5)
  // addPointsAndSprings(makeSpringyRectangle(vec(10, 15), vec(0.5, -0.5), 10, 10, 1, 0.7, 0.1, 0.8))

  // for (let i = 0; i < 2; i++) {
    // addPointsAndSprings(makeSpringyRectangle(vec(random(50), random(50)), vec(random(10) / 10 + 0.1, random(10) / 10 + 0.1), 10, 10, 1, 0.7, 0.1, 0.8))
  // }
  ;[points, springs] = makeSpringyRectangle(vec(50, 50), vec(0, 0), 10, 10, 1, 0.8, 0.1, 0.5)

  gravity = vec(0, 0.2)

  // @ts-ignore
  var script=document.createElement('script');script.onload=function(){var stats=new Stats();document.body.appendChild(stats.dom);requestAnimationFrame(function loop(){stats.update();requestAnimationFrame(loop)});};script.src='https://mrdoob.github.io/stats.js/build/stats.min.js';document.head.appendChild(script);

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

  // TODO: make springs and points share an interface for draw and update!
  springs.forEach((spr) => {
    spr.pointA.updateVelocity(spr.forceA, 0.1)
    spr.pointB.updateVelocity(spr.forceB, 0.1)
  })

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
    spr.draw(ctx)
  })

  Vec2.pool.free()
  window.requestAnimationFrame(loop)
}