import { Point } from './point'
import { Vec2 } from './vec2'

type CanvasContext = CanvasRenderingContext2D

export class Spring {
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