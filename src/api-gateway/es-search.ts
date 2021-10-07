import {
  APIGatewayProxyEvent,
  APIGatewayProxyHandler
} from 'aws-lambda'
import { logger } from 'common/logger'
import { http200WithJSONBody, queryParam } from 'api-gateway'
import AddressesIndexSearch from 'service/es/indexes/addresses-search'
import ListingsIndexSearch from 'service/es/indexes/listings-search'

const addressesIndexSearch = new AddressesIndexSearch()
const listingsIndexSearch = new ListingsIndexSearch()
// eslint-disable-next-line @typescript-eslint/no-unused-vars
export const handler: APIGatewayProxyHandler = async (event: APIGatewayProxyEvent) => {
  try {
    const term = queryParam(event, 'term')
    const index = queryParam(event, 'index')

    let resultObj = {}
    if (index === 'address') {
      logger.info(`search for: [${term}] in index: [${index}]`)
      resultObj = await addressesIndexSearch.search({ term })
    } else if (index === 'listing') {
      const locationPk = queryParam(event, 'locationPk')
      const locationSk = queryParam(event, 'locationSk')
      const listingType = queryParam(event, 'listingType')
      const listingTarget = queryParam(event, 'listingTarget')
      const listingArea = queryParam(event, 'listingArea')
      const minPrice = queryParam(event, 'minPrice')
      const maxPrice = queryParam(event, 'maxPrice')

      logger.info(`search for: [${locationPk}, ${locationSk}] in index: [${index}]`)
      resultObj = await listingsIndexSearch.search({
        locationPk,
        locationSk,
        listingType,
        listingTarget,
        listingArea,
        minPrice,
        maxPrice
      })
    }

    return http200WithJSONBody(JSON.stringify(resultObj))
  } catch (e) {
    logger.error(e)
  }

  return http200WithJSONBody(JSON.stringify({}))
}
