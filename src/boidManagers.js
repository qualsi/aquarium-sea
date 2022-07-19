import {
  AnimationMixer,
  ConeGeometry,
  DoubleSide,
  Group,
  LineBasicMaterial,
  LineSegments,
  MathUtils,
  Mesh,
  MeshPhongMaterial,
  Vector3,
  WireframeGeometry,
} from '../lib/three'
import { clone as cloneSkeleton } from '../lib/three/examples/jsm/utils/SkeletonUtils'
import { MAP_DEPTH, MAP_PADDING, MAP_SIZE, MAX_TERRAIN_HEIGHT } from './config'
import water from './Water'
const { clamp, randInt } = MathUtils

const defaultMinSpeed = 0.1
const defaultMaxSpeed = 100

const numSamplesForSmoothing = 20

const wanderWeight = 0.2
const maxWanderDive = 25
// Steer towards the average position of nearby boids
const cohesionWeight = 1
// Steers away from nearby boids
const separationWeight = 1
// Adopt the average velocity of bearby boids
const alignmentWeight = 1

const visionRange = 150

const origin = new Vector3()
const boundaryRadius = 100

let sphereCastDirections = []

class Boid {
  constructor(
    scene,
    target,
    position,
    quaternion,
    colour,
    followTarget = false,
    minHeight,
    maxHeight,
    mesh = null,
    animation,
    minSpeed = defaultMinSpeed,
    maxSpeed = defaultMaxSpeed,
    rotationOffset = 0
  ) {
    this.scene = scene
    if (mesh) {
      mesh.position.copy(position)
      if (quaternion) {
        mesh.quaternion.copy(quaternion)
      }
      this.mesh = mesh
    } else {
      const { mesh, geometry } = this.getBoid(position, quaternion, colour)
      this.mesh = mesh
      // this.geometry = geometry
    }
    if (animation) {
      this.mixer = new AnimationMixer(this.mesh)
      this.mixer.clipAction(animation).play()
    }
    this.target = target

    // re-usable acceleration vector
    this.acceleration = new Vector3()

    // velocity is speed in a given direction, and in the update method we'll
    // compute an acceleration that will change the velocity
    this.velocity = new Vector3(
      (Math.random() - 0.5) * 2,
      (Math.random() - 0.5) * 2,
      (Math.random() - 0.5) * 2
    )

    // whether this boid will follow the target
    this.followTarget = followTarget

    this.minHeight = minHeight
    this.maxHeight = maxHeight

    this.minSpeed = minSpeed
    this.maxSpeed = maxSpeed

    this.rotationOffset = rotationOffset

    // remember the last however many velocities so we can smooth the heading of the boid
    this.velocitySamples = []

    this.wanderTarget = new Vector3(
      this.mesh.position.x,
      this.mesh.position.y,
      this.mesh.position.z
    )

    this.counter = 0
    this.wanderCounter = 0
    this.arrows = []
  }

  getBoid(
    position = new Vector3(0, 0, 0),
    quaternion = null,
    color = 0x156289
  ) {
    if (color === null) {
      color = 0x156289
    }

    var geometry = new ConeGeometry(5, 10, 8)
    // rotate the geometry, because the face used by lookAt is not the cone's "tip"
    geometry.rotateX(Math.PI / 2)

    var mesh = new Group()
    var lineMaterial = new LineBasicMaterial({
      color: 0xffffff,
      transparent: true,
      opacity: 0.5,
    })
    var meshMaterial = new MeshPhongMaterial({
      color,
      emissive: 0x072534,
      side: DoubleSide,
      flatShading: true,
    })
    mesh.add(new LineSegments(new WireframeGeometry(geometry), lineMaterial))
    mesh.add(new Mesh(geometry, meshMaterial))

    mesh.position.copy(position)
    if (quaternion) {
      mesh.quaternion.copy(quaternion)
    }

    return { mesh, geometry }
  }

