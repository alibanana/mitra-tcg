"use server"

import { signIn, signOut } from "@/lib/auth"
import { loginSchema } from "./schemas"
import { AuthError } from "next-auth"

export async function loginAction(formData: FormData) {
  const raw = {
    email: formData.get("email") as string,
    password: formData.get("password") as string,
  }

  const validated = loginSchema.safeParse(raw)
  if (!validated.success) {
    return { error: "Invalid email or password" }
  }

  try {
    await signIn("credentials", {
      email: validated.data.email,
      password: validated.data.password,
      redirectTo: "/dashboard",
    })
  } catch (error) {
    if (error instanceof AuthError) {
      return { error: "Invalid email or password" }
    }
    throw error
  }
}

export async function logoutAction() {
  await signOut({ redirectTo: "/login" })
}
