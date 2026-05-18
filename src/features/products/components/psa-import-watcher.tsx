"use client"

import { useEffect, useRef } from "react"
import { useRouter } from "next/navigation"
import { toast } from "sonner"

const STORAGE_KEY = "psa_pending_import"
const POLL_MS = 2_000
const MAX_AGE_MS = 2 * 60 * 1_000

type ActiveJob = {
  jobId: string
  intervalId: ReturnType<typeof setInterval>
  toastId: string | number
}

export function PsaImportWatcher() {
  const router = useRouter()
  const active = useRef<ActiveJob | null>(null)

  function startWatching(jobId: string) {
    if (active.current?.jobId === jobId) return
    if (active.current) clearInterval(active.current.intervalId)

    const toastId = toast.loading("Importing PSA product…")

    function stop() {
      if (active.current) clearInterval(active.current.intervalId)
      active.current = null
      localStorage.removeItem(STORAGE_KEY)
    }

    const intervalId = setInterval(async () => {
      try {
        const res = await fetch(`/api/psa-import/${jobId}`)
        const { status } = (await res.json()) as { status: string }

        if (status === "done") {
          stop()
          toast.success("Product imported successfully!", { id: toastId })
          router.refresh()
        } else if (status === "failed" || status === "not_found") {
          stop()
          toast.error("Import failed. Please try again.", { id: toastId })
        }
      } catch {
        stop()
        toast.dismiss(toastId)
      }
    }, POLL_MS)

    active.current = { jobId, intervalId, toastId }

    setTimeout(() => {
      if (active.current?.jobId === jobId) {
        stop()
        toast.dismiss(toastId)
      }
    }, MAX_AGE_MS)
  }

  useEffect(() => {
    // Resume polling after a page refresh
    const stored = localStorage.getItem(STORAGE_KEY)
    if (stored) {
      try {
        const { jobId, startedAt } = JSON.parse(stored) as { jobId: string; startedAt: number }
        if (Date.now() - startedAt < MAX_AGE_MS) {
          startWatching(jobId)
        } else {
          localStorage.removeItem(STORAGE_KEY)
        }
      } catch {
        localStorage.removeItem(STORAGE_KEY)
      }
    }

    // Also listen for new imports without a page refresh
    function onImportStarted(e: Event) {
      const { jobId } = (e as CustomEvent<{ jobId: string }>).detail
      startWatching(jobId)
    }

    window.addEventListener("psa-import-started", onImportStarted)
    return () => {
      window.removeEventListener("psa-import-started", onImportStarted)
      if (active.current) clearInterval(active.current.intervalId)
    }
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  return null
}
