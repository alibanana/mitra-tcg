import { NextRequest, NextResponse } from "next/server"
import { contactSchema } from "@/features/contact/schemas"
import { contactService } from "@/features/contact/services"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const validated = contactSchema.safeParse(body)

    if (!validated.success) {
      return NextResponse.json(
        { error: "Validation failed", details: validated.error.flatten().fieldErrors },
        { status: 400 },
      )
    }

    const submission = await contactService.createSubmission(validated.data)
    return NextResponse.json({ data: submission }, { status: 201 })
  } catch {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
