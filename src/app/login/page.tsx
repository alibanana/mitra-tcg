import { siteConfig } from "@/config/site";
import { LoginForm } from "@/features/auth/components/login-form";
import { auth } from "@/lib/auth";
import { ThemeToggle } from "@/components/layout/theme-toggle";
import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { redirect } from "next/navigation";

export const metadata: Metadata = {
  title: "Sign In",
  description: "Sign in to access the admin dashboard",
};

export default async function LoginPage() {
  const session = await auth();
  if (session) redirect("/dashboard");

  return (
    <div className="flex min-h-screen">
      {/* Brand panel */}
      <div className="hidden flex-col justify-between border-r-4 border-foreground bg-primary px-10 py-12 text-primary-foreground lg:flex lg:w-5/12 xl:w-2/5">
        <div />
        <div>
          <Link href="/" className="flex justify-center">
            <Image
              src="/logo-dark.png"
              alt={siteConfig.name}
              width={1080}
              height={1080}
              className="w-1/2 h-auto"
              priority
            />
          </Link>
          <blockquote className="mt-8 text-center text-3xl font-bold uppercase leading-tight">
            &ldquo;Premium TCG Cards. English Raw &amp; Graded.&rdquo;
          </blockquote>
          <p className="mt-6 text-center text-sm font-semibold uppercase tracking-widest text-primary-foreground/70">
            Admin Dashboard
          </p>
        </div>
        <p className="text-xs text-primary-foreground/50">
          &copy; {new Date().getFullYear()} {siteConfig.name}
        </p>
      </div>

      {/* Form panel */}
      <div className="relative flex flex-1 flex-col items-center justify-center px-6 py-12">
        <div className="absolute right-4 top-4">
          <ThemeToggle />
        </div>
        <div className="w-full max-w-sm">
          <div className="mb-8 lg:hidden">
            <Link href="/">
              <Image
                src="/logo-light.png"
                alt={siteConfig.name}
                width={1080}
                height={1080}
                className="h-20 w-auto dark:hidden"
                priority
              />
              <Image
                src="/logo-dark.png"
                alt={siteConfig.name}
                width={1080}
                height={1080}
                className="hidden h-20 w-auto dark:block"
                priority
              />
            </Link>
          </div>
          <h1 className="text-2xl font-bold uppercase tracking-tight">
            Welcome Back
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Sign in to manage your catalog.
          </p>
          <div className="mt-8">
            <LoginForm />
          </div>
          <p className="mt-6 text-center text-xs text-muted-foreground">
            <Link
              href="/"
              className="underline underline-offset-4 hover:text-foreground"
            >
              Back to website
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