  /**
   * The boid will update its "steer vector" based on:
   * - Collision Avoidance: avoid collisions with nearby flockmates (and other obstacles)
   * - Velocity Matching: attempt to match velocity with nearby flockmates
   * - Flock Centering: attempt to stay close to nearby flockmates
   *
   * Alternative definitions for the above terms are:
   * - separation: steer to avoid crowding local flockmates
   * - alignment: steer towards the average heading of local flockmates
   * - cohesion: steer to move towards the average position (center of mass) of local flockmates
   */
  update(delta, neighbours, obstacles) {
    this.counter++
    this.wanderCounter++

    // fly towards the target
    // if (this.target && this.followTarget) {
    //   // var pos = this.target.position.clone()
    //   // pos.sub(this.mesh.position);
    //   // var accelerationTowardsTarget = this.steerTowards(pos).multiplyScalar(maxForceSeek);

    //   var accelerationTowardsTarget = this.seek(delta, this.target.position)

    //   // "flee" would use sub
    //   this.acceleration.add(accelerationTowardsTarget)
    // } else {
    //   if (this.mesh.position.distanceTo(origin) > boundaryRadius) {
    //     this.acceleration.add(this.wander(delta).multiplyScalar(20))
    //   } else {
    //     this.acceleration.add(this.wander(delta).multiplyScalar(wanderWeight))
    //   }
    // }
    this.acceleration.add(this.wander(delta).multiplyScalar(wanderWeight))

    // steering behaviour: alignment
    this.acceleration.add(
      this.alignment(delta, neighbours).multiplyScalar(alignmentWeight)
    )

    // steering behaviour: cohesion
    this.acceleration.add(
      this.cohesion(delta, neighbours).multiplyScalar(cohesionWeight)
    )

    // steering behaviour: separation
    this.acceleration.add(
      this.separation(delta, neighbours).multiplyScalar(separationWeight)
    )

    // // avoid collisions with world obstacles
    // var originPoint = this.mesh.position.clone()
    // var localVertex = new Vector3(
    //   ...this.geometry.attributes.position.array.slice(
    //     0,
    //     this.geometry.attributes.position.itemSize
    //   )
    // )
    // var globalVertex = localVertex.applyMatrix4(this.mesh.matrix)
    // var directionVector = globalVertex.sub(this.mesh.position)
    // var raycaster = new Raycaster(
    //   originPoint,
    //   directionVector.clone().normalize(),
    //   0,
    //   visionRange
    // )

    // if (DEBUG) {
    //   const arrow = new ArrowHelper(
    //     raycaster.ray.direction,
    //     raycaster.ray.origin,
    //     50,
    //     0xff0000
    //   )
    //   if (this.counter % 50 === 0) {
    //     arrow.name = Math.random().toString(36).substring(2, 15)
    //     this.arrows.push(arrow)
    //     this.scene.add(arrow)
    //     if (this.arrows.length > 3) {
    //       var toBeRemoved = this.arrows.shift()
    //       this.scene.remove(this.scene.getObjectByName(toBeRemoved.name))
    //     }
    //   }
    // }

    // // obstacle meshes are Group, and the first child is the mesh we want to ray-trace
    // var collisionResults = raycaster.intersectObjects(
    //   obstacles.map((o) => o.mesh.children[0])
    // )
    // if (collisionResults.length > 0) {
    //   // flee from the object
    //   // var seek = this.seek(delta, collisionResults[0].point)
    //   // this.acceleration.add(seek.negate().multiplyScalar(100))

    //   // gently dodge object
    //   for (var i = 0; i < sphereCastDirections.length; i++) {
    //     const direction = sphereCastDirections[i]
    //     raycaster = new Raycaster(originPoint, direction, 0, visionRange)
    //     var spectrumCollision = raycaster.intersectObject(
    //       collisionResults[0].object
    //     )
    //     if (spectrumCollision.length === 0) {
    //       this.acceleration.add(direction.clone().multiplyScalar(100))
    //       break
    //     }
    //   }
    // }

    this.applyAcceleration(delta)

    this.lookWhereGoing()

    if (this.mixer) this.mixer.update(delta)
  }

  applyAcceleration(delta) {
    this.velocity.add(this.acceleration)
    this.acceleration.set(0, 0, 0) // reset
    this.velocity.clampLength(this.minSpeed, this.maxSpeed)
    this.mesh.position.add(this.velocity)
    if (
      this.mesh.position.x < -MAP_SIZE / 2 ||
      this.mesh.position.x > MAP_SIZE / 2
    ) {
      this.mesh.position.x =
        this.mesh.position.x > 0 ? MAP_SIZE / 2 : -MAP_SIZE / 2
      this.velocity.x = 0
    }
    if (
      this.mesh.position.y < this.minHeight ||
      this.mesh.position.y > this.maxHeight
    ) {
      this.mesh.position.y =
        this.mesh.position.y > this.maxHeight ? this.maxHeight : this.minHeight
      this.velocity.y = 0
    }
    if (
      this.mesh.position.z < -MAP_SIZE / 2 ||
      this.mesh.position.z > MAP_SIZE / 2
    ) {
      this.mesh.position.z =
        this.mesh.position.z > 0 ? MAP_SIZE / 2 : -MAP_SIZE / 2
      this.velocity.z = 0
    }
  }

