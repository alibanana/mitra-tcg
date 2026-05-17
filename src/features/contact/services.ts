import { contactRepository } from "./repositories"
import type { ContactInput } from "./schemas"

export const contactService = {
  getAllSubmissions(page = 1, pageSize = 10) {
    return contactRepository.findMany({
      skip: (page - 1) * pageSize,
      take: pageSize,
    })
  },

  getSubmissionById(id: string) {
    return contactRepository.findById(id)
  },

  createSubmission(data: ContactInput) {
    return contactRepository.create(data)
  },

  markAsRead(id: string) {
    return contactRepository.markAsRead(id)
  },

  deleteSubmission(id: string) {
    return contactRepository.delete(id)
  },

  getSubmissionCount(unread?: boolean) {
    return contactRepository.count(unread !== undefined ? { unread } : undefined)
  },
}
