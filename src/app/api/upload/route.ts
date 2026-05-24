import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { mediaService } from "@/features/media/services"

export async function POST(request: NextRequest) {
  const session = await auth()
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  try {
    const formData = await request.formData()
    const file = formData.get("file") as File | null

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 })
    }

    const type = request.nextUrl.searchParams.get("type") ?? undefined
    const asset = await mediaService.uploadFile(file, type)
    return NextResponse.json({ data: asset }, { status: 201 })
  } catch (err) {
    console.error("[upload] POST error:", err)
    return NextResponse.json({ error: "Upload failed" }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest) {
  const session = await auth()
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  try {
    const { id } = await request.json()
    await mediaService.deleteFile(id)
    return NextResponse.json({ success: true })
  } catch {
    return NextResponse.json({ error: "Delete failed" }, { status: 500 })
  }
}
