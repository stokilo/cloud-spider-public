import { APIGatewayProxyEvent, APIGatewayProxyHandler } from 'aws-lambda'
import { logger } from 'common/logger'
import {
  AuthAndRefreshJwtToken,
  AuthAndRefreshJwtTokenSchema
} from 'backend-frontend/auth'
import { AuthService } from 'service/auth-service'
import { http200WithJSONBody } from 'api-gateway'

const authService = new AuthService()

export const handler: APIGatewayProxyHandler = async (event: APIGatewayProxyEvent) => {
  let newTokens: AuthAndRefreshJwtToken = {
    authToken: '',
    refreshToken: ''
  }

  try {
    const tokens: AuthAndRefreshJwtToken = AuthAndRefreshJwtTokenSchema.parse(JSON.parse(event.body as string))
    newTokens = await authService.handleRefreshToken(tokens)
  } catch (e) {
    logger.error(e)
  }

  return http200WithJSONBody(JSON.stringify(newTokens))
}
