import { logger } from 'common/logger'
import GenericDao, { RecordPrefix } from 'dao/dynamo-db'
import { MigrationJob, MigrationStatus, SystemStatus, SystemStatusSchema, SystemVersion } from 'admin/index'
import Migration001Nr1 from 'admin/migration/001_1'
import Migration001Nr2 from 'admin/migration/001_2'

export class SystemAdminService {
  readonly genericDao: GenericDao
  readonly allMigrations: Array<MigrationJob>

  constructor () {
    this.genericDao = new GenericDao()
    this.allMigrations = [
      new Migration001Nr1(),
      new Migration001Nr2()
    ]
  }

  async migrate (version: string, orderNr: string, dryRun: boolean): Promise<boolean> {
    logger.info(`Migrate to version: ${version}_${orderNr}`)
    try {
      const migration = this.allMigrations.find(e => e.targetSystemVersion() === version && e.orderNumber() === +orderNr)
      if (migration) {
        const systemStatus = await this.getSystemStatus()
        if (!systemStatus || !systemStatus.migrationHistory) {
          logger.info('Unable to find system status entry in the db, run `status` command')
        } else {
          const existing = systemStatus.migrationHistory.find(e => e.version === version && e.order === orderNr)
          if (existing && !migration.allowReRun()) {
            logger.info('Already migrated and `allowReRun` returned false, skipping')
          } else {
            const migrationStatus: MigrationStatus = {
              version,
              order: orderNr,
              type: migration.type(),
              migrationStart: new Date().toLocaleString()
            }
            migrationStatus.success = await migration.migrate()
            migrationStatus.migrationEnd = new Date().toLocaleString()

            if (!dryRun) {
              logger.info(migrationStatus, 'status?')
              systemStatus.migrationHistory.push(migrationStatus)
              const saveResult = await this.saveSystemStatus(systemStatus)
              if (saveResult) {
                logger.info('Migration job finished successfully')
                return true
              } else {
                logger.info('Migration job failed')
              }
            } else {
              return migrationStatus.success
            }
          }
        }
      } else {
        logger.info(`Could not find migration in version ${version}_${orderNr}`)
      }
    } catch (err) {
      logger.error(err)
    }
    return false
  }

  async showMigrations (): Promise<Object> {
    const result: { [k: string]: any } = {}
    try {
      const systemStatus = await this.getSystemStatus()
      if (systemStatus?.migrationHistory) {
        result.migrationHistory = systemStatus.migrationHistory.map(m => `${m.version}_${m.order} :: ${m.type}`)
      }
      result.allMigrations = this.allMigrations.map(m => `${m.targetSystemVersion()}_${m.orderNumber()} :: ${m.type()}`)
      result.systemStatus = systemStatus
    } catch (err) {
      logger.error(err)
    }
    return result
  }

  async getSystemStatus (): Promise<SystemStatus | undefined> {
    try {
      const maybeListing = await this.genericDao.fetch<SystemStatus, typeof SystemStatusSchema>(
        RecordPrefix.ADMIN_SYSTEM_VERSION, RecordPrefix.ADMIN_SYSTEM_VERSION, SystemStatusSchema)

      if (maybeListing.found) {
        return maybeListing.data
      } else {
        logger.info('System status unavailable, assuming this is initial run, init database version entry.')
        const systemStatus: SystemStatus = {
          version: SystemVersion.V001,
          envName: process.env.ENV_NAME as string,
          migrationHistory: []
        }
        await this.saveSystemStatus(systemStatus)
        return systemStatus
      }
    } catch (err) {
      logger.error(err)
    }
    return undefined
  }

  async saveSystemStatus (systemStatus: SystemStatus): Promise<boolean> {
    try {
      await this.genericDao.save(RecordPrefix.ADMIN_SYSTEM_VERSION, RecordPrefix.ADMIN_SYSTEM_VERSION, systemStatus)
      return true
    } catch (err) {
      logger.error(err)
    }
    return false
  }
}
