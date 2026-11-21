'use client'

import { useEffect, useRef } from 'react'
import { useTheme } from 'next-themes'
import { useReducedMotion } from 'motion/react'
import { rain } from './rain'

/** Falling digits behind the 404 page for as long as it is open. Dimmed so
    the copy stays easy to read, and under the bouncing Ps so they can still be
    grabbed. */
export function RainBackdrop() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const { resolvedTheme } = useTheme()
  const reducedMotion = useReducedMotion()

  useEffect(() => {
    const canvas = canvasRef.current
    // The canvas renders either way so the server and client markup match;
    // with reduced motion it just stays blank.
    if (!canvas || reducedMotion) return

    let stop = () => {}
    const start = () => {
      stop()
      stop = rain(canvas, { transparent: true })
    }

    // A frame late, so after a theme switch the new class is on <html> and
    // the rain picks up the new colours.
    const frameId = requestAnimationFrame(start)

    // The rain is sized to the viewport when it starts.
    let resizeTimer = 0
    const onResize = () => {
      window.clearTimeout(resizeTimer)
      resizeTimer = window.setTimeout(start, 150)
    }
    window.addEventListener('resize', onResize)

    return () => {
      cancelAnimationFrame(frameId)
      window.clearTimeout(resizeTimer)
      window.removeEventListener('resize', onResize)
      stop()
    }
  }, [resolvedTheme, reducedMotion])

  return (
    <canvas
      ref={canvasRef}
      aria-hidden
      className="pointer-events-none fixed inset-0 -z-20 h-full w-full opacity-35"
    />
  )
}
