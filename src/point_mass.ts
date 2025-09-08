import { vec, Vec2 } from './vec2'
import { Collision } from './collision'

export class PointMass {
  _pos: Vec2
  m: number
  _v: Vec2 
  elasticity: number
  friction: number

  constructor({pos, m, v, elasticity, friction}) {
    // duplicate the pos and v to free it from the pool if created from vector calculations
    [this._pos, this.m, this._v, this.elasticity, this.friction] = [pos.dup, m, v.dup, elasticity, friction]

    if (this.v === null) {
      this.v = vec(0, 0)
    }
  }
  
  get x() {
    return this.pos.x
  }

  get y() {
    return this.pos.y
  }

  get pos() {
    return this._pos
  }

  set pos(newPos: Vec2) {
    // console.assert(Vec2.pool.objects.indexOf(this._pos) == -1, "Position should be outside of object pool!")

    this._pos.assign(newPos)
  }

  get v() {
    return this._v
  }

  set v(v2: Vec2) {
    this._v.assign(v2)
  }

  collisionsWithBorders(width: number, height: number) {
    const collisions = []

    if (this.y > height) { collisions.push(new Collision(Vec2.create(0, -1), this.y - height)) }
    else if (this.y < 0) { collisions.push(new Collision(Vec2.create(0, 1), -this.y)) }

    if (this.x > width) { collisions.push(new Collision(Vec2.create(-1, 0), this.x - width)) }
    else if (this.x < 0) { collisions.push(new Collision(Vec2.create(1, 0), -this.x)) }

    return collisions
  }

  collide(collisions: Collision[]) {
    collisions.forEach((c) => this.handleCollision(c))
  }

  // TODO: https://lisyarus.github.io/blog/posts/soft-body-physics.html#section-collision-resolution
  handleCollision(collision: Collision) {
    // uncollide
    this.pos = this.pos.add(collision.normal.mult(collision.depth))
 
    // normal collision vector is in "opposite" direction of velocity
    const normalVelocity = collision.normal.mult(-collision.normal.dot(this.v))

    // console.log(`v: ${this.v}`)
    // console.log(`collision normal: ${collision.normal}`)
    // console.log(`normal: ${normalVelocity}`)

    // Get tangent by removing original velocity in normal direction. Add, because the normalVelocity
    // is "opposite" direction of the original velocity.
    const tangentVelocity = this.v.add(normalVelocity)

    this.v = normalVelocity.mult(this.elasticity).add(tangentVelocity.mult(1 - this.friction))
  }

  update(force: Vec2, dt: number) {
    // Semi-implicit Euler ordering: https://gafferongames.com/post/integration_basics/
    this.updateVelocity(force, dt)
    this.updatePosition()
  }

  updateVelocity(force: Vec2, dt: number) {
    this.v = this.v.add(force.div(this.m).mult(dt))
  }

  updatePosition() {
    this.pos = this.pos.add(this.v)
  }

  draw(ctx: CanvasRenderingContext2D) {
    ctx.beginPath()
    ctx.arc(this.x, this.y, this.m, 0, 2 * Math.PI)
    ctx.stroke()
  }
}
