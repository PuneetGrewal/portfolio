'use client'

import { useEffect, useLayoutEffect } from 'react'
import { usePathname } from 'next/navigation'
import { GLYPHS, rain } from './rain'

// Runs the matrix effects for the whole site from one place, so no page has to
// know about them:
//
//   first load of a visit   rain, then every piece of text decodes
//   every later page        a quick decode of the page content
//   images and video        a scan line wipes each one in as it scrolls into view
//
// The text effect swaps characters inside the page's real text nodes and puts
// them back exactly as they were. It never adds, removes or moves an element,
// so the server-rendered HTML stays the single source of the content.

/** Length of the whole first-load sequence. */
const INTRO_MS = 1900
/** Length of the decode on every later page. */
const PAGE_MS = 500
const SESSION_KEY = 'mx-intro'
/** Text inside these is left alone. */
const SKIP =
  'script,style,noscript,svg,[aria-hidden="true"],[data-mx-skip],.sr-only'
/** Only letters and digits are swapped. Spaces and punctuation stay, which
    keeps every line breaking where it does in the real text. */
const WORD = /[0-9A-Za-z\u00C0-\u024F]/

type Target = {
  node: Text
  orig: string
  /** What we last wrote. If the node holds anything else, someone else has
      changed it and we let go of it. */
  last: string
  start: number
  dur: number
  rest: Range | null
  head: Range | null
  done: boolean
}

const useIsoLayoutEffect =
  typeof window === 'undefined' ? useEffect : useLayoutEffect

function reducedMotion() {
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches
}

function scramble(text: string, from: number) {
  let out = ''

  for (let i = from; i < text.length; i++) {
    const character = text[i]
    // A digit straight after a hyphen can't wrap where a letter can
    // ("co-op" may break after the hyphen, "12-34" may not), so that one
    // character keeps its real value.
    out +=
      WORD.test(character) && text[i - 1] !== '-'
        ? GLYPHS[(Math.random() * GLYPHS.length) | 0]
        : character
  }

  return out
}

function collect(root: Element) {
  const nodes: Text[] = []
  const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT)

  for (let node = walker.nextNode(); node; node = walker.nextNode()) {
    const text = node as Text
    const parent = text.parentElement

    if (!parent || !WORD.test(text.data) || parent.closest(SKIP)) continue

    // Hover captions and anything else that isn't showing right now.
    if (
      typeof parent.checkVisibility === 'function' &&
      !parent.checkVisibility({
        checkOpacity: true,
        checkVisibilityCSS: true,
      })
    ) {
      continue
    }

    nodes.push(text)
  }

  return nodes
}

/** Where each line of a text node starts and how wide it is. */
function lineSignature(node: Text) {
  const range = document.createRange()
  range.selectNodeContents(node)

  let signature = ''
  for (const rect of Array.from(range.getClientRects())) {
    signature += `${Math.round(rect.top)}:${Math.round(rect.width)}|`
  }

  return signature
}

/** Scrambles every text node under root and returns the ones to animate. */
function prepare(root: Element): Target[] {
  const nodes = collect(root)
  const before = nodes.map(lineSignature)

  const targets = nodes.map((node) => {
    const orig = node.data
    const last = scramble(orig, 0)
    node.data = last

    return {
      node,
      orig,
      last,
      start: 0,
      dur: 0,
      rest: null,
      head: null,
      done: false,
    } as Target
  })

  // Monospace digits take the same room as the letters they stand in for, so
  // nothing should have moved. If a node's lines did move (a fallback font, an
  // unusual break), it is put back and simply doesn't animate.
  targets.forEach((target, index) => {
    if (lineSignature(target.node) !== before[index]) {
      target.node.data = target.orig
      target.done = true
    }
  })

  return targets.filter((target) => !target.done)
}

/** Top of the page first: start times follow each node's position. */
function schedule(targets: Target[], total: number, delay: number) {
  if (!targets.length) return

  const viewport = window.innerHeight
  const tops = targets.map((target) => {
    const range = document.createRange()
    range.selectNodeContents(target.node)
    return Math.max(0, Math.min(range.getBoundingClientRect().top, viewport))
  })

  const first = Math.min(...tops)
  const span = Math.max(1, Math.max(...tops) - first)
  const spread = total * 0.5

  targets.forEach((target, index) => {
    target.start = delay + spread * ((tops[index] - first) / span)
    target.dur = Math.max(
      140,
      Math.min(total - spread, target.orig.length * 5),
    )
  })
}

/** Animates the targets back to their real text. Returns a cancel function
    that restores everything at once. */
