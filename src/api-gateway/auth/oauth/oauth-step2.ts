import { APIGatewayProxyEvent, APIGatewayProxyHandler } from 'aws-lambda'
import { logger } from 'common/logger'
import { OAuthService } from 'service/oauth-service'
import { http200WithJSONBody } from 'api-gateway'

const oAuthService = new OAuthService()

export const handler: APIGatewayProxyHandler = async (event: APIGatewayProxyEvent) => {

  if (event.queryStringParameters && event.queryStringParameters.accessCode) {
    try {
      const tokens = await oAuthService.onOAuthStep2(event.queryStringParameters.accessCode)
      return http200WithJSONBody(JSON.stringify(tokens))
    } catch (err) {
      logger.error(err)
    }
  }

  return http200WithJSONBody(JSON.stringify({}))
}