  /**
   * Once the boid reaches a stationary target, and the target doesn't change, it will flip/flop on the spot.
   * That's because the old velocity is retained.
   * @param {*} delta
   * @param {*} target
   */
  seek(delta, target) {
    var steerVector = target.clone().sub(this.mesh.position)
    steerVector.normalize()
    steerVector.multiplyScalar(this.maxSpeed)
    steerVector.sub(this.velocity)

    var maxForce = delta * 5
    steerVector.clampLength(0, maxForce)
    return steerVector
  }

  /**
   * From the paper:
   * Collision Avoidance: avoid collisions with nearby flockmates (aka separation)
   *
   * Simply look at each neighbour, and if it's within a defined small distance (say 100 units),
   * then move it as far away again as it already is. This is done by subtracting from a vector
   * "steerVector" (initialised to zero) the displacement of each neighbour which is nearby.
   */
  separation(delta, neighbours, range = 30) {
    const steerVector = new Vector3()

    var neighbourInRangeCount = 0

    neighbours.forEach((neighbour) => {
      // skip same object
      if (neighbour.mesh.id === this.mesh.id) return

      const distance = neighbour.mesh.position.distanceTo(this.mesh.position)
      if (distance <= range) {
        var diff = this.mesh.position.clone().sub(neighbour.mesh.position)
        diff.divideScalar(distance) // weight by distance
        steerVector.add(diff)
        neighbourInRangeCount++
      }
    })

    if (neighbourInRangeCount !== 0) {
      steerVector.divideScalar(neighbourInRangeCount)
      steerVector.normalize()
      steerVector.multiplyScalar(this.maxSpeed)
      var maxForce = delta * 5
      steerVector.clampLength(0, maxForce)
    }

    return steerVector
  }

  /**
   * Produces a steering force that keeps a boid's heading aligned with its neighbours.
   * (average velocity)
   *
   * @param {*} neighbours
   */
  alignment(delta, neighbours, range = 50) {
    let steerVector = new Vector3()
    const averageDirection = new Vector3()

    var neighboursInRangeCount = 0

    neighbours.forEach((neighbour) => {
      // skip same object
      if (neighbour.mesh.id === this.mesh.id) return

      const distance = neighbour.mesh.position.distanceTo(this.mesh.position)
      if (distance <= range) {
        neighboursInRangeCount++
        averageDirection.add(neighbour.velocity.clone())
      }
    })

    if (neighboursInRangeCount > 0) {
      averageDirection.divideScalar(neighboursInRangeCount)
      averageDirection.normalize()
      averageDirection.multiplyScalar(this.maxSpeed)

      steerVector = averageDirection.sub(this.velocity)
      var maxForce = delta * 5
      steerVector.clampLength(0, maxForce)
    }

    return steerVector
  }

  /**
   * Produces a steering force that moves a boid toward the average position of its neighbours.
   *
   * @param {*} neighbours
   */
  cohesion(delta, neighbours, range = 50) {
    const centreOfMass = new Vector3()

    var neighboursInRangeCount = 0

    neighbours.forEach((neighbour) => {
      // skip same object
      if (neighbour.mesh.id === this.mesh.id) return

      const distance = neighbour.mesh.position.distanceTo(this.mesh.position)
      if (distance <= range) {
        neighboursInRangeCount++
        centreOfMass.add(neighbour.mesh.position)
      }
    })

    if (neighboursInRangeCount > 0) {
      centreOfMass.divideScalar(neighboursInRangeCount)

      // "seek" the centre of mass
      return this.seek(delta, centreOfMass)
    } else {
      return new Vector3()
    }
  }

