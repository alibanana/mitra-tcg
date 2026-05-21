"use server"

import { contactService } from "./services"
import { contactSchema } from "./schemas"
import { revalidatePath } from "next/cache"

export async function submitContactAction(formData: FormData) {
  const raw = {
    name: formData.get("name") as string,
    email: formData.get("email") as string,
    phone: formData.get("phone") as string,
    message: formData.get("message") as string,
  }

  const validated = contactSchema.safeParse(raw)
  if (!validated.success) return { error: validated.error.flatten().fieldErrors }

  const submission = await contactService.createSubmission(validated.data)
  return { data: submission }
}

export async function markAsReadAction(id: string) {
  await contactService.markAsRead(id)
  revalidatePath("/dashboard/contacts")
  return { success: true }
}

export async function deleteContactAction(id: string) {
  await contactService.deleteSubmission(id)
  revalidatePath("/dashboard/contacts")
  return { success: true }
}

export async function bulkDeleteContactsAction(ids: string[]) {
  await Promise.all(ids.map((id) => contactService.deleteSubmission(id)))
  revalidatePath("/dashboard/contacts")
  return { success: true }
}
