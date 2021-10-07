import {
  APIGatewayProxyEvent,
  APIGatewayProxyHandler
} from 'aws-lambda'
import { logger } from 'common/logger'
import { http200WithJSONBody } from 'api-gateway'
import { S3Service } from 'service/s3-service'
import { toRequestContext } from 'common/request-context'
import { ListingSchema } from 'backend-frontend/listing/listing'
import { ListingService } from 'service/listing-service'
import { isRoute, ROUTE_NAMES } from 'backend-frontend/routes'
import { HttpMethods } from '@aws-cdk/aws-s3'

const s3Service = new S3Service()
const listingService = new ListingService()

/**
 * This is a proxy lambda for accessing for low resource config (128MB memory).
 * In order to save deployment time and resources we share lambda with similar memory/cpu requirements.
 * These lambdas requires an authenticated user.
 * @param event
 */
// eslint-disable-next-line @typescript-eslint/no-unused-vars
export const handler: APIGatewayProxyHandler = async (event: APIGatewayProxyEvent) => {
  let resultObj = {}
  try {
    const requestContext = toRequestContext(event)
    if (event.requestContext.httpMethod === HttpMethods.POST) {
      if (event.body) {
        if (isRoute(event, ROUTE_NAMES.LISTINGS)) {
          resultObj = await listingService.onListingSave(ListingSchema.parse(JSON.parse(event.body)),
            requestContext)
        }
      }
    } else if (event.requestContext.httpMethod === HttpMethods.GET) {
      if (isRoute(event, ROUTE_NAMES.S3_SIGNED_URLS)) {
        resultObj = await s3Service.generatePreSignedUrl(event, requestContext)
      } else if (isRoute(event, ROUTE_NAMES.LISTINGS)) {
        if (event.queryStringParameters && event.queryStringParameters.id) {
          resultObj = await listingService.getListing(requestContext, event.queryStringParameters.id)
        } else {
          resultObj = await listingService.fetchListings(requestContext)
        }
      }
    }
  } catch (e) {
    logger.error(e)
  }

  return http200WithJSONBody(JSON.stringify(resultObj))
}
