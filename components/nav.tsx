'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'

const navItems = {
  '/': {
    name: 'home',
  },
  '/projects': {
    name: 'projects',
  },
  '/live': {
    name: 'live',
  },
  '/resume': {
    name: 'resume',
  },
  '/hobbies': {
    name: 'hobbies',
  },
  '/notes': {
    name: 'notes',
  }
}

export function Navbar() {
  const pathname = usePathname()

  return (
    <aside className="-ml-[8px] mb-16">
      <div className="lg:sticky lg:top-20">
        <nav
          className="flex flex-row items-start relative px-0 pb-0 md:overflow-auto scroll-pr-6 md:relative"
          id="nav"
        >
          <div className="flex flex-row flex-wrap space-x-0 md:pr-10">
            {Object.entries(navItems).map(([path, { name }]) => {
              const isCurrent =
                path === '/' ? pathname === '/' : pathname.startsWith(path)

              return (
                <Link
                  key={path}
                  href={path}
                  aria-current={isCurrent ? 'page' : undefined}
                  className="flex align-middle relative px-2.5 py-2.5 my-0.5 sm:px-2 sm:py-1 sm:m-1 text-muted-foreground transition-colors hover:text-phosphor hover:[text-shadow:0_0_10px_rgb(0_255_65/0.55)] aria-[current=page]:bg-phosphor aria-[current=page]:font-semibold aria-[current=page]:text-ink aria-[current=page]:[text-shadow:none]"
                >
                  {name}
                </Link>
              )
            })}
          </div>
        </nav>
      </div>
    </aside>
  )
}
