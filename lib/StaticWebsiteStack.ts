/* eslint-disable no-new */
import { App, Bucket as SBucket, Stack, StackProps } from '@serverless-stack/resources'
import { BucketDeployment, Source, StorageClass } from '@aws-cdk/aws-s3-deployment'
import { Bucket, BucketPolicy, HttpMethods, RedirectProtocol } from '@aws-cdk/aws-s3'
import { RemovalPolicy } from '@aws-cdk/core'
import { Effect, PolicyStatement } from '@aws-cdk/aws-iam'
import { BucketProps, RedirectTarget } from '@aws-cdk/aws-s3/lib/bucket'
import { AnyPrincipal } from '@aws-cdk/aws-iam/lib/principals'
import SharedReferences, { APP_BUCKET_NAMES } from './SharedReferences'

export default class StaticWebsiteStack extends Stack {
  constructor (scope: App, id: string, sharedReferences: SharedReferences, props?: StackProps) {
    super(scope, id, props)

    if (sharedReferences.isDev) {
      this.staticWebsiteBucket(APP_BUCKET_NAMES.DEV_STOKILO, sharedReferences)
      this.staticWebsiteBucket(APP_BUCKET_NAMES.WWW_DEV_STOKILO, sharedReferences, {
        hostName: APP_BUCKET_NAMES.DEV_STOKILO,
        protocol: RedirectProtocol.HTTPS
      })
      const assetsBucket = this.staticAssetBucket(APP_BUCKET_NAMES.DEV_IMG_BUCKET, sharedReferences)
      this.uploadBucket(APP_BUCKET_NAMES.DEV_UPLOAD_BUCKET, sharedReferences, assetsBucket)
    } else if (sharedReferences.isProd) {
      this.staticWebsiteBucket(APP_BUCKET_NAMES.STOKILO, sharedReferences)
      this.staticWebsiteBucket(APP_BUCKET_NAMES.WWW_STOKILO, sharedReferences, {
        hostName: APP_BUCKET_NAMES.STOKILO,
        protocol: RedirectProtocol.HTTPS
      })
      const assetsBucket = this.staticAssetBucket(APP_BUCKET_NAMES.IMG_BUCKET, sharedReferences)
      this.uploadBucket(APP_BUCKET_NAMES.UPLOAD_BUCKET, sharedReferences, assetsBucket)
    }
  }

  /**
   * Website is generated via npm during deployment as a static site (SPA).
   * Files are copied to the bucket that is accessible only via Cloudflare proxy
   * DNS: stokilo.com or dev.stokilo.com
   */
  private staticWebsiteBucket (bucketName: APP_BUCKET_NAMES, sharedReferences: SharedReferences, redirectTarget?: RedirectTarget) {
    let websiteBucket
    if (!sharedReferences.existingBuckets[bucketName]) {
      const websiteBucketProps: BucketProps = redirectTarget
        ? {
            bucketName,
            publicReadAccess: true,
            removalPolicy: RemovalPolicy.RETAIN,
            websiteRedirect: redirectTarget
          }
        : {
            bucketName,
            publicReadAccess: true,
            websiteIndexDocument: 'index.html',
            websiteErrorDocument: 'index.html',
            removalPolicy: RemovalPolicy.RETAIN
          }

      websiteBucket = new Bucket(this, `StaticWebSiteStackBucketConfig-${bucketName}-${sharedReferences.stage}`, websiteBucketProps)
    } else {
      websiteBucket = Bucket.fromBucketAttributes(this, `ImportedStaticWebSiteStackBucketConfig-${bucketName}-${sharedReferences.stage}`, {
        bucketName
      })
    }

    const websiteResourcePolicy = this.getCloudflareAccessOnlyPolicy(bucketName, sharedReferences.stage)
    const websiteBucketPolicy = new BucketPolicy(this, `WebsiteBucketPolicy-${bucketName}-${sharedReferences.stage}`, { bucket: websiteBucket })
    websiteBucketPolicy.document.addStatements(websiteResourcePolicy)
    websiteBucket.policy = websiteBucketPolicy

    new BucketDeployment(this, `StaticWebSiteStack-${bucketName}`, {
      sources: [Source.asset('./frontend/dist')],
      destinationBucket: websiteBucket,
      retainOnDelete: true,
      prune: true,
      storageClass: StorageClass.STANDARD
    })
  }

