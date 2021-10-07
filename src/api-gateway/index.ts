import { APIGatewayProxyResult } from 'aws-lambda/trigger/api-gateway-proxy'
import { APIGatewayProxyEvent } from 'aws-lambda'

export function queryParam (event: APIGatewayProxyEvent, paramName: string) : string {
  return event.queryStringParameters && event.queryStringParameters[paramName]
    ? event.queryStringParameters[paramName] as string
    : ''
}

export function http200WithJSONBody (body: string): APIGatewayProxyResult {
  return {
    statusCode: 200,
    headers: {
      'Access-Control-Allow-Headers': 'Content-Type,x-language',
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'OPTIONS,POST,GET',
      'Content-Type': 'text/json'
    },
    body
  }
}

/**
 * redirect to location
 * @param location
 */
export function http302 (location: string): APIGatewayProxyResult {
  return {
    statusCode: 302,
    headers: {
      'Content-Type': 'text/json',
      Location: location
    },
    body: ''
  }
}
