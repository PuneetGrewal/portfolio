import Link from 'next/link'
import { BouncingPs } from '@/components/bouncing-ps'

export default function NotFound() {
  return (
    <section className="relative">
      <BouncingPs />

      <p className="mb-2 text-8xl font-bold text-phosphor">404</p>

      <h1 className="mx-title mb-8 text-2xl font-semibold">
        Nothing here.
      </h1>



      <Link
        href="/"
        className="inline-flex items-center gap-1 text-phosphor underline decoration-phosphor-dim underline-offset-4 transition-colors hover:decoration-phosphor"
      >
        Take me home →
      </Link>
    </section>
  )
}
