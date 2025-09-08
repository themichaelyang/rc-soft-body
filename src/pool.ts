import { Vec2 } from "./vec2"

// TODO: make this generic
export class Pool {
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
      // console.log(`Pooling up! ${this.objects.length}`)
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