/* eslint-disable no-new */
import { App, Stack, StackProps } from '@serverless-stack/resources'
import * as ec2 from '@aws-cdk/aws-ec2'
import * as ssm from '@aws-cdk/aws-ssm'
import SharedReferences from '../lib/SharedReferences'
import * as route53 from '@aws-cdk/aws-route53'
import { Duration } from '@aws-cdk/core'

export default class VpnStack extends Stack {
  constructor (scope: App, id: string, sharedReferences: SharedReferences, props?: StackProps) {
    super(scope, id, props)

    const clientCertToken = ssm.StringParameter.valueForStringParameter(
      this, 'client-cert-parameter')
    const serverCertToken = ssm.StringParameter.valueForStringParameter(
      this, 'server-cert-parameter')

    const clientEndpoint = new ec2.ClientVpnEndpoint(this, 'VpnEndpoint', {
      cidr: '10.17.0.0/22',
      clientCertificateArn: clientCertToken,
      serverCertificateArn: serverCertToken,
      vpc: sharedReferences.vpc,
      splitTunnel: true,
      logging: false,
      selfServicePortal: false,
      dnsServers: ['10.17.0.2'],
      securityGroups: [sharedReferences.sgForIsolatedSubnet],
      vpcSubnets: {
        subnetGroupName: 'rds',
        availabilityZones: [sharedReferences.vpc.availabilityZones[0]]
      }
    })


    // const bastionHost = new ec2.BastionHostLinux(this, 'BastionHostLinux', {
    //   vpc: sharedReferences.vpc,
    //   subnetSelection: {
    //     subnetType: ec2.SubnetType.ISOLATED
    //   },
    //   securityGroup: sharedReferences.sgForIsolatedSubnet,
    //   instanceName: 'BastionHost',
    //   instanceType: ec2.InstanceType.of(ec2.InstanceClass.T3, ec2.InstanceSize.NANO),
    //   machineImage: ec2.MachineImage.latestAmazonLinux()
    // })
    // // bastionHost.allowSshAccessFrom(ec2.Peer.ipv4(''))
    // bastionHost.instance.instance.addPropertyOverride('KeyName', 'bastion-key-name')
    //
  }
}
