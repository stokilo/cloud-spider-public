import { logger } from 'common/logger'
import GenericDao, { RecordPrefix } from 'dao/dynamo-db'
import { RequestContext } from 'common/request-context'
import {
  GetListing,
  GetListings,
  Listing, ListingRecord,
  ListingRecordSchema,
  PostListing
} from 'backend-frontend/listing/listing'
import { StatusOK, ValidationOK } from 'backend-frontend/form'
import { EsListingDocument, LISTINGS_INDEX_PROPS } from 'service/es'
import EsIndexOps from 'service/es/index-ops'

export class ListingService {
  readonly genericDao: GenericDao

  constructor () {
    this.genericDao = new GenericDao()
  }

  async getListing (requestContext: RequestContext, id: string): Promise<GetListing> {
    const response: GetListing = {
      listingRecord: undefined
    }

    try {
      const maybeListing = await this.genericDao.fetchPkNeqSk<ListingRecord, typeof ListingRecordSchema>(
        RecordPrefix.LISTING, requestContext.userId, RecordPrefix.LISTING, id, ListingRecordSchema)

      if (maybeListing.found) {
        response.listingRecord = maybeListing.data
      }
    } catch (err) {
      logger.error(err)
    }
    return response
  }

  async fetchListings (requestContext: RequestContext): Promise<GetListings> {
    const response: GetListings = {
      listingRecords: []
    }

    try {
      const lastListings = await this.genericDao.query(RecordPrefix.LISTING, requestContext.userId, ListingRecordSchema,
        { Limit: 5, ScanIndexForward: false })

      response.listingRecords = lastListings.found ? lastListings.data as ListingRecord[] : []
    } catch (err) {
      logger.error(err)
    }
    return response
  }

  async onListingSave (listing: Listing, requestContext: RequestContext): Promise<PostListing> {
    const response: PostListing = {
      status: StatusOK(),
      validation: ValidationOK(),
      listingRecord: undefined
    }

    try {
      const result = await this.genericDao.saveWithSkKSUID(RecordPrefix.LISTING, requestContext.userId, listing)
      if (result.Item) {
        response.listingRecord = ListingRecordSchema.parse(result.Item)
        const item = result.Item
        const document: EsListingDocument = {
          pk: item.pk,
          sk: item.sk,
          title: item.col1.title,
          type: item.col1.type,
          target: item.col1.target,
          area: item.col1.area,
          price: item.col1.price,
          location: item.col1.location,
          locationPk: item.col1.locationPk,
          locationSk: item.col1.locationSk,
          coverFileName: item.col1.coverFileName,
          listingFileNames: item.col1.listingFileNames
        }

        const esIndexOps = new EsIndexOps()
        const esIndexResult = await esIndexOps.index(document, LISTINGS_INDEX_PROPS)
        logger.info(esIndexResult, 'EsIndexAddResult::')
      }
    } catch (err) {
      logger.error(err)
      response.status.success = false
    }
    return response
  }
}
