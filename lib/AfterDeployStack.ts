import { Stack, Script, App, StackProps } from '@serverless-stack/resources'
import * as iam from '@aws-cdk/aws-iam'
import { SubnetType } from '@aws-cdk/aws-ec2'
import SharedReferences from '../lib/SharedReferences'

export class AfterDeployStack extends Stack {
  constructor (scope: App, id: string, sharedReferences: SharedReferences, props?: StackProps) {
    super(scope, id, props)

    const afterDeployScript = new Script(this, 'AfterDeployScript', {
      function: {
        handler: 'src/api-gateway/migrate/after-deploy.handler',
        vpc: sharedReferences.vpc,
        vpcSubnets: {
          subnetType: SubnetType.ISOLATED
        },
        securityGroups: [sharedReferences.sgForIsolatedSubnet]
      }
    })

    afterDeployScript.attachPermissions([
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
  }
}
