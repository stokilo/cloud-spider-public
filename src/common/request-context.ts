import { APIGatewayProxyEvent } from 'aws-lambda'
import * as jwt from 'jsonwebtoken'
import { logger } from 'common/logger'

export interface RequestContext {
  userId: string
}

export const toRequestContext = (e: APIGatewayProxyEvent) => {
  const authHeader = e?.headers?.Authorization
  const decodedNotVerified = jwt.decode(authHeader as string)
  const userId = decodedNotVerified?.sub as string

  if (!userId || !userId.length) {
    throw new Error('Unable to construct request context, user id is not defined')
  }

  return {
    userId
  }
}