function run(targets: Target[], onDone: () => void) {
  const view = window as any
  const canHighlight =
    typeof view.Highlight === 'function' && view.CSS && view.CSS.highlights
  const rest = canHighlight ? new view.Highlight() : null
  const head = canHighlight ? new view.Highlight() : null

  if (canHighlight) {
    view.CSS.highlights.set('mx-rest', rest)
    view.CSS.highlights.set('mx-head', head)
  }

  let frameId = 0
  let startedAt = 0
  let tick = 0
  let stopped = false

  // Replacing a text node's data collapses any range inside it, so the ranges
  // are set again after every write.
  const paint = (target: Target, resolved: number, started: boolean) => {
    if (!canHighlight) return

    const length = target.node.data.length

    if (!target.rest) {
      target.rest = document.createRange()
      rest.add(target.rest)
    }
    target.rest.setStart(target.node, Math.min(length, started ? resolved + 1 : 0))
    target.rest.setEnd(target.node, length)

    if (!started) return

    if (!target.head) {
      target.head = document.createRange()
      head.add(target.head)
    }
    target.head.setStart(target.node, Math.min(length, resolved))
    target.head.setEnd(target.node, Math.min(length, resolved + 1))
  }

  const settle = (target: Target, restore: boolean) => {
    if (restore && target.node.isConnected && target.node.data === target.last) {
      target.node.data = target.orig
    }
    if (target.rest) rest.delete(target.rest)
    if (target.head) head.delete(target.head)
    target.rest = target.head = null
    target.done = true
  }

  const end = () => {
    stopped = true
    cancelAnimationFrame(frameId)
    targets.forEach((target) => !target.done && settle(target, true))

    if (canHighlight) {
      if (view.CSS.highlights.get('mx-rest') === rest) {
        view.CSS.highlights.delete('mx-rest')
      }
      if (view.CSS.highlights.get('mx-head') === head) {
        view.CSS.highlights.delete('mx-head')
      }
    }
  }

  const frame = (now: number) => {
    if (stopped) return
    if (!startedAt) startedAt = now

    const elapsed = now - startedAt
    let live = 0
    tick++

    for (const target of targets) {
      if (target.done) continue

      // Removed from the page, or rewritten by something else: let it go.
      if (!target.node.isConnected || target.node.data !== target.last) {
        settle(target, false)
        continue
      }

      const progress = (elapsed - target.start) / target.dur

      if (progress >= 1) {
        settle(target, true)
        continue
      }

      live++
      // Every other frame: about 30 changes a second reads as a flicker,
      // 60 reads as noise.
      if (tick % 2) continue

      const resolved =
        progress <= 0 ? 0 : Math.floor(progress * target.orig.length)
      target.last =
        target.orig.slice(0, resolved) + scramble(target.orig, resolved)
      target.node.data = target.last
      paint(target, resolved, progress > 0)
    }

    if (live) {
      frameId = requestAnimationFrame(frame)
    } else {
      end()
      onDone()
    }
  }

  targets.forEach((target) => paint(target, 0, false))
  frameId = requestAnimationFrame(frame)

  return () => {
    if (!stopped) end()
  }
}

let stopMedia = () => {}

/** Reveals each [data-mx-media] wrapper once it is on screen and its image has
    loaded. Calling it again replaces the previous observer. */
function observeMedia() {
  stopMedia()
  stopMedia = () => {}

  const pending = Array.from(
    document.querySelectorAll<HTMLElement>('[data-mx-media]:not([data-mx-in])'),
  )
  const reveal = (element: HTMLElement) => element.setAttribute('data-mx-in', '')

  if (!pending.length) return
  if (!('IntersectionObserver' in window)) {
    pending.forEach(reveal)
    return
  }

  const observer = new IntersectionObserver(
    (entries) => {
      for (const entry of entries) {
        if (!entry.isIntersecting) continue

        const element = entry.target as HTMLElement
        const image = element.querySelector('img')
        observer.unobserve(element)

        if (!image || image.complete) {
          reveal(element)
        } else {
          const show = () => reveal(element)
          image.addEventListener('load', show, { once: true })
          image.addEventListener('error', show, { once: true })
          // Never leave it hidden behind a slow image.
          window.setTimeout(show, 3000)
        }
      }
    },
    { threshold: 0.15 },
  )

  pending.forEach((element) => observer.observe(element))
  stopMedia = () => observer.disconnect()
}

// Only one decode touches the page at a time: a second one would read the
// first one's digits as the real text.
let cancelPage = () => {}

function decodePage() {
  cancelPage()

  const root = document.querySelector<HTMLElement>('[data-mx-page]')
  if (!root) return

  const targets = prepare(root)
  schedule(targets, PAGE_MS, 0)
  root.inert = true

  const release = () => {
    root.inert = false
    cancelPage = () => {}
  }
  const cancel = run(targets, release)

  cancelPage = () => {
    cancel()
    release()
  }
}

// The intro runs once and is not tied to a component's effects, so a dev-mode
// double mount can't start it twice or cut it short.
let intro: { path: string; finish: () => void } | null = null

