/** The characters the rain falls in and the decode scrambles text into. */
export const GLYPHS = '0123456789'

/** Falling digits on a canvas the size of the viewport, in the current theme's
    colours. Returns a stop function. With transparent set, the trails fade to
    clear instead of to the page colour, so whatever is behind the canvas
    shows through. */
export function rain(canvas: HTMLCanvasElement, { transparent = false } = {}) {
  const context = canvas.getContext('2d')
  if (!context) return () => {}

  const ratio = Math.min(window.devicePixelRatio || 1, 2)
  const width = window.innerWidth
  const height = window.innerHeight
  const size = width < 640 ? 14 : 16
  const columns = Math.ceil(width / size)
  const rows = Math.ceil(height / size)
  const styles = getComputedStyle(document.documentElement)
  const background = styles.getPropertyValue('--color-background').trim()
  const phosphor = styles.getPropertyValue('--color-phosphor').trim()
  const hot = styles.getPropertyValue('--color-phosphor-hot').trim()

  canvas.width = width * ratio
  canvas.height = height * ratio
  context.scale(ratio, ratio)
  context.font = `500 ${size}px ${getComputedStyle(document.body).fontFamily}`
  context.textBaseline = 'top'
  if (!transparent) {
    context.fillStyle = background
    context.fillRect(0, 0, width, height)
  }

  // Each column is one falling drop: its row, and the digit at its head.
  const drops = Array.from({ length: columns }, () => ({
    row: Math.floor(Math.random() * rows * 2) - rows,
    glyph: '0',
  }))

  const step = () => {
    // A translucent wash each step is what leaves the fading trails.
    context.globalAlpha = 0.14
    if (transparent) {
      context.globalCompositeOperation = 'destination-out'
      context.fillRect(0, 0, width, height)
      context.globalCompositeOperation = 'source-over'
    } else {
      context.fillStyle = background
      context.fillRect(0, 0, width, height)
    }
    context.globalAlpha = 1

    drops.forEach((drop, column) => {
      const x = column * size

      // The previous head becomes part of the trail.
      context.fillStyle = phosphor
      context.fillText(drop.glyph, x, drop.row * size)

      drop.row++
      drop.glyph = GLYPHS[(Math.random() * GLYPHS.length) | 0]
      context.fillStyle = hot
      context.fillText(drop.glyph, x, drop.row * size)

      if (drop.row > rows && Math.random() > 0.9) drop.row = -1
    })
  }

  // Already raining on the first frame the visitor sees.
  for (let i = 0; i < 28; i++) step()

  let frameId = 0
  let tick = 0
  const frame = () => {
    if (tick++ % 2 === 0) step()
    frameId = requestAnimationFrame(frame)
  }
  frameId = requestAnimationFrame(frame)

  return () => cancelAnimationFrame(frameId)
}
