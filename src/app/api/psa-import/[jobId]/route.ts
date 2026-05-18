import { auth } from "@/lib/auth"
import { getJobStatus } from "@/lib/psa-job-store"

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ jobId: string }> },
) {
  const session = await auth()
  if (!session?.user) return Response.json({ error: "Unauthorized" }, { status: 401 })

  const { jobId } = await params
  const status = getJobStatus(jobId)
  return Response.json({ status: status ?? "not_found" })
}
