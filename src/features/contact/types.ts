export interface ContactSubmission {
  id: string
  name: string
  email: string
  phone: string | null
  message: string
  read: boolean
  createdAt: Date
  updatedAt: Date
}