  rndCoord(range = boundaryRadius) {
    return (Math.random() - 0.5) * range * 2
  }
  wander(delta) {
    var distance = this.mesh.position.distanceTo(this.wanderTarget)
    if (distance < 5) {
      // when we reach the target, set a new random target
      this.wanderTarget = new Vector3(
        randInt(-MAP_SIZE / 2, MAP_SIZE / 2),
        randInt(
          clamp(
            this.mesh.position.y - maxWanderDive,
            this.minHeight,
            this.maxHeight
          ),
          clamp(
            this.mesh.position.y + maxWanderDive,
            this.minHeight,
            this.maxHeight
          )
        ),
        randInt(-MAP_SIZE / 2, MAP_SIZE / 2)
      )
      this.wanderCounter = 0
    } else if (this.wanderCounter > 500) {
      this.wanderTarget = new Vector3(
        randInt(-MAP_SIZE / 2, MAP_SIZE / 2),
        randInt(
          clamp(
            this.mesh.position.y - maxWanderDive,
            this.minHeight,
            this.maxHeight
          ),
          clamp(
            this.mesh.position.y + maxWanderDive,
            this.minHeight,
            this.maxHeight
          )
        ),
        randInt(-MAP_SIZE / 2, MAP_SIZE / 2)
      )
      this.wanderCounter = 0
    }

    return this.seek(delta, this.wanderTarget)
  }

  lookWhereGoing(smoothing = true) {
    var direction = this.velocity.clone()
    if (smoothing) {
      if (this.velocitySamples.length == numSamplesForSmoothing) {
        this.velocitySamples.shift()
      }

      this.velocitySamples.push(this.velocity.clone())
      direction.set(0, 0, 0)
      this.velocitySamples.forEach((sample) => {
        direction.add(sample)
      })
      direction.divideScalar(this.velocitySamples.length)
    }

    direction.add(this.mesh.position)
    this.mesh.lookAt(direction)
    if (this.rotationOffset != 0) this.mesh.rotateY(this.rotationOffset)
  }
}

class BoidManager {
  /**
   * @param {*} numberOfBoids
   * @param {*} obstacles other obstacles in the world to consider when avoiding collisions
   * @param {*} target a target for all boids to move towards
   */
  constructor(
    scene,
    numberOfBoids = 20,
    obstacles = [],
    target = null,
    minHeight,
    maxHeight,
    mesh = null,
    animation,
    minSpeed,
    maxSpeed,
    rotationOffset
  ) {
    minHeight ??= -MAP_DEPTH + MAX_TERRAIN_HEIGHT + MAP_PADDING
    maxHeight ??= water.position.y - MAP_PADDING
    // create the boids
    this.initBoids(
      scene,
      numberOfBoids,
      target,
      minHeight,
      maxHeight,
      mesh,
      animation,
      minSpeed,
      maxSpeed,
      rotationOffset
    )

    // for each boid, add the other boids to its collidableMeshList, and also add
    // the meshes from the common collidableMeshList

    this.obstacles = obstacles
  }

  initBoids(
    scene,
    numberOfBoids,
    target,
    minHeight,
    maxHeight,
    mesh,
    animation,
    minSpeed,
    maxSpeed,
    rotationOffset
  ) {
    this.boids = this.boids || []

    var randomX, randomY, randomZ, colour, followTarget, quaternion

    for (let i = 0; i < numberOfBoids; i++) {
      randomX = randInt(-MAP_SIZE / 2, MAP_SIZE / 2)
      randomY = randInt(minHeight, maxHeight)
      randomZ = randInt(-MAP_SIZE / 2, MAP_SIZE / 2)
      colour = null // will use default color in getBoid
      followTarget = false
      quaternion = null

      // reference boid
      // if (i === 0) {
      //   randomX = 0
      //   randomY = maxHeight
      //   randomZ = 0
      //   colour = 0xe56289
      //   // followTarget = true
      //   quaternion = null
      // }

      var position = new Vector3(randomX, randomY, randomZ)

      var boid = new Boid(
        scene,
        target,
        position,
        quaternion,
        colour,
        followTarget,
        minHeight,
        maxHeight,
        animation ? cloneSkeleton(mesh) : mesh.clone(),
        animation,
        minSpeed,
        maxSpeed,
        rotationOffset
      )
      this.boids.push(boid)
    }
  }

  update(delta) {
    this.boids.forEach((boid) => {
      boid.update(delta, this.boids, this.obstacles)
    })
  }
}

export { BoidManager }
