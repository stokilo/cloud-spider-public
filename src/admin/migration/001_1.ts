import GenericDao from 'dao/dynamo-db'
import { logger } from 'common/logger'
import { readTextBucket } from 's3/s3-reader'
import parse from 'csv-parse/lib/sync'
import AddressesIndexConfig from 'service/es/indexes/addresses'
import EsIndexOps from 'service/es/index-ops'
import { EsAddressDocument, ADDRESSES_INDEX_PROPS } from 'service/es'
import { delay, MigrationJob, SystemVersion } from 'admin/index'

const appBucketName = process.env.APP_BUCKET_NAME as string

/**
 * Migration 001: import address autocomplete from S3 to ES and DynamoDB
 */
export default class Migration001Nr1 implements MigrationJob {
  type (): string {
    return 'IMPORT_ADDRESS_DYNAMO_DB_AND_ES'
  }

  targetSystemVersion (): SystemVersion {
    return SystemVersion.V001
  }

  orderNumber (): number {
    return 1
  }

  allowReRun (): boolean {
    return true
  }

  getObjectKeyToImport = (): string => '0.1/address-import-short.csv'

  async migrate (): Promise<boolean> {
    if (!await this.migrateDynamoDb()) {
      return false
    }
    return await this.migrateES()
  }

  async migrateDynamoDb (): Promise<boolean> {
    const genericDao = new GenericDao()
    logger.info(`Start es data import from: ${appBucketName}/${this.getObjectKeyToImport()}`)
    const addressImportCSV = await readTextBucket(appBucketName, this.getObjectKeyToImport())
    const csvFile = parse(addressImportCSV, {
      columns: true,
      bom: true,
      delimiter: ',',
      skipEmptyLines: true
    })

    const batchPutCommands = []
    let keys: { [key: string]: any } = {}

    try {
      logger.time('Processing all records')
      for (let i = 0; i < csvFile.length; i++) {
        const record = csvFile[i]
        const pk = record.PK
        const sk = record.SK
        const province = record.PROVINCE
        const county = record.COUNTY
        const borough = record.BOROUGH
        const city = record.CITY
        const street = record.STREET
        const putCommand = genericDao.getPutCommand(pk, sk, {
          province,
          county,
          borough,
          city,
          street
        })
        const key = `${record.PK}-${record.SK}`

        if (!(key in keys)) {
          batchPutCommands.push(putCommand)
          keys[key] = true
        }

        if (batchPutCommands.length === 200 || i === csvFile.length - 1) {
          const result = await genericDao.batchSave('Import address data', batchPutCommands)

          if (result.UnprocessedItems && Object.keys(result.UnprocessedItems).length > 0) {
            await delay(1000)
            const secondResult = await genericDao.batchSave('Import address data, retry unprocessed items', batchPutCommands)

            if (secondResult.UnprocessedItems && Object.keys(secondResult.UnprocessedItems).length > 0) {
              return false
            }
          }
          batchPutCommands.splice(0, batchPutCommands.length)
          keys = {}
        }
      }
      logger.timeEnd('Processing all records')
    } catch (e) {
      logger.error(e)
    }

    return true
  }

  async migrateES (): Promise<boolean> {
    logger.info(`Start es data import from: ${appBucketName}/${this.getObjectKeyToImport()}`)
    const addressImportCSV = await readTextBucket(appBucketName, this.getObjectKeyToImport())
    logger.info('File loaded into memory, parsing...')
    const csvFile = parse(addressImportCSV, {
      columns: true,
      bom: true,
      delimiter: ',',
      skipEmptyLines: true
    })

    logger.info('Index creation')
    const addressesIndexConfig = new AddressesIndexConfig()
    logger.info('Index configure')
    const indexCreate = await addressesIndexConfig.configureIndex(true)
    logger.info(`Index created ? ${indexCreate}`)

    const batchEsDocuments = []
    let keys: { [key: string]: any } = {}

    try {
      logger.time('Processing all records')
      let total = 0
      const esIndexOps = new EsIndexOps()
      for (let i = 0; i < csvFile.length; i++) {
        const record = csvFile[i]
        const pk = record.PK
        const sk = record.SK
        const province = record.PROVINCE
        const county = record.COUNTY
        const borough = record.BOROUGH
        const city = record.CITY
        const street = record.STREET

        const esDocument: EsAddressDocument = {
          pk,
          sk,
          city,
          street,
          location: `${province} ${county} ${borough} ${city} ${street}`
        }
        const key = `${record.PK}-${record.SK}`

        if (!(key in keys)) {
          batchEsDocuments.push(esDocument)
          keys[key] = true
        }

        if (batchEsDocuments.length === 200 || i === csvFile.length - 1) {
          total = total + batchEsDocuments.length
          const esInsert = await esIndexOps.bulkInsert(batchEsDocuments, ADDRESSES_INDEX_PROPS)
          if (!esInsert) {
            logger.info('Failed to insert to ES index')
            return false
          }

          batchEsDocuments.splice(0, batchEsDocuments.length)
          keys = {}
        }
      }
      logger.timeEnd('Processing all records')
      logger.info(`Processed ${total} es documents`)
    } catch (e) {
      logger.error(e)
    }

    return true
  }
}
