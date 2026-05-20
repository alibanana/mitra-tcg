export type { Category } from "@/features/categories/types"

export interface PsaCert {
  id: string
  productId: string
  certNumber: string
  specId: number
  specNumber: string
  labelType: string | null
  reverseBarCode: boolean
  year: string | null
  brand: string | null
  psaCategory: string | null
  cardNumber: string | null
  subject: string | null
  variety: string | null
  gradeDescription: string | null
  cardGrade: string | null
  totalPopulation: number
  totalPopulationWithQualifier: number
  populationHigher: number
  isPsaDna: boolean
  isDualCert: boolean
  psaPopulation: unknown
  psaPopPopulatedAt: Date | null
  createdAt: Date
  updatedAt: Date
}

export interface PsaPopulation {
  PSAPop: {
    Total: number
    Auth: number
    Grade1: number
    Grade1Q: number
    Grade1_5: number
    Grade1_5Q: number
    Grade2: number
    Grade2Q: number
    Grade2_5: number
    Grade3: number
    Grade3Q: number
    Grade3_5: number
    Grade4: number
    Grade4Q: number
    Grade4_5: number
    Grade5: number
    Grade5Q: number
    Grade5_5: number
    Grade6: number
    Grade6Q: number
    Grade6_5: number
    Grade7: number
    Grade7Q: number
    Grade7_5: number
    Grade8: number
    Grade8Q: number
    Grade8_5: number
    Grade9: number
    Grade9Q: number
    Grade10: number
  }
}

export interface Product {
  id: string
  name: string
  slug: string
  description: string
  images: string[]
  categoryId: string
  category: import("@/features/categories/types").Category
  sold: boolean
  published: boolean
  createdAt: Date
  updatedAt: Date
  psaCert?: PsaCert | null
}
