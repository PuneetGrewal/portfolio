import Link from 'next/link'
import { BouncingPs } from '@/components/bouncing-ps'

export default function NotFound() {
  return (
    <section className="relative">
      <BouncingPs />

      <p className="mb-2 text-8xl font-bold tracking-tighter">404</p>

      <h1 className="mb-8 text-2xl font-semibold tracking-tighter">
        Nothing here.
      </h1>



      <Link
        href="/"
        className="inline-flex items-center gap-1 underline decoration-neutral-400 underline-offset-4 transition-colors hover:decoration-neutral-800 dark:decoration-neutral-600 dark:hover:decoration-neutral-200"
      >
        Take me home →
      </Link>
    </section>
  )
}