/** What the theme toggle sends with mx:replay. onCovered runs once the rain
    hides the page, so the theme can change out of sight; accepted is set when
    the intro starts, and tells the toggle that onCovered will run. The footer's
    replay button sends a plain event with no detail. */
export type ReplayRequest = { onCovered?: () => void; accepted: boolean }

/** Returns whether the intro started. */
function startIntro(path: string, replay = false, onCovered?: () => void) {
  if (intro) return false
  cancelPage()

  const html = document.documentElement
  const main = document.querySelector('main')
  if (!main) {
    html.removeAttribute('data-mx-wait')
    return false
  }

  // Making <main> inert takes focus away from whatever had it inside, such as
  // the theme toggle. It goes back at the end so a keyboard user keeps their
  // place.
  const focused = document.activeElement

  try {
    sessionStorage.setItem(SESSION_KEY, '1')
  } catch {}

  const overlay = document.createElement('div')
  const canvas = document.createElement('canvas')
  overlay.className = 'mx-rain'
  overlay.setAttribute('aria-hidden', 'true')
  overlay.style.setProperty('--mx-fade', `${Math.round(INTRO_MS * 0.24)}ms`)
  if (replay) overlay.setAttribute('data-replay', '')
  overlay.appendChild(canvas)
  document.body.appendChild(overlay)

  // The overlay is opaque from its first frame, so the boot script's black
  // hold underneath can go.
  html.removeAttribute('data-mx-wait')
  main.inert = true

  const startedAt = performance.now()
  const timers: number[] = []
  const skipEvents = ['pointerdown', 'keydown', 'wheel', 'touchmove'] as const
  let stopRain = rain(canvas)
  let cancelDecode = () => {}
  let prepared = false
  let finished = false

  const removeOverlay = () => {
    stopRain()
    stopRain = () => {}
    overlay.remove()
  }

  const cover = () => {
    const callback = onCovered
    onCovered = undefined
    callback?.()
  }

  const finish = () => {
    if (finished) return
    finished = true
    // Skipped before the page was covered: still do what was asked.
    cover()
    timers.forEach((timer) => window.clearTimeout(timer))
    skipEvents.forEach((name) => window.removeEventListener(name, finish, true))
    cancelDecode()
    removeOverlay()
    main.inert = false
    if (
      focused instanceof HTMLElement &&
      focused !== document.body &&
      focused.isConnected &&
      document.activeElement === document.body
    ) {
      focused.focus({ preventScroll: true })
    }
    observeMedia()
    intro = null
  }

  // Scramble under the rain, once the font is in so the line check is fair.
  const decode = () => {
    if (prepared || finished) return
    prepared = true

    const elapsed = performance.now() - startedAt
    const targets = prepare(main)
    schedule(targets, INTRO_MS * 0.55, Math.max(0, INTRO_MS * 0.45 - elapsed))
    cancelDecode = run(targets, finish)
  }

  const after = (fraction: number, callback: () => void) =>
    timers.push(window.setTimeout(callback, INTRO_MS * fraction))

  if (replay) {
    // The page is in view: wait for the overlay to cover it first. Its fade-in
    // can start a frame or two late, so this goes by the end of the fade, with
    // a timer in case the animation never runs.
    const covered = () => {
      cover()
      decode()
    }
    overlay.addEventListener('animationend', (event) => {
      if (event.target === overlay) covered()
    })
    after(0.3, covered)
  } else if (document.fonts && document.fonts.status !== 'loaded') {
    document.fonts.ready.then(decode)
    after(0.35, decode)
  } else {
    decode()
  }

  after(0.4, () => overlay.setAttribute('data-fading', ''))
  after(0.45, observeMedia)
  after(0.7, removeOverlay)
  after(1.2, finish)

  skipEvents.forEach((name) =>
    window.addEventListener(name, finish, { capture: true, passive: true }),
  )

  intro = { path, finish }
  return true
}

export function MatrixController() {
  const pathname = usePathname()

  useIsoLayoutEffect(() => {
    const html = document.documentElement
    html.setAttribute('data-mx-js', '')

    if (intro) {
      // Same path: a dev-mode re-run of this effect. New path: the visitor
      // moved on mid-intro, so end it and treat this as any other page.
      if (intro.path === pathname) return
      intro.finish()
    }

    if (reducedMotion()) {
      html.removeAttribute('data-mx-wait')
      return
    }

    if (html.getAttribute('data-mx-wait') === 'intro') {
      startIntro(pathname)
      return
    }

    html.removeAttribute('data-mx-wait')
    observeMedia()
    decodePage()

    return () => cancelPage()
  }, [pathname])

  useEffect(() => {
    const replay = (event: Event) => {
      const request = (event as CustomEvent<ReplayRequest | undefined>).detail
      if (startIntro(pathname, true, request?.onCovered) && request) {
        request.accepted = true
      }
    }
    window.addEventListener('mx:replay', replay)
    return () => window.removeEventListener('mx:replay', replay)
  }, [pathname])

  return null
}
