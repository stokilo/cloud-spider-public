/* eslint-disable @typescript-eslint/no-unused-vars */
import * as sst from '@serverless-stack/resources'
import VpcStack from './VpcStack'
import VpnStack from './VpnStack'
import ElasticStack from './ElasticStack'
import { AfterDeployStack } from './AfterDeployStack'
import ApiAndAuthStack from './ApiAndAuthStack'
import SharedReferences from './SharedReferences'
import S3Stack from './S3Stack'
import DynamoDbStack from './DynamoDbStack'
import StaticWebsiteStack from './StaticWebsiteStack'

export default async function main (app: sst.App): Promise<void> {
  app.setDefaultFunctionProps({
    runtime: 'nodejs14.x'
  })

  const sharedReferences = new SharedReferences()
  await sharedReferences.init(app)

  app.setDefaultFunctionProps({
    memorySize: 128,
    environment: {
      REGION: sharedReferences.region
    }
  })

  const vpcStack = new VpcStack(app, 'VpcStack', sharedReferences)
  const s3Stack = new S3Stack(app, 'S3Stack', sharedReferences)
  const dynamoDbStack = new DynamoDbStack(app, 'DynamoDbStack', sharedReferences)
  const elasticStack = new ElasticStack(app, 'ElasticStack', sharedReferences)
  const staticWebsiteStack = new StaticWebsiteStack(app, 'StaticWebsiteStack', sharedReferences)
  const apiAuthStack = new ApiAndAuthStack(app, 'ApiAndAuthStack', sharedReferences)
  // before initial deploy: cert.sh must be executed
  const vpnStack = new VpnStack(app, 'VpnStack', sharedReferences)

  // migrations
  // const afterDeployStack = new AfterDeployStack(app, 'AfterDeployStack', sharedReferences)
  // afterDeployStack.addDependency(elasticStack)
  // afterDeployStack.addDependency(dynamoDbStack)
  // afterDeployStack.addDependency(apiAuthStack)
  // afterDeployStack.addDependency(vpnStack)
}
