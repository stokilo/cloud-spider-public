import * as ec2 from '@aws-cdk/aws-ec2'
import { Table, Bucket } from '@serverless-stack/resources'
import { HeadBucketCommand, S3Client } from '@aws-sdk/client-s3'
import * as sst from '@serverless-stack/resources'
import * as es from '@aws-cdk/aws-elasticsearch'

export enum APP_BUCKET_NAMES {
  STOKILO = 'stokilo.com',
  WWW_STOKILO = 'www.stokilo.com',
  APP_CONFIG = 'app-config.stokilo.com',
  IMG_BUCKET = 'prod-img.stokilo.com',
  UPLOAD_BUCKET = 'upload.stokilo.com',

  DEV_STOKILO = 'dev.stokilo.com',
  WWW_DEV_STOKILO = 'www.dev.stokilo.com',
  DEV_APP_CONFIG = 'dev-app-config.stokilo.com',
  DEV_IMG_BUCKET = 'dev-img.stokilo.com',
  DEV_UPLOAD_BUCKET = 'upload.dev.stokilo.com'
}

type ExistingBuckets = {
  [key in APP_BUCKET_NAMES]: boolean
}

export default class SharedReferences {
    public region = 'me-south-1';
    public stage: string = ''
    public isDev: boolean = false
    public isProd: boolean = false

    public vpc: ec2.Vpc;
    public sgForIsolatedSubnet: ec2.SecurityGroup

    public dynamoDbTable: Table
    public esDomain: es.Domain

    public applicationConfigBucketName: string
    public applicationConfigBucket: Bucket
    public imgUploadBucket: Bucket

    public existingBuckets : ExistingBuckets

    public async init (app: sst.App) {
      this.stage = app.stage
      this.isDev = app.stage === 'dev'
      this.isProd = app.stage === 'prod'

      this.existingBuckets = {
        [APP_BUCKET_NAMES.STOKILO]: await this.bucketExists(APP_BUCKET_NAMES.STOKILO),
        [APP_BUCKET_NAMES.WWW_STOKILO]: await this.bucketExists(APP_BUCKET_NAMES.WWW_STOKILO),
        [APP_BUCKET_NAMES.APP_CONFIG]: await this.bucketExists(APP_BUCKET_NAMES.APP_CONFIG),
        [APP_BUCKET_NAMES.IMG_BUCKET]: await this.bucketExists(APP_BUCKET_NAMES.IMG_BUCKET),
        [APP_BUCKET_NAMES.UPLOAD_BUCKET]: await this.bucketExists(APP_BUCKET_NAMES.UPLOAD_BUCKET),
        [APP_BUCKET_NAMES.DEV_STOKILO]: await this.bucketExists(APP_BUCKET_NAMES.DEV_STOKILO),
        [APP_BUCKET_NAMES.WWW_DEV_STOKILO]: await this.bucketExists(APP_BUCKET_NAMES.WWW_DEV_STOKILO),
        [APP_BUCKET_NAMES.DEV_APP_CONFIG]: await this.bucketExists(APP_BUCKET_NAMES.DEV_APP_CONFIG),
        [APP_BUCKET_NAMES.DEV_IMG_BUCKET]: await this.bucketExists(APP_BUCKET_NAMES.DEV_IMG_BUCKET),
        [APP_BUCKET_NAMES.DEV_UPLOAD_BUCKET]: await this.bucketExists(APP_BUCKET_NAMES.DEV_UPLOAD_BUCKET)
      }
    }

    private async bucketExists (bucketName: string) {
      const s3Client = new S3Client({ region: this.region })
      const command = new HeadBucketCommand({
        Bucket: bucketName
      })

      try {
        const response = await s3Client.send(command)
        return response.$metadata.httpStatusCode === 200
      } catch (e) {
        return false
      }
    }
}