  /**
   * S3 bucket for storing images has DNS on Cloudflare like: img.stokilo.com or dev-img.stokilo.com
   * Bucket created here is for storing app images and serve them via cloudflare proxy only.
   */
  private staticAssetBucket (bucketName: APP_BUCKET_NAMES, sharedReferences: SharedReferences) {
    let assetsBucket
    if (!sharedReferences.existingBuckets[bucketName]) {
      const websiteBucketProps: BucketProps = {
        bucketName,
        publicReadAccess: true,
        websiteIndexDocument: 'index.html',
        websiteErrorDocument: 'index.html',
        removalPolicy: RemovalPolicy.RETAIN
      }
      assetsBucket = new Bucket(this, `WebsiteAssetsStackBucketConfig-${bucketName}-${sharedReferences.stage}`, websiteBucketProps)
    } else {
      assetsBucket = Bucket.fromBucketAttributes(this, `ImportedWebsiteAssetsStackBucketConfig-${bucketName}-${sharedReferences.stage}`, {
        bucketName
      })
    }

    const sBucket = new SBucket(this, `SBucketWebsiteAssetsStackBucketConfig-${bucketName}-${sharedReferences.stage}`, {
      s3Bucket: assetsBucket
    })

    const websiteResourcePolicy = this.getCloudflareAccessOnlyPolicy(bucketName, sharedReferences.stage)
    const websiteBucketPolicy = new BucketPolicy(this, `WebsiteBucketPolicy-${bucketName}-${sharedReferences.stage}`, { bucket: assetsBucket })
    websiteBucketPolicy.document.addStatements(websiteResourcePolicy)
    assetsBucket.policy = websiteBucketPolicy

    return sBucket
  }

  /**
   * S3 bucket for uploading images.
   */
  private uploadBucket (bucketName: APP_BUCKET_NAMES, sharedReferences: SharedReferences, assetsBucket: SBucket) {
    let uploadBucket
    if (!sharedReferences.existingBuckets[bucketName]) {
      const websiteBucketProps: BucketProps = {
        bucketName,
        publicReadAccess: false,
        removalPolicy: RemovalPolicy.RETAIN,
        cors: [
          {
            allowedMethods: [
              HttpMethods.POST,
              HttpMethods.PUT
            ],
            allowedOrigins: ['*'],
            allowedHeaders: ['*']
          }
        ]
      }
      uploadBucket = new Bucket(this, `WebsiteAssetsUploadStackBucketConfig-${bucketName}-${sharedReferences.stage}`, websiteBucketProps)
    } else {
      // todo: manually created don't have CORS set
      uploadBucket = Bucket.fromBucketAttributes(this, `ImportedWebsiteAssetsUploadStackBucketConfig-${bucketName}-${sharedReferences.stage}`, {
        bucketName
      })
    }

    const sBucket = new SBucket(this, `SBucketWebsiteAssetsUploadStackBucketConfig-${bucketName}-${sharedReferences.stage}`, {
      s3Bucket: uploadBucket
    })

    sharedReferences.imgUploadBucket = sBucket

    sBucket.addNotifications(this, [{
      handler: 'src/api-gateway/events/s3upload.handler',
      permissions: [sBucket, assetsBucket],
      memorySize: 1024
    }])
  }

  /**
   * Policy allows only developer and cloudflare IP to access the website
   */
  getCloudflareAccessOnlyPolicy (bucketName: string, stage: string): PolicyStatement {
    return new PolicyStatement({
      sid: `bucket-website-${bucketName}-${stage}`,
      actions: ['s3:GetObject'],
      effect: Effect.ALLOW,
      resources: [`arn:aws:s3:::${bucketName}/*`],
      principals: [new AnyPrincipal()],
      conditions: {
        IpAddress: {
          'aws:SourceIp': [
            '2400:cb00::/32',
            '2606:4700::/32',
            '2803:f800::/32',
            '2405:b500::/32',
            '2405:8100::/32',
            '2a06:98c0::/29',
            '2c0f:f248::/32',
            '173.245.48.0/20',
            '103.21.244.0/22',
            '103.22.200.0/22',
            '103.31.4.0/22',
            '141.101.64.0/18',
            '108.162.192.0/18',
            '190.93.240.0/20',
            '188.114.96.0/20',
            '197.234.240.0/22',
            '198.41.128.0/17',
            '162.158.0.0/15',
            '172.64.0.0/13',
            '131.0.72.0/22',
            '104.16.0.0/13',
            '104.24.0.0/14'
          ]
        }
      }
    })
  }
}
