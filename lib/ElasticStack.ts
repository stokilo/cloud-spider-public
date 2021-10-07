/* eslint-disable no-new */
import { App, Stack, StackProps } from '@serverless-stack/resources'
import * as es from '@aws-cdk/aws-elasticsearch'
import { Duration, RemovalPolicy } from '@aws-cdk/core'
import * as ec2 from '@aws-cdk/aws-ec2'
import * as route53 from '@aws-cdk/aws-route53'
import * as iam from '@aws-cdk/aws-iam'
import SharedReferences from './SharedReferences'

export default class ElasticStack extends Stack {
  constructor (scope: App, id: string, sharedReferences: SharedReferences, props?: StackProps) {
    super(scope, id, props)

    const domainAccessPolicy = new iam.PolicyStatement({
      actions: ['*'],
      effect: iam.Effect.ALLOW,
      resources: ['*'],
      principals: [new iam.ServicePrincipal('lambda.amazonaws.com')]
    })

    const domainProps: es.DomainProps = {
      version: es.ElasticsearchVersion.V7_10,
      removalPolicy: RemovalPolicy.DESTROY,
      vpc: sharedReferences.vpc,
      securityGroups: [sharedReferences.sgForIsolatedSubnet],
      vpcSubnets: [
        {
          subnetType: ec2.SubnetType.ISOLATED,
          availabilityZones: [sharedReferences.vpc.availabilityZones[0], sharedReferences.vpc.availabilityZones[1]]
        }
      ],
      zoneAwareness: {
        enabled: true,
        availabilityZoneCount: 2
      },
      capacity: {
        masterNodes: 3,
        masterNodeInstanceType: 't3.small.elasticsearch',
        dataNodes: 2,
        dataNodeInstanceType: 't3.small.elasticsearch'
      },
      accessPolicies: [domainAccessPolicy]
    }
    sharedReferences.esDomain = new es.Domain(this, 'ElasticDomain', domainProps)

    const awssWsHostedZone = route53.HostedZone.fromHostedZoneAttributes(this, 'AwssWsHostedZone', {
      zoneName: 'awss.ws',
      hostedZoneId: 'Z06491372INE6OGQIKMIR'
    })

    const esRecord = new route53.CnameRecord(this, 'es.awss.ws', {
      recordName: 'es',
      domainName: sharedReferences.esDomain.domainEndpoint,
      ttl: Duration.seconds(10),
      zone: awssWsHostedZone
    })


    // this.exportValue(sharedReferences.esDomain, {name: 'esDomain'})
    // this.exportValue(sharedReferences.esDomain.domainArn, {name: 'domainArn'})

    // const bastionHost = new ec2.BastionHostLinux(this, 'BastionHostLinux', {
    //   vpc: sharedReferences.vpc,
    //   subnetSelection: {
    //     subnetType: ec2.SubnetType.PUBLIC
    //   },
    //   securityGroup: sharedReferences.elasticSecurityGroup,
    //   instanceName: 'BastionHost',
    //   instanceType: ec2.InstanceType.of(InstanceClass.T3, InstanceSize.NANO),
    //   machineImage: ec2.MachineImage.latestAmazonLinux()
    // })
    // bastionHost.allowSshAccessFrom(ec2.Peer.ipv4('94.203.155.114/32'))
    // bastionHost.instance.instance.addPropertyOverride('KeyName', 'bastion-key-name')
    //
    // domain.grantRead(bastionHost)
    // domain.grantWrite(bastionHost)
  }
}
