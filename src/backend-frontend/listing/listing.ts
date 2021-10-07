import * as zod from 'zod'
import { FormSchema } from '../form'

export const ListingSelectSchema = zod.object({
  id: zod.string(),
  value: zod.string()
})

export const ListingSchema = zod.object({
  title: zod.string().min(5).max(255),
  location: zod.string(),
  locationPk: zod.string(),
  locationSk: zod.string(),
  type: zod.string(),
  target: zod.string(),
  area: zod.string().optional(),
  price: zod.string().optional(),
  coverFileName: zod.string().optional(),
  listingFileNames: zod.array(zod.string()).optional()
})

export const ListingRecordSchema = zod.object({
  pk: zod.string(),
  sk: zod.string(),
  col1: ListingSchema
})

export const PostListingSchema = FormSchema.extend({
  listingRecord: zod.optional(ListingRecordSchema)
})

export const GetListingSchema = zod.object({
  listingRecord: zod.optional(ListingRecordSchema)
})

export const GetListingsSchema = zod.object({
  listingRecords: zod.array(ListingRecordSchema)
})

export type ListingSelect = zod.TypeOf<typeof ListingSelectSchema>
export type Listing = zod.TypeOf<typeof ListingSchema>
export type ListingRecord = zod.TypeOf<typeof ListingRecordSchema>
export type GetListing = zod.TypeOf<typeof GetListingSchema>
export type GetListings = zod.TypeOf<typeof GetListingsSchema>
export type PostListing = zod.TypeOf<typeof PostListingSchema>

export const LISTING_TYPE_APARTMENT = { id: '1', value: 'Apartment' }
export const LISTING_TYPE_HOUSE = { id: '2', value: 'House' }
export const LISTING_TYPES: Array<ListingSelect> = [
  LISTING_TYPE_APARTMENT, LISTING_TYPE_HOUSE
]

export const LISTING_TARGET_SALE = { id: '1', value: 'Sale' }
export const LISTING_TARGET_RENTAL = { id: '2', value: 'Rental' }
export const LISTING_TARGETS: Array<ListingSelect> = [
  LISTING_TARGET_SALE, LISTING_TARGET_RENTAL
]

export const LISTING_AREA_MAX40 = { id: '1', value: '< 40m2' }
export const LISTING_AREA_BETWEEN_40_80 = { id: '2', value: '40 - 80m2' }
export const LISTING_AREA_MORE_THAN_80 = { id: '3', value: '> 80m2' }
export const LISTING_AREAS: Array<ListingSelect> = [
  LISTING_AREA_MAX40, LISTING_AREA_BETWEEN_40_80, LISTING_AREA_MORE_THAN_80
]

export const newListing = (): Listing => {
  return {
    title: '',
    location: '',
    locationPk: '',
    locationSk: '',
    type: '1',
    target: '1'
  }
}
export const newListingRecord = (): ListingRecord => {
  return {
    pk: '',
    sk: '',
    col1: newListing()
  }
}
export const newTestListing = (): Listing => {
  return {
    title: 'Kraków Śródmieście Zwierzyniecka 4 bedroom 4.500.000 EUR',
    location: '',
    locationPk: '',
    locationSk: '',
    type: '1',
    target: '1'
  }
}
