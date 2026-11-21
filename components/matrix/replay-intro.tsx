'use client'

import { RotateCcw } from 'lucide-react'

/** The intro only plays on the first load of a visit; this plays it again. */
export function ReplayIntro() {
  return (
    <button
      type="button"
      onClick={() => window.dispatchEvent(new Event('mx:replay'))}
      className="flex min-h-11 cursor-pointer items-center transition-colors hover:text-phosphor sm:min-h-0"
    >
      <RotateCcw aria-hidden className="h-3.5 w-3.5" />
      <span className="ml-2 h-7 leading-7">replay intro</span>
    </button>
  )
}
