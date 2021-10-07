import * as sst from '@serverless-stack/resources'
import { Function } from '@serverless-stack/resources'
import { throwExpression } from 'common/utils'
import { AuthorizationType, Cors, IdentitySource, MethodLoggingLevel, RequestAuthorizer } from '@aws-cdk/aws-apigateway'
import * as iam from '@aws-cdk/aws-iam'
import { SubnetType } from '@aws-cdk/aws-ec2'
import { Duration } from '@aws-cdk/core'
import { ROUTES } from 'backend-frontend/routes'
import SharedReferences, { APP_BUCKET_NAMES } from './SharedReferences'

export default class ApiAndAuthStack extends sst.Stack {
  constructor (scope: sst.App, id: string, sharedReferences: SharedReferences, props?: sst.StackProps) {
    super(scope, id, props)

    const authorizer = new RequestAuthorizer(this, 'LambdaAuthorizer', {
      handler: new Function(this, 'LambdaAuthorizerFunction', {
        handler: 'src/api-gateway/auth/authorizer.handler',
        environment: {
          REGION: sharedReferences.region,
          DYNAMODB_TABLE_NAME: sharedReferences.dynamoDbTable.dynamodbTable.tableName
        },
        permissions: [sharedReferences.dynamoDbTable]
      }),
      identitySources: [IdentitySource.header('authorization')]
    })

    const inVpc = {
      vpc: scope.local ? undefined : sharedReferences.vpc,
      vpcSubnets: scope.local
        ? undefined
        : {
            subnetType: SubnetType.ISOLATED
          },
      securityGroups: scope.local ? undefined : [sharedReferences.sgForIsolatedSubnet]
    }

    const proxy128 = {
      function: 'src/api-gateway/proxy128.handler',
      memorySize: 128
    }

    const proxy128InVpc = {
      memorySize: 128,
      function: {
        handler: 'src/api-gateway/proxy128.handler',
        ...inVpc
      }
    }

    const methodOptionsNoAuth = {
      methodOptions: {
        authorizationType: AuthorizationType.NONE
      }
    }

    const api = new sst.ApiGatewayV1Api(this, 'Api', {
      defaultAuthorizationType: AuthorizationType.CUSTOM,
      defaultAuthorizer: authorizer,
      restApi: {
        defaultCorsPreflightOptions: {
          allowMethods: Cors.ALL_METHODS,
          allowOrigins: ['http://localhost:3000', 'https://dev.stokilo.com', 'https://stokilo.com'],
          allowHeaders: [...Cors.DEFAULT_HEADERS, 'x-language']
        },
        deployOptions: {
          methodOptions: {
            '/*/*': {
              throttlingRateLimit: sharedReferences.isProd ? 100 : 5,
              throttlingBurstLimit: sharedReferences.isProd ? 20 : 4
            }
          },
          tracingEnabled: false,
          loggingLevel: MethodLoggingLevel.OFF
        }
      },
      routes: {
        // route for associations only like VPC, it make sure that CDK won't drop exports and recreate stacks
        [ROUTES.GET_ADMIN_DUMMY]: {
          methodOptions: {
            authorizationType: AuthorizationType.IAM
          },
          function: {
            handler: 'src/api-gateway/admin/dummy.handler',
            vpc: sharedReferences.vpc,
            vpcSubnets: {
              subnetType: SubnetType.ISOLATED
            },
            securityGroups: [sharedReferences.sgForIsolatedSubnet]
          }
        },
        [ROUTES.GET_ADMIN_PANEL]: {
          methodOptions: {
            authorizationType: AuthorizationType.IAM
          },
          function: {
            handler: 'src/api-gateway/admin/admin-panel.handler',
            ...inVpc,
            timeout: Duration.minutes(15),
            memorySize: 10240
          }
        },
        [ROUTES.GET_OAUTH_STEP1]: {
          ...methodOptionsNoAuth,
          function: 'src/api-gateway/auth/oauth/oauth-step1.handler'
        },
        [ROUTES.GET_OAUTH_STEP2]: {
          ...methodOptionsNoAuth,
          function: 'src/api-gateway/auth/oauth/oauth-step2.handler'
        },
        [ROUTES.POST_OAUTH_REFRESH_TOKEN]: {
          ...methodOptionsNoAuth,
          function: 'src/api-gateway/auth/oauth/oauth-refresh-token.handler'
        },
        [ROUTES.GET_S3_SIGNED_URL]: proxy128,
        [ROUTES.POST_LISTING]: proxy128InVpc,
        [ROUTES.GET_LISTING]: proxy128,
        [ROUTES.GET_LISTINGS]: proxy128,
        [ROUTES.GET_SEARCH]: {
          function: {
            handler: 'src/api-gateway/es-search.handler',
            ...inVpc
          }
        }
      },
      defaultFunctionProps: {
        environment: {
          DYNAMODB_TABLE_NAME: sharedReferences.dynamoDbTable.dynamodbTable.tableName,
          AWS_NODEJS_CONNECTION_REUSE_ENABLED: '1',
          FACEBOOK_CLIENT_ID: process.env.FACEBOOK_CLIENT_ID ?? throwExpression('FACEBOOK_CLIENT_ID is required'),
          FACEBOOK_CLIENT_SECRET: process.env.FACEBOOK_CLIENT_SECRET ?? throwExpression('FACEBOOK_CLIENT_SECRET is required'),
          FACEBOOK_REDIRECT_URL: process.env.FACEBOOK_REDIRECT_URL ?? throwExpression('FACEBOOK_REDIRECT_URL is required'),
          GOOGLE_CLIENT_ID: process.env.GOOGLE_CLIENT_ID ?? throwExpression('GOOGLE_CLIENT_ID is required'),
          GOOGLE_CLIENT_SECRET: process.env.GOOGLE_CLIENT_SECRET ?? throwExpression('GOOGLE_CLIENT_SECRET is required'),
          GOOGLE_REDIRECT_URL: process.env.GOOGLE_REDIRECT_URL ?? throwExpression('GOOGLE_REDIRECT_URL is required'),
          REGION: sharedReferences.region,
          ENV_NAME: sharedReferences.isDev ? 'DEV' : 'PROD',
          ENTRY_PAGE: process.env.ENTRY_PAGE ?? throwExpression('ENTRY_PAGE is required'),
          APP_BUCKET_NAME: sharedReferences.isDev ? APP_BUCKET_NAMES.DEV_APP_CONFIG : APP_BUCKET_NAMES.APP_CONFIG,
          IMG_UPLOAD_BUCKET_NAME: sharedReferences.isDev ? APP_BUCKET_NAMES.DEV_UPLOAD_BUCKET : APP_BUCKET_NAMES.UPLOAD_BUCKET,
          IMG_BUCKET_NAME: sharedReferences.isDev ? APP_BUCKET_NAMES.DEV_IMG_BUCKET : APP_BUCKET_NAMES.IMG_BUCKET
        }
      },
      customDomain: {
        domainName: sharedReferences.isDev ? 'dev.api.awss.ws' : 'api.awss.ws',
        hostedZone: 'awss.ws',
        path: 'v1'
      },
      accessLog: false
    })

    api.restApi.addUsagePlan('ApiUsagePlan', {
      apiStages: [{
        api: api.restApi,
        stage: api.restApi.deploymentStage
      }],
      throttle: {
        rateLimit: sharedReferences.isProd ? 100 : 5,
        burstLimit: sharedReferences.isProd ? 20 : 4
      }
    })

    api.attachPermissions([sharedReferences.dynamoDbTable])
    api.attachPermissions([sharedReferences.applicationConfigBucket,
      sharedReferences.imgUploadBucket])
    api.attachPermissions([
      new iam.PolicyStatement({
        actions: ['es:*',
          'ec2:CreateNetworkInterface', 'ec2:DescribeNetworkInterfaces', 'ec2:DeleteNetworkInterface',
          'ec2:DescribeSecurityGroups', 'ec2:DescribeSubnets', 'ec2:DescribeVpcs'],
        effect: iam.Effect.ALLOW,
        resources: [
          '*'
        ]
      })
    ])

    this.addOutputs({
      apiRegion: sharedReferences.region,
      apiEndpoint: api.url
    })
  }
}
