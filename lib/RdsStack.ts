/* eslint-disable no-new */
import { App, Stack, StackProps } from '@serverless-stack/resources'
import * as rds from '@aws-cdk/aws-rds'
import * as ec2 from '@aws-cdk/aws-ec2'
import { SubnetType } from '@aws-cdk/aws-ec2'
import * as route53 from '@aws-cdk/aws-route53'
import { Duration, RemovalPolicy } from '@aws-cdk/core'
import SharedReferences from '../lib/SharedReferences'

export default class RdsStack extends Stack {
  constructor (scope: App, id: string, sharedReferences: SharedReferences, props?: StackProps) {
    super(scope, id, props)

    const subnetGroup = new rds.SubnetGroup(this, 'RdsSubnetGroup', {
      description: 'Rds subnet group',
      vpc: sharedReferences.vpc,
      vpcSubnets: {
        subnetType: SubnetType.ISOLATED
      },
      removalPolicy: RemovalPolicy.DESTROY
    })

    const cluster = new rds.DatabaseCluster(this, 'AuroraCluster', {
      clusterIdentifier: 'postgres-aurora-cluster',
      instanceIdentifierBase: 'postgres-instance',
      engine: rds.DatabaseClusterEngine.auroraPostgres({ version: rds.AuroraPostgresEngineVersion.VER_12_4 }),
      credentials: rds.Credentials.fromGeneratedSecret('rdsadmin'),
      instances: 1,
      instanceProps: {
        instanceType: ec2.InstanceType.of(ec2.InstanceClass.T3, ec2.InstanceSize.MEDIUM),
        vpcSubnets: {
          subnetType: ec2.SubnetType.ISOLATED
        },
        vpc: sharedReferences.vpc
      },
      removalPolicy: RemovalPolicy.DESTROY,
      defaultDatabaseName: 'dbo',
      deletionProtection: false,
      subnetGroup
    }
    )

    const privateHostedZone = new route53.PrivateHostedZone(this, 'PrivateRdsHostedZone', {
      zoneName: 'rds.com',
      vpc: sharedReferences.vpc
    })

    new route53.CnameRecord(this, 'reader.rds.com', {
      recordName: 'reader',
      domainName: cluster.clusterReadEndpoint.hostname,
      ttl: Duration.seconds(10),
      zone: privateHostedZone
    })

    new route53.CnameRecord(this, 'writer.rds.com', {
      recordName: 'writer',
      domainName: cluster.clusterEndpoint.hostname,
      ttl: Duration.seconds(10),
      zone: privateHostedZone
    })
  }
}
