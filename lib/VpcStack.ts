/* eslint-disable no-new */
import { App, Stack, StackProps } from '@serverless-stack/resources'
import * as ec2 from '@aws-cdk/aws-ec2'
import SharedReferences from './SharedReferences'
import { SubnetType } from '@aws-cdk/aws-ec2'

export default class VpcStack extends Stack {
  constructor (scope: App, id: string, sharedReferences: SharedReferences, props?: StackProps) {
    super(scope, id, props)

    sharedReferences.vpc = new ec2.Vpc(this, 'MainVpc', {
      cidr: '10.16.0.0/16',
      natGateways: 0,
      maxAzs: 3,
      enableDnsHostnames: true,
      enableDnsSupport: true,
      subnetConfiguration: [
        {
          cidrMask: 24,
          name: 'ingress',
          subnetType: ec2.SubnetType.PUBLIC
        },
        {
          cidrMask: 24,
          name: 'rds',
          subnetType: ec2.SubnetType.ISOLATED
        }
      ]
    })

    sharedReferences.sgForIsolatedSubnet = new ec2.SecurityGroup(this, 'MainVpcIsolatedSgForIsolatedSubnet', {
      vpc: sharedReferences.vpc,
      securityGroupName: 'MainVpcIsolatedSgForIsolatedSubnet',
      allowAllOutbound: true
    })

    sharedReferences.sgForIsolatedSubnet.addIngressRule(ec2.Peer.ipv4('10.16.0.0/16'),
      ec2.Port.icmpPing(), 'ICMP from VPC')
    sharedReferences.sgForIsolatedSubnet.addIngressRule(ec2.Peer.ipv4('10.16.0.0/16'),
      ec2.Port.tcp(22), '22 from VPC')
    sharedReferences.sgForIsolatedSubnet.addIngressRule(ec2.Peer.ipv4('10.16.0.0/16'),
      ec2.Port.tcp(80), '80 from VPC')
    sharedReferences.sgForIsolatedSubnet.addIngressRule(ec2.Peer.ipv4('10.16.0.0/16'),
      ec2.Port.tcp(443), '443 from VPC')
    sharedReferences.sgForIsolatedSubnet.addIngressRule(ec2.Peer.ipv4('10.16.0.0/16'),
      ec2.Port.tcp(53), 'DNS TCP from VPC')
    sharedReferences.sgForIsolatedSubnet.addIngressRule(ec2.Peer.ipv4('10.16.0.0/16'),
      ec2.Port.udp(53), 'DNS UDP from VPC')

    sharedReferences.vpc.addGatewayEndpoint('S3Endpoint', {
      service: ec2.GatewayVpcEndpointAwsService.S3,
      subnets: [{
        subnetType: SubnetType.ISOLATED
      }]
    })

    sharedReferences.vpc.addGatewayEndpoint('DynamoDbEndpoint', {
      service: ec2.GatewayVpcEndpointAwsService.DYNAMODB,
      subnets: [{
        subnetType: SubnetType.ISOLATED
      }]
    })
  }
}
