export type JobStatus = "pending" | "done" | "failed"

// Persisted on `global` so hot-module reloads in dev don't wipe the map.
const g = global as typeof global & { _psaJobs?: Map<string, JobStatus> }
if (!g._psaJobs) g._psaJobs = new Map()
const jobs = g._psaJobs

export function setJobStatus(id: string, status: JobStatus) {
  jobs.set(id, status)
  if (status !== "pending") {
    // Auto-cleanup after 10 minutes so the map doesn't grow indefinitely.
    setTimeout(() => jobs.delete(id), 10 * 60 * 1000)
  }
}

export function getJobStatus(id: string): JobStatus | undefined {
  return jobs.get(id)
}
