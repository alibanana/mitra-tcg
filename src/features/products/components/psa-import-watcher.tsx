"use client"

import { useEffect, useRef } from "react"
import { useRouter } from "next/navigation"
import { toast } from "sonner"

const STORAGE_KEY = "psa_bulk_import"
const POLL_MS = 2_000
const MAX_AGE_MS = 2 * 60 * 1_000

type StoredJob = { jobId: string; certId: string; startedAt: number }
type ActiveJob = { toastId: string | number; intervalId: ReturnType<typeof setInterval> }

function getStoredJobs(): StoredJob[] {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) ?? "[]")
  } catch {
    return []
  }
}

function removeStoredJob(jobId: string) {
  const updated = getStoredJobs().filter((j) => j.jobId !== jobId)
  if (updated.length > 0) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated))
  } else {
    localStorage.removeItem(STORAGE_KEY)
  }
}

export function PsaImportWatcher() {
  const router = useRouter()
  const active = useRef<Map<string, ActiveJob>>(new Map())

  function startWatching(jobId: string, certId: string) {
    if (active.current.has(jobId)) return

    const toastId = toast.loading(`Importing PSA #${certId}…`)

    function stop() {
      const job = active.current.get(jobId)
      if (job) clearInterval(job.intervalId)
      active.current.delete(jobId)
      removeStoredJob(jobId)
    }

    const intervalId = setInterval(async () => {
      try {
        const res = await fetch(`/api/psa-import/${jobId}`)
        const { status } = (await res.json()) as { status: string }

        if (status === "done") {
          stop()
          toast.success(`PSA #${certId} imported successfully!`, { id: toastId })
          router.refresh()
        } else if (status === "quota_exceeded") {
          stop()
          toast.error(`PSA #${certId}: API quota exceeded (100/day). Contact collectors-apis@collectors.com.`, { id: toastId })
        } else if (status === "failed" || status === "not_found") {
          stop()
          toast.error(`Failed to import PSA #${certId}. Please try again.`, { id: toastId })
        }
      } catch {
        stop()
        toast.dismiss(toastId)
      }
    }, POLL_MS)

    active.current.set(jobId, { toastId, intervalId })

    setTimeout(() => {
      if (active.current.has(jobId)) {
        stop()
        toast.dismiss(toastId)
      }
    }, MAX_AGE_MS)
  }

  useEffect(() => {
    // Resume any jobs that survived a page refresh
    const stored = getStoredJobs()
    for (const { jobId, certId, startedAt } of stored) {
      if (Date.now() - startedAt < MAX_AGE_MS) {
        startWatching(jobId, certId)
      } else {
        removeStoredJob(jobId)
      }
    }

    function onImportStarted(e: Event) {
      const { jobs } = (e as CustomEvent<{ jobs: Array<{ jobId: string; certId: string }> }>).detail
      for (const { jobId, certId } of jobs) {
        startWatching(jobId, certId)
      }
    }

    window.addEventListener("psa-import-started", onImportStarted)
    return () => {
      window.removeEventListener("psa-import-started", onImportStarted)
      for (const { intervalId } of active.current.values()) clearInterval(intervalId)
    }
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  return null
}
