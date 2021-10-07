import { createModule, action, mutation } from 'vuex-class-component'
import { ROUTE_NAMES } from '@backend/routes'
import {
  ListingSearch,
  ListingsSearchResults, ListingsSearchResultsSchema,
  LocationSearchResult,
  LocationSearchResults,
  LocationSearchResultsSchema, newListingSearch
} from '@backend/listing/search'
import { Listing, LISTING_AREAS, LISTING_TARGETS, LISTING_TYPES, ListingSelect } from '@backend/listing/listing'
import AxiosService from '~/store/api/axios-service'
import { $log } from '~/utils/api'
import constants from '~/constants'

export const VuexModule = createModule({
  namespaced: 'search',
  strict: false,
  target: 'nuxt'
})

export class SearchStore extends VuexModule {
  axiosService: AxiosService = new AxiosService()

  addressData: Array<LocationSearchResult> = []
  listings: Array<Listing> = []
  isFetching: boolean = false

  listingSearch: ListingSearch = newListingSearch()

  listingTypes: Array<ListingSelect> = LISTING_TYPES
  listingTargets: Array<ListingSelect> = LISTING_TARGETS
  listingAreas: Array<ListingSelect> = LISTING_AREAS

  get isListingSearchDisabled () {
    return !this.listingSearch.locationPk.length ||
           !this.listingSearch.location.length
  }

  @mutation mutateAddressData (mutatedData: Array<LocationSearchResult>) {
    this.addressData = mutatedData
  }

  @mutation mutateListingData (mutatedData: Array<Listing>) {
    this.listings = mutatedData

    $log.info(mutatedData)
  }

  @mutation
  resetLocationSearch () {
    this.listingSearch.location = ''
    this.listingSearch.locationPk = ''
    this.listingSearch.locationSk = ''
  }

  @mutation
  onLocationSelect (selectedLocation: LocationSearchResult) {
    this.listingSearch.location = selectedLocation.location
    this.listingSearch.locationPk = selectedLocation.pk
    this.listingSearch.locationSk = selectedLocation.sk
  }

  @action
  async onSearchAddress (term: string) {
    const res = await this.axiosService.$get<LocationSearchResults, typeof LocationSearchResultsSchema>(
      ROUTE_NAMES.SEARCH, LocationSearchResultsSchema, { term, index: 'address' })
    if (res && res.locations) {
      await this.mutateAddressData(res.locations)
    }
  }

  @action
  async onSearchListing (listingSearch: ListingSearch) {
    const res = await this.axiosService.$get<ListingsSearchResults, typeof ListingsSearchResultsSchema>(
      ROUTE_NAMES.SEARCH, ListingsSearchResultsSchema, {
        index: 'listing',
        locationPk: listingSearch.locationPk,
        locationSk: listingSearch.locationSk,
        listingTarget: listingSearch.listingTarget,
        listingType: listingSearch.listingType,
        listingArea: listingSearch.listingArea,
        minPrice: listingSearch.minPrice,
        maxPrice: listingSearch.maxPrice
      })
    if (res && res.listings) {
      await this.mutateListingData(res.listings)
    }
  }
}
