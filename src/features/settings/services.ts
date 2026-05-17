import { settingsRepository } from "./repositories"
import type { SettingsBatchInput } from "./schemas"

export const settingsService = {
  getAll() {
    return settingsRepository.findMany()
  },

  getByKey(key: string) {
    return settingsRepository.findByKey(key)
  },

  getValue(key: string, defaultValue = "") {
    return settingsRepository.findByKey(key).then((s) => s?.value ?? defaultValue)
  },

  upsertSetting(key: string, value: string) {
    return settingsRepository.upsert(key, value)
  },

  async updateBatch(data: SettingsBatchInput) {
    return Promise.all(
      data.settings.map((s) => settingsRepository.upsert(s.key, s.value)),
    )
  },
}
