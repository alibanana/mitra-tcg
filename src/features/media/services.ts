import { mediaRepository } from "./repositories"
import { uploadFile, deleteFile } from "@/lib/upload"

export const mediaService = {
  async uploadFile(file: File) {
    const { filename, url } = await uploadFile(file)

    const asset = await mediaRepository.create({
      filename,
      url,
      mimeType: file.type,
      size: file.size,
    })

    return asset
  },

  async deleteFile(id: string) {
    const asset = await mediaRepository.findById(id)
    if (!asset) throw new Error("Asset not found")

    await deleteFile(asset.url)

    return mediaRepository.delete(id)
  },

  getAllAssets(page = 1, pageSize = 20) {
    return mediaRepository.findMany({
      skip: (page - 1) * pageSize,
      take: pageSize,
    })
  },

  getAssetById(id: string) {
    return mediaRepository.findById(id)
  },

  getAssetCount() {
    return mediaRepository.count()
  },
}
