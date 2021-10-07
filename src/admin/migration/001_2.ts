import { logger } from 'common/logger'
import ListingsIndexConfig from 'service/es/indexes/listings'
import { MigrationJob, SystemVersion } from 'admin/index'
import { EsListingDocument, LISTINGS_INDEX_PROPS } from 'service/es'
import EsIndexOps from 'service/es/index-ops'
import {
  LISTING_TARGET_RENTAL,
  LISTING_TARGET_SALE,
  LISTING_TYPE_APARTMENT,
  LISTING_TYPE_HOUSE
} from 'backend-frontend/listing/listing'

/**
 * Migration 002: create index for property listings
 */
export default class Migration001Nr2 implements MigrationJob {
  type (): string {
    return 'ES_INDEX_FOR_LISTINGS'
  }

  targetSystemVersion (): SystemVersion {
    return SystemVersion.V001
  }

  orderNumber (): number {
    return 2
  }

  allowReRun (): boolean {
    return true
  }

  async migrate (): Promise<boolean> {
    return await this.migrateES()
  }

  async migrateES (): Promise<boolean> {
    logger.info('Index creation')
    const listingsIndexConfig = new ListingsIndexConfig()
    const indexCreated = await listingsIndexConfig.configureIndex(true)
    logger.info(`Index created? ${indexCreated}`)
    // const document1: EsListingDocument = {
    //   pk: '1',
    //   sk: '1',
    //   title: 'Listing for Krakow Zwierzyniecka',
    //   type: LISTING_TYPE_HOUSE.id,
    //   target: LISTING_TARGET_SALE.id,
    //   area: '50',
    //   price: '150000',
    //   location: 'Małopolskie,Kraków,Kraków-śródmieście,Kraków-śródmieście,zwierzyniecka',
    //   locationPk: 'PL#12',
    //   locationSk: '12#61#05#Kraków-śródmieście#zwierzyniecka',
    //   coverFileName: '',
    //   listingFileNames: ['']
    // }
    // const document2: EsListingDocument = {
    //   pk: '2',
    //   sk: '2',
    //   title: 'Listing for Krakow śródmieście',
    //   type: LISTING_TYPE_HOUSE.id,
    //   target: LISTING_TARGET_SALE.id,
    //   area: '150',
    //   price: '650000',
    //   location: 'Małopolskie,Kraków,Kraków-śródmieście,Kraków-śródmieście,',
    //   locationPk: 'PL#12',
    //   locationSk: '12#61#05#Kraków-śródmieście',
    //   coverFileName: '',
    //   listingFileNames: ['']
    // }
    //
    // const document3: EsListingDocument = {
    //   pk: '3',
    //   sk: '3',
    //   title: 'Listing for Warszawa',
    //   type: LISTING_TYPE_APARTMENT.id,
    //   target: LISTING_TARGET_RENTAL.id,
    //   area: '450',
    //   price: '12250000',
    //   location: 'mazowieckie,Warszawa,Warszawa,Warszawa',
    //   locationPk: 'PL#04',
    //   locationSk: '04#63#03#Warszawa',
    //   coverFileName: '',
    //   listingFileNames: ['']
    // }
    //
    // const esIndexOps = new EsIndexOps()
    // if (!esIndexOps.index(document1, LISTINGS_INDEX_PROPS)) {
    //   return false
    // }
    // if (!esIndexOps.index(document2, LISTINGS_INDEX_PROPS)) {
    //   return false
    // }
    // return esIndexOps.index(document3, LISTINGS_INDEX_PROPS)
    //

    return true
  }
}
