/* eslint-disable no-new */
import { App, Bucket, Stack, StackProps } from '@serverless-stack/resources'
import { BucketDeployment, Source, StorageClass } from '@aws-cdk/aws-s3-deployment'
import { BlockPublicAccess, Bucket as S3Bucket } from '@aws-cdk/aws-s3'
import SharedReferences, { APP_BUCKET_NAMES } from './SharedReferences'

export default class S3Stack extends Stack {
  constructor (scope: App, id: string, sharedReferences: SharedReferences, props?: StackProps) {
    super(scope, id, props)

    let configBucket
    const bucketName = sharedReferences.isDev ? APP_BUCKET_NAMES.DEV_APP_CONFIG : APP_BUCKET_NAMES.APP_CONFIG
    if (!sharedReferences.existingBuckets[bucketName]) {
      configBucket = new S3Bucket(this, `CreatedApplicationConfig-${bucketName}`, {
        bucketName,
        publicReadAccess: false,
        blockPublicAccess: BlockPublicAccess.BLOCK_ALL
      })
    } else {
      configBucket = S3Bucket.fromBucketAttributes(this, `ImportedApplicationConfig-${bucketName}`, {
        bucketName
      })
    }

    new BucketDeployment(this, 'ApplicationConfigDeployment', {
      sources: [Source.asset('./lib/data/')],
      destinationBucket: configBucket,
      retainOnDelete: false,
      prune: true,
      storageClass: StorageClass.STANDARD,
      memoryLimit: 3008
    })

    this.addOutputs({
      bucketName: configBucket.bucketName,
      bucketArn: configBucket.bucketArn
    })

    const sstConfigBucket = new Bucket(this, `ApplicationConfig-${bucketName}`, {
      s3Bucket: configBucket
    })
    sharedReferences.applicationConfigBucketName = configBucket.bucketName
    sharedReferences.applicationConfigBucket = sstConfigBucket
  }
}
