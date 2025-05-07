import { BaseEntity } from "./base-entity"

export type Feature = BaseEntity & { base_price: number, slug: string }