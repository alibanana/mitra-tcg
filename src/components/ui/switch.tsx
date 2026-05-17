"use client"

import * as React from "react"
import { cn } from "@/lib/utils"

interface SwitchProps {
  id?: string
  checked?: boolean
  defaultChecked?: boolean
  disabled?: boolean
  className?: string
  onCheckedChange?: (checked: boolean) => void
}

function Switch({ id, checked, defaultChecked, disabled, className, onCheckedChange }: SwitchProps) {
  const [isChecked, setIsChecked] = React.useState(defaultChecked ?? false)
  const effectiveChecked = checked ?? isChecked

  function handleClick() {
    if (disabled) return
    const next = !effectiveChecked
    setIsChecked(next)
    onCheckedChange?.(next)
  }

  return (
    <button
      id={id}
      type="button"
      role="switch"
      aria-checked={effectiveChecked}
      disabled={disabled}
      onClick={handleClick}
      className={cn(
        "relative inline-flex h-6 w-11 shrink-0 cursor-pointer items-center border-2 border-foreground transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50",
        effectiveChecked ? "bg-primary" : "bg-muted",
        className,
      )}
    >
      <span
        className={cn(
          "pointer-events-none inline-block h-4 w-4 border-2 border-foreground bg-background shadow-sm transition-transform",
          effectiveChecked ? "translate-x-5" : "translate-x-0.5",
        )}
      />
    </button>
  )
}

export { Switch }
