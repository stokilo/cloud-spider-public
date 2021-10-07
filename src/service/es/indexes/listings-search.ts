import { logger } from 'common/logger'
import {
  EsIndexSearch, EsListingDocument,
  LISTINGS_INDEX_PROPS
} from 'service/es/index'
import EsIndexOps from 'service/es/index-ops'
import {
  ListingsSearchResults
} from 'backend-frontend/listing/search'
import {
  LISTING_AREA_BETWEEN_40_80,
  LISTING_AREA_MAX40, LISTING_TARGET_RENTAL,
  LISTING_TARGET_SALE, LISTING_TYPE_APARTMENT, LISTING_TYPE_HOUSE,
  ListingSchema
} from 'backend-frontend/listing/listing'

export default class ListingsIndexSearch implements EsIndexSearch<ListingsSearchResults> {
  readonly esIndexOps: EsIndexOps

  constructor () {
    this.esIndexOps = new EsIndexOps()
  }

  public async search (searchParams: { [key: string]: string }): Promise<ListingsSearchResults> {
    const listingsSearchResults: ListingsSearchResults = {
      listings: []
    }

    const MAX_ES_INT = 2147483647

    const maxPrice = isNaN(+searchParams.maxPrice) || +searchParams.maxPrice <= 0
      ? MAX_ES_INT
      : (+searchParams.maxPrice > MAX_ES_INT
          ? MAX_ES_INT
          : +searchParams.maxPrice)

    const minPrice = isNaN(+searchParams.minPrice)
      ? 0
      : (+searchParams.minPrice > maxPrice
          ? maxPrice
          : +searchParams.minPrice)

    let minListingArea = 0
    let maxListingArea = 0
    if (searchParams.listingArea === LISTING_AREA_MAX40.id) {
      maxListingArea = 40
    } else if (searchParams.listingArea === LISTING_AREA_BETWEEN_40_80.id) {
      minListingArea = 40
      maxListingArea = 80
    } else {
      minListingArea = 80
      maxListingArea = MAX_ES_INT
    }

    const listingType = searchParams.listingType === LISTING_TYPE_APARTMENT.id
      ? LISTING_TYPE_APARTMENT.id
      : LISTING_TYPE_HOUSE.id
    const listingTarget = searchParams.listingTarget === LISTING_TARGET_SALE.id
      ? LISTING_TARGET_SALE.id
      : LISTING_TARGET_RENTAL.id

    logger.info(`minListingArea ${minListingArea} maxListingArea ${maxListingArea}`)
    logger.info(`minPrice ${minPrice} maxPrice ${maxPrice}`)
    logger.info(`listingType ${listingType} listingTarget ${listingTarget}`)

    try {
      const client = await this.esIndexOps.getClient()
      const searchResult = await client.search({
        index: LISTINGS_INDEX_PROPS.indexName(),
        body: {
          size: 10,
          query: {
            bool: {
              must: [
                {
                  match: {
                    locationPk: searchParams.locationPk
                  }
                },
                {
                  prefix: {
                    locationSk: searchParams.locationSk
                  }
                },
                {
                  match: {
                    target: listingTarget
                  }
                },
                {
                  match: {
                    type: listingType
                  }
                },
                {
                  range: {
                    price: {
                      gte: minPrice,
                      lte: maxPrice
                    }
                  }
                },
                {
                  range: {
                    area: {
                      gte: minListingArea,
                      lte: maxListingArea
                    }
                  }
                }
              ]
            }
          }
        }
      })
      // logger.info(searchResult.body.hits.hits, 'SearchResult::')
      if (searchResult.statusCode === 200) {
        listingsSearchResults.listings = searchResult.body.hits.hits.map(
          (e: { _source: EsListingDocument }) => ListingSchema.parse(e._source)
        )
      }
    } catch (e) {
      logger.error(e)
    }

    return listingsSearchResults
  }
}
