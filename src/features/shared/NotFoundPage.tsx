import { Link } from 'react-router-dom'
import { Waves } from 'lucide-react'

export function NotFoundPage() {
  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center gap-6 p-8 text-center">
      <Waves className="h-12 w-12 text-primary opacity-40" />
      <div>
        <p className="font-mono text-5xl font-black tabular-nums text-text-muted">404</p>
        <p className="mt-2 text-lg font-semibold text-text-primary">Page not found</p>
        <p className="mt-1 text-sm text-text-secondary">
          This lane is empty. Check the URL or head back to familiar waters.
        </p>
      </div>
      <Link
        to="/"
        className="rounded-component bg-primary px-5 py-2.5 text-sm font-semibold text-on-primary transition-opacity hover:opacity-90"
      >
        Go home
      </Link>
    </div>
  )
}
