import { PointMass } from './point_mass'
import { Vec2 } from './vec2'

type CanvasContext = CanvasRenderingContext2D

export class Spring {
  pointA: PointMass
  pointB: PointMass
  equilibriumLength: number
  stiffness: number

  constructor({pointA, pointB, equilibriumLength, stiffness}) {
    [this.pointA, this.pointB, this.stiffness] = [pointA, pointB, stiffness]

    if (equilibriumLength === null) {
      this.equilibriumLength = this.pointA.pos.distance(this.pointB.pos)
    }
  }

  // force acting on point A
  get forceA() {
    // return new Vec2(0, 0)
    return this.force(this.pointA.pos, this.pointB.pos)
  }

  get forceB() {
    // return new Vec2(0, 0)
    return this.force(this.pointB.pos, this.pointA.pos)
  }

  force(subject: Vec2, other: Vec2) {
    // if subject is A...
    // B - A = vector from A -> B
    const delta = other.sub(subject) 

    // We want spring force magnitude to be positive (acting in direction of A -> B) when delta.magnitude > equilibrium length
    // otherwise, negative if spring is compressed to repel A and B
    const displacement = delta.magnitude - this.equilibriumLength
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
    // console.log([this.pointA.x, this.pointA.y])
    ctx.beginPath()
    ctx.moveTo(this.ax, this.ay)
    ctx.lineTo(this.bx, this.by)
    ctx.stroke()
    // const vecA = this.forceA
    // ctx.beginPath()
    // ctx.strokeStyle = "blue"
    // ctx.moveTo(this.ax, this.ay)
    // ctx.lineTo(this.ax + vecA.x, this.ay + vecA.y)
    // ctx.stroke()

    const vecB = this.forceB
    ctx.beginPath()
    ctx.moveTo(this.bx, this.by)
    ctx.lineTo(this.bx + vecB.x, this.by + vecB.y)
    ctx.stroke()
    ctx.strokeStyle = "black"
  }
}