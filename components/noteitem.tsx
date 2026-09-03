'use client'

import { useEffect, useState } from 'react'
import { AnimatePresence, motion } from 'motion/react'
import { Download, Expand, FileText, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import type { Note } from '@/lib/notes'

const actionButton =
  'hover:bg-white hover:text-black transition-colors duration-200'

// One spring for the card-to-lightbox morph and back, so opening and closing
// feel like the same gesture.
const morph = { type: 'spring', stiffness: 260, damping: 30 } as const

export function NoteItem({ note }: { note: Note }) {
  const [isOpen, setIsOpen] = useState(false)
  const [isSharp, setIsSharp] = useState(false)

  const details = [
    note.date,
    note.pages.length
      ? `${note.pages.length} ${note.pages.length === 1 ? 'page' : 'pages'}`
      : null,
    note.size,
  ].filter(Boolean)

  useEffect(() => {
    if (!isOpen) return

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setIsOpen(false)
    }

    const { overflow } = document.body.style
    document.body.style.overflow = 'hidden'
    document.addEventListener('keydown', onKeyDown)

    return () => {
      document.body.style.overflow = overflow
      document.removeEventListener('keydown', onKeyDown)
    }
  }, [isOpen])

  const open = () => {
    setIsSharp(false)
    setIsOpen(true)
  }

  return (
    <>
      <div className="flex flex-col">
        {note.thumb ? (
          <motion.button
            type="button"
            onClick={open}
            aria-label={`Preview ${note.title}`}
            className="group relative block w-full overflow-hidden rounded-xl border border-neutral-200 bg-white dark:border-neutral-800"
            whileHover={{ y: -4 }}
            whileTap={{ scale: 0.985 }}
            transition={morph}
          >
            <motion.img
              layoutId={`note-page-${note.slug}`}
              src={note.thumb.src}
              alt=""
              width={note.thumb.width}
              height={note.thumb.height}
              loading="lazy"
              className="h-auto w-full"
            />

            <div className="pointer-events-none absolute inset-0 flex items-center justify-center bg-black/0 opacity-0 transition-all duration-300 group-hover:bg-black/25 group-hover:opacity-100 group-focus-visible:bg-black/25 group-focus-visible:opacity-100">
              <Expand className="h-7 w-7 text-white drop-shadow-lg" />
            </div>
          </motion.button>
        ) : (
          <div className="flex aspect-[1/1.414] w-full items-center justify-center rounded-xl border border-dashed border-neutral-300 dark:border-neutral-700">
            <FileText className="h-8 w-8 text-neutral-500" />
          </div>
        )}

        <div className="mt-3 flex items-start justify-between gap-3">
          <div className="min-w-0">
            <h3 className="font-medium tracking-tight text-balance">
              {note.title}
            </h3>
            <p className="mt-0.5 text-sm text-neutral-600 dark:text-neutral-400">
              {details.join(' · ')}
            </p>
            {note.description && (
              <p className="mt-2 text-sm text-neutral-600 dark:text-neutral-400">
                {note.description}
              </p>
            )}
          </div>

          <Button
            variant="outline"
            size="sm"
            asChild
            className={`${actionButton} shrink-0`}
          >
            <a href={note.file} download aria-label={`Download ${note.title}`}>
              <Download />
              <span className="hidden sm:inline">Download</span>
            </a>
          </Button>
        </div>
      </div>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            className="fixed inset-0 z-50 overflow-y-auto overscroll-contain bg-black/80 backdrop-blur-sm p-4 sm:p-8"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={() => setIsOpen(false)}
          >
            <motion.button
              type="button"
              onClick={() => setIsOpen(false)}
              aria-label="Close preview"
              className="fixed right-4 top-4 z-10 rounded-full p-2 text-white transition-colors hover:bg-white/20"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <X className="h-6 w-6" />
            </motion.button>

            <div
              className="mx-auto flex w-full max-w-3xl flex-col items-center gap-4"
              onClick={(event) => event.stopPropagation()}
            >
              {note.pages.map((page, index) => {
                const isFirst = index === 0

                return (
                  <motion.div
                    key={page.src}
                    // Only page one morphs out of the card; the rest just fade
                    // in underneath it.
                    layoutId={isFirst ? `note-page-${note.slug}` : undefined}
                    initial={isFirst ? undefined : { opacity: 0, y: 12 }}
                    animate={isFirst ? undefined : { opacity: 1, y: 0 }}
                    transition={isFirst ? morph : { delay: 0.15 }}
                    className="relative w-full overflow-hidden rounded-xl bg-white shadow-2xl"
                  >
                    {/* The card's thumbnail scales up first so the morph has
                        something to show, then the full render fades in. */}
                    {isFirst && note.thumb && (
                      <img
                        src={note.thumb.src}
                        alt=""
                        aria-hidden
                        className="h-auto w-full"
                      />
                    )}
                    <img
                      src={page.src}
                      alt={`${note.title}, page ${index + 1}`}
                      width={page.width}
                      height={page.height}
                      onLoad={isFirst ? () => setIsSharp(true) : undefined}
                      className={
                        isFirst && note.thumb
                          ? `absolute inset-0 h-full w-full transition-opacity duration-200 ${
                              isSharp ? 'opacity-100' : 'opacity-0'
                            }`
                          : 'h-auto w-full'
                      }
                    />
                  </motion.div>
                )
              })}

              <motion.div
                className="flex flex-wrap justify-center gap-2 pb-4"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.2 }}
              >
                <Button
                  variant="outline"
                  size="sm"
                  asChild
                  className="border-white/30 text-white hover:bg-white hover:text-black"
                >
                  <a href={note.file} download>
                    <Download />
                    Download PDF
                  </a>
                </Button>
              </motion.div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}
