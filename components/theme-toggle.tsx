'use client'

import { useEffect, useState } from 'react'
import { useTheme } from 'next-themes'
import { Moon, Sun } from 'lucide-react'

export function ThemeToggle() {
  const { resolvedTheme, setTheme } = useTheme()

  // The stored theme can only be read in the browser, so the label waits for
  // hydration to keep the server and client markup the same. The icon doesn't
  // wait: the dark: classes pick it from the class next-themes puts on <html>
  // before the first paint.
  const [mounted, setMounted] = useState(false)
  useEffect(() => setMounted(true), [])

  const isDark = resolvedTheme === 'dark'
  const label = !mounted
    ? 'Toggle theme'
    : isDark
      ? 'Switch to light theme'
      : 'Switch to dark theme'

  return (
    <button
      type="button"
      onClick={() => setTheme(isDark ? 'light' : 'dark')}
      aria-label={label}
      className="transition-all hover:text-neutral-800 dark:hover:text-neutral-200 flex items-center justify-center relative cursor-pointer h-11 w-11 my-0.5 sm:h-8 sm:w-8 sm:m-1"
    >
      <Moon aria-hidden="true" className="h-4 w-4 dark:hidden" />
      <Sun aria-hidden="true" className="hidden h-4 w-4 dark:block" />
    </button>
  )
}
