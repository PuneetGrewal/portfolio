'use client'

import { useEffect, useState } from 'react'
import { useTheme } from 'next-themes'
import { Moon, Sun } from 'lucide-react'
import type { ReplayRequest } from '@/components/matrix/controller'

// The browser's toolbar colour for each theme: --color-background in
// global.css. Written out here because this effect runs before next-themes has
// put the new class on <html>, so the CSS would still give the old colour.
const themeColor: Record<string, string> = {
  dark: '#030806',
  light: '#ffffff',
}

export function ThemeToggle() {
  const { resolvedTheme, setTheme } = useTheme()

  // The stored theme can only be read in the browser, so the label waits for
  // hydration to keep the server and client markup the same. The icon doesn't
  // wait: the dark: classes pick it from the class next-themes puts on <html>
  // before the first paint.
  const [mounted, setMounted] = useState(false)
  useEffect(() => setMounted(true), [])

  useEffect(() => {
    if (!resolvedTheme) return
    document
      .querySelector('meta[name="theme-color"]')
      ?.setAttribute('content', themeColor[resolvedTheme] ?? themeColor.dark)
  }, [resolvedTheme])

  const isDark = resolvedTheme === 'dark'
  const label = !mounted
    ? 'Toggle theme'
    : isDark
      ? 'Switch to light theme'
      : 'Switch to dark theme'

  // Each switch plays the intro again, and the theme changes while the rain
  // covers the page. Visitors who ask for reduced motion get the switch alone:
  // changing the theme isn't asking for an animation.
  const toggle = () => {
    const next = isDark ? 'light' : 'dark'
    const request: ReplayRequest = {
      onCovered: () => setTheme(next),
      accepted: false,
    }

    if (!window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      window.dispatchEvent(new CustomEvent('mx:replay', { detail: request }))
    }
    // No intro started, so nothing will call onCovered.
    if (!request.accepted) setTheme(next)
  }

  return (
    <button
      type="button"
      onClick={toggle}
      aria-label={label}
      className="flex items-center justify-center relative cursor-pointer h-11 w-11 my-0.5 sm:h-8 sm:w-8 sm:m-1 text-muted-foreground transition-colors hover:text-phosphor hover:drop-shadow-[0_0_6px_color-mix(in_srgb,var(--mx-glow)_55%,transparent)]"
    >
      <Moon aria-hidden="true" className="h-4 w-4 dark:hidden" />
      <Sun aria-hidden="true" className="hidden h-4 w-4 dark:block" />
    </button>
  )
}
