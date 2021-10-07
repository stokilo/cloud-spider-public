import {
  APIGatewayProxyEvent,
  APIGatewayProxyHandler,
} from 'aws-lambda'
import AuthFacebookService from 'service/auth-facebook-service'
import { logger } from 'common/logger'
import { http302 } from 'api-gateway'
import AuthGoogleService from 'service/auth-google-service'

const entryPage = process.env.ENTRY_PAGE
const authFacebookService = new AuthFacebookService()
const authGoogleService = new AuthGoogleService()

export const handler: APIGatewayProxyHandler = async (event: APIGatewayProxyEvent) => {
  let accessCode = ''

  if (event.queryStringParameters && event.queryStringParameters.code) {
    try {
      const code = event.queryStringParameters.code

      let isGoogle = false
      if (event.queryStringParameters.scope) {
        const scope = event.queryStringParameters.scope
        if (scope) {
          isGoogle = scope.includes('google')
        }
      }

      accessCode = isGoogle
        ? await authGoogleService.onGoogleAuthCallback(code)
        : await authFacebookService.onFacebookAuthCallback(code)
    } catch (err) {
      logger.error(err)
    }
  }

  return http302(`${entryPage}/?accessCode=${accessCode}`)
}
