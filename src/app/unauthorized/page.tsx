import Link from "next/link"
import { ShieldX } from "lucide-react"
import { buttonVariants } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { Metadata } from "next"

export const metadata: Metadata = {
  title: "Unauthorized Access",
  description: "You don't have permission to access this page",
}

export default function UnauthorizedPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="w-full max-w-md text-center">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-destructive/10">
          <ShieldX className="h-8 w-8 text-destructive" />
        </div>

        <h1 className="mt-6 text-3xl font-bold tracking-tight">Access Denied</h1>

        <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
          You don&apos;t have permission to view this page. Please contact your administrator
          or try signing in with the appropriate credentials.
        </p>

        <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
          <Link href="/login" className={cn(buttonVariants())}>
            Go to Sign In
          </Link>
          <Link href="/dashboard" className={cn(buttonVariants({ variant: "outline" }))}>
            Back to Dashboard
          </Link>
        </div>
      </div>
    </div>
  )
}
