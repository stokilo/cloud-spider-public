import https_1 from 'https'
import http_1 from 'http'
import { Client, Connection } from '@elastic/elasticsearch'
import { sign } from 'aws4'
import { awsGetCredentials, createAWSConnection } from '@acuris/aws-es-connection'

export default class EsClient {
  readonly region

  constructor (region: string) {
    this.region = region
  }

  /**
   * Elasticsearch client for application domain es.awss.ws
   */
  public async getEsClient () : Promise<Client> {
    return await this.getEsClientForUrl('http://es.awss.ws')
  }

  private async getEsClientForUrl (esDomainUrl: string) : Promise<Client> {
    const awsCredentials = await awsGetCredentials()
    const connection = createAWSConnection(awsCredentials)
    connection.Connection = this.generateAWSConnectionClass(awsCredentials)
    return new Client({
      ...connection,
      node: esDomainUrl
    })
  }

  /**
   * ES connection class with request signing
   */
  private generateAWSConnectionClass (credentials: any) {
    const _region = this.region
    return class AWSConnection extends Connection {
      constructor (opts: any) {
        super(opts)
        this.makeRequest = this.signedRequest
      }

      signedRequest (reqParams: any) {
        // eslint-disable-next-line no-void
        const request = (reqParams === null || reqParams === void 0 ? void 0 : reqParams.protocol) === 'https:' ? https_1.request : http_1.request
        return request(sign(Object.assign(Object.assign({ region: _region }, reqParams), { service: 'es' }), credentials))
      }
    }
  }
}
