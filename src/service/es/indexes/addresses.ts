import { logger } from 'common/logger'
import { ADDRESSES_INDEX_PROPS, EsIndexConfig } from 'service/es/index'
import EsIndexOps from 'service/es/index-ops'

export default class AddressesIndexConfig implements EsIndexConfig {
  readonly esIndexOps: EsIndexOps

  constructor () {
    this.esIndexOps = new EsIndexOps()
  }

  public async configureIndex (recreate: boolean): Promise<boolean> {
    const client = await this.esIndexOps.getClient()
    if (recreate) {
      const indexExists = await this.esIndexOps.indexExists(ADDRESSES_INDEX_PROPS)
      if (indexExists) {
        await this.esIndexOps.deleteIndex(ADDRESSES_INDEX_PROPS)
      }
    }

    try {
      const indexCreate = await client.indices.create({
        index: ADDRESSES_INDEX_PROPS.indexName(),
        body: {
          settings: {
            number_of_shards: 1,
            analysis: {
              filter: {
                autocomplete_filter: {
                  type: 'edge_ngram',
                  min_gram: 3,
                  max_gram: 20
                }
              },
              analyzer: {
                autocomplete: {
                  type: 'custom',
                  tokenizer: 'whitespace',
                  filter: [
                    'lowercase',
                    'autocomplete_filter'
                  ]
                }
              }
            }
          }
        }
      }, { ignore: [400] })

      if (indexCreate.statusCode !== 200) {
        return false
      }

      const mapping = await client.indices.put_mapping({
        index: ADDRESSES_INDEX_PROPS.indexName(),
        type: 'address',
        include_type_name: true,
        body: {
          address: {
            properties: {
              city: {
                type: 'text',
                analyzer: 'autocomplete',
                search_analyzer: 'standard'
              },
              street: {
                type: 'text',
                analyzer: 'autocomplete',
                search_analyzer: 'standard'
              },
              location: {
                type: 'text'
              },
              pk: {
                type: 'text'
              },
              sk: {
                type: 'text'
              }
            }
          }
        }
      })

      return mapping.statusCode === 200
    } catch (e) {
      logger.error(e)
      return false
    }
  }
}
