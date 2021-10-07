import {
  APIGatewayProxyEvent,
  APIGatewayProxyHandler
} from 'aws-lambda'
import { logger } from 'common/logger'
import { http200WithJSONBody, queryParam } from 'api-gateway'
import { SystemAdminService } from 'admin/system-admin-service'
import { AdminPanelActions } from 'admin'

const systemAdminService = new SystemAdminService()

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export const handler: APIGatewayProxyHandler = async (event: APIGatewayProxyEvent) => {
  let result: any
  const action = queryParam(event, 'action')
  const version = queryParam(event, 'version')
  const orderNr = queryParam(event, 'orderNr')
  const dryRun = !!queryParam(event, 'dryRun').length
  try {
    if (action === AdminPanelActions.STATUS) {
      result = await systemAdminService.showMigrations()
    } else if (action === AdminPanelActions.MIGRATE) {
      result = await systemAdminService.migrate(version, orderNr, dryRun)
    }
  } catch (e) {
    logger.error(e)
  }

  logger.info(result, `AdminPanel::action::${action}::dryRun::${dryRun}::result::${result}`)
  return http200WithJSONBody(JSON.stringify(result))
}
