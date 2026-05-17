import Link from "next/link"
import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Page Not Found",
}

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-start justify-center px-4 lg:px-8">
      <div className="container mx-auto">
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">Error</p>
        <h1 className="mt-2 text-[8rem] font-bold leading-none tracking-tighter text-border sm:text-[10rem]">
          404
        </h1>
        <h2 className="mt-2 text-2xl font-semibold tracking-tight">Page not found</h2>
        <p className="mt-3 max-w-sm text-sm leading-relaxed text-muted-foreground">
          The page you&apos;re looking for doesn&apos;t exist or has been moved.
        </p>
        <div className="mt-8 flex gap-4">
          <Link
            href="/"
            className="inline-flex h-9 items-center justify-center rounded-md bg-primary px-4 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
          >
            Back to Home
          </Link>
          <Link
            href="/contact"
            className="inline-flex h-9 items-center justify-center rounded-md border px-4 text-sm font-medium transition-colors hover:bg-accent"
          >
            Contact Us
          </Link>
        </div>
      </div>
    </div>
  )
}
