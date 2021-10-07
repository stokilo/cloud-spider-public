import { logger } from 'common/logger'
import { ADDRESSES_INDEX_PROPS, EsAddressDocument, EsIndexSearch } from 'service/es/index'
import EsIndexOps from 'service/es/index-ops'
import {
  LocationSearchResults,
  LocationSearchResultSchema
} from 'backend-frontend/listing/search'

export default class AddressesIndexSearch implements EsIndexSearch<LocationSearchResults> {
  readonly esIndexOps: EsIndexOps

  constructor () {
    this.esIndexOps = new EsIndexOps()
  }

  public async search (searchParams: {[key: string]: string}): Promise<LocationSearchResults> {
    const locationSearchResults: LocationSearchResults = {
      locations: []
    }
    try {
      const client = await this.esIndexOps.getClient()
      const searchResult = await client.search({
        index: ADDRESSES_INDEX_PROPS.indexName(),
        body: {
          size: 10,
          query: {
            bool: {
              should: [{
                match: {
                  city: searchParams.term
                }
              }, {
                match: {
                  street: searchParams.term
                }
              }
              ]
            }
          }
        }
      })
      // logger.info(searchResult.body.hits, 'SearchResult::')
      if (searchResult.statusCode === 200) {
        locationSearchResults.locations = searchResult.body.hits.hits.map(
          (e: {_source: EsAddressDocument}) => LocationSearchResultSchema.parse(e._source)
        )
      }
    } catch (e) {
      logger.error(e)
    }
    return locationSearchResults
  }
}
