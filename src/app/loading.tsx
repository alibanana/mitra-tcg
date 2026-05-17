export default function Loading() {
  return (
    <div className="flex min-h-screen items-center justify-center">
      <div className="flex items-center gap-1.5">
        <span className="h-2 w-2 animate-pulse rounded-full bg-primary [animation-delay:-0.3s]" />
        <span className="h-2 w-2 animate-pulse rounded-full bg-primary [animation-delay:-0.15s]" />
        <span className="h-2 w-2 animate-pulse rounded-full bg-primary" />
      </div>
    </div>
  )
}
