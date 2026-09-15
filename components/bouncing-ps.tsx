'use client'

import { useEffect, useRef, useState } from 'react'
import {
  motion,
  useAnimationFrame,
  useMotionValue,
  useReducedMotion,
  type PanInfo,
} from 'motion/react'

// The syntax-highlight palette from global.css, so the 404 uses colours the
// rest of the site already owns.
const palette = ['#4c97f8', '#f47067', '#0fa295', '#e25a1c', '#6266d1', '#fafafa']

// Pixels per second. Thrown letters ease back down to cruise; stalled ones
// ease back up to it.
const cruise = 110
const maxThrow = 2600

type Body = {
  id: number
  size: number
  x: number
  y: number
  vx: number
  vy: number
  spin: number
  color: number
}

function random(min: number, max: number) {
  return min + Math.random() * (max - min)
}

// How many letters, and how big, follows the viewport: a phone gets a
// handful of small ones so the copy stays readable, a desktop the full crowd.
function scatter(width: number, height: number): Body[] {
  const count = Math.min(14, Math.max(6, Math.round((width * height) / 55000)))
  const edge = Math.min(width, height)

  return Array.from({ length: count }, (_, id) => {
    const size = Math.round(
      Math.min(120, Math.max(28, random(edge * 0.06, edge * 0.15)))
    )
    const angle = random(0, Math.PI * 2)

    return {
      id,
      size,
      x: random(0, Math.max(0, width - size)),
      y: random(0, Math.max(0, height - size)),
      vx: Math.cos(angle) * cruise,
      vy: Math.sin(angle) * cruise,
      spin: random(-40, 40),
      color: id % palette.length,
    }
  })
}

export function BouncingPs() {
  const boundsRef = useRef<HTMLDivElement>(null)
  const [bodies, setBodies] = useState<Body[] | null>(null)
  const reducedMotion = useReducedMotion()

  // Positions are random, so they can't be rendered on the server without a
  // hydration mismatch. Measure and scatter once the container exists.
  useEffect(() => {
    const bounds = boundsRef.current?.getBoundingClientRect()
    if (bounds) setBodies(scatter(bounds.width, bounds.height))
  }, [])

  return (
    <div
      ref={boundsRef}
      aria-hidden
      className="fixed inset-0 -z-10 overflow-hidden"
    >
      {bodies?.map((body) => (
        <BouncingP
          key={body.id}
          body={body}
          boundsRef={boundsRef}
          frozen={Boolean(reducedMotion)}
        />
      ))}
    </div>
  )
}

function BouncingP({
  body,
  boundsRef,
  frozen,
}: {
  body: Body
  boundsRef: React.RefObject<HTMLDivElement | null>
  frozen: boolean
}) {
  const x = useMotionValue(body.x)
  const y = useMotionValue(body.y)
  const rotate = useMotionValue(0)
  const velocity = useRef({ x: body.vx, y: body.vy, spin: body.spin })
  const dragging = useRef(false)
  const [color, setColor] = useState(body.color)

  useAnimationFrame((_, delta) => {
    if (frozen || dragging.current) return

    const bounds = boundsRef.current?.getBoundingClientRect()
    if (!bounds) return

    // Cap the step so a tab that was in the background doesn't teleport
    // everything when it comes back.
    const dt = Math.min(delta, 50) / 1000
    const v = velocity.current

    // Ease speed back toward cruise: a flung letter slows down, a dropped one
    // picks itself back up.
    const speed = Math.hypot(v.x, v.y)
    if (speed > 0) {
      const eased = speed + (cruise - speed) * Math.min(1, dt * 1.5)
      v.x *= eased / speed
      v.y *= eased / speed
    } else {
      const angle = random(0, Math.PI * 2)
      v.x = Math.cos(angle) * cruise
      v.y = Math.sin(angle) * cruise
    }
    v.spin += (body.spin - v.spin) * Math.min(1, dt * 1.5)

    const maxX = bounds.width - body.size
    const maxY = bounds.height - body.size
    let nextX = x.get() + v.x * dt
    let nextY = y.get() + v.y * dt
    let hitWall = false

    if (nextX < 0) {
      nextX = 0
      v.x = Math.abs(v.x)
      hitWall = true
    } else if (nextX > maxX) {
      nextX = maxX
      v.x = -Math.abs(v.x)
      hitWall = true
    }

    if (nextY < 0) {
      nextY = 0
      v.y = Math.abs(v.y)
      hitWall = true
    } else if (nextY > maxY) {
      nextY = maxY
      v.y = -Math.abs(v.y)
      hitWall = true
    }

    x.set(nextX)
    y.set(nextY)
    rotate.set(rotate.get() + v.spin * dt)

    // The DVD-logo rule: every wall hit is a new colour.
    if (hitWall) setColor((current) => (current + 1) % palette.length)
  })

  const onDragEnd = (_: unknown, info: PanInfo) => {
    dragging.current = false

    const thrown = Math.hypot(info.velocity.x, info.velocity.y)
    const v = velocity.current

    if (thrown < 30) {
      // Set down gently: wander off in a fresh direction.
      const angle = random(0, Math.PI * 2)
      v.x = Math.cos(angle) * cruise
      v.y = Math.sin(angle) * cruise
    } else {
      const scale = Math.min(1, maxThrow / thrown)
      v.x = info.velocity.x * scale
      v.y = info.velocity.y * scale
    }

    v.spin = Math.max(-420, Math.min(420, v.x * 0.25))
  }

  return (
    <motion.div
      drag
      dragConstraints={boundsRef}
      dragElastic={0.15}
      dragMomentum={false}
      onDragStart={() => {
        dragging.current = true
      }}
      onDragEnd={onDragEnd}
      whileHover={{ scale: 1.12 }}
      whileTap={{ scale: 0.96 }}
      style={{ x, y, rotate, width: body.size, height: body.size }}
      className="absolute flex cursor-grab select-none items-center justify-center active:cursor-grabbing"
    >
      <span
        className="font-bold leading-none transition-colors duration-300"
        style={{ fontSize: body.size, color: palette[color] }}
      >
        P
      </span>
    </motion.div>
  )
}
