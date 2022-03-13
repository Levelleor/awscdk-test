import { Stack, StackProps } from 'aws-cdk-lib';
import { Construct } from 'constructs';
import * as cdk from 'aws-cdk-lib';

/*
import * as ec2 from 'aws-cdk-lib/aws-ec2';
import * as autoscaling from 'aws-cdk-lib/aws-autoscaling';
import * as elbv2 from 'aws-cdk-lib/aws-elasticloadbalancingv2';
*/

const ec2 = cdk.aws_ec2;
const autoscaling = cdk.aws_autoscaling;
const elbv2 = cdk.aws_elasticloadbalancingv2;

export class AwscdkStack extends Stack {
  constructor(scope: Construct, id: string, props?: StackProps) {
    super(scope, id, props);

    // Create infrastructure resources
    // 

    // VPC with 2 availability zones
    const vpc = new ec2.Vpc(this, 'vpc', {maxAzs: 2});

    // Load balancer v2 routes traffic to AZs in VPC
    const alb = new elbv2.ApplicationLoadBalancer(this, 'alb', {
      vpc,
      internetFacing: true,
    });

    // Load balancer has a listener on port 80 publicly available
    const listener = alb.addListener('Listener', {
      port: 80,
      open: true,
    });

    // User data script sets up apache
    const userData = ec2.UserData.forLinux();
    userData.addCommands(
      'sudo su',
      'yum install -y httpd',
      'systemctl start httpd',
      'systemctl enable httpd',
      //'echo "<h1>Hello World from $(hostname -f)</h1>" > /var/www/html/index.html',
    );

    // Autoscaling group of T2 Micro instances of min 2 bootstraped
    const asg = new autoscaling.AutoScalingGroup(this, 'asg', {
      vpc,
      instanceType: ec2.InstanceType.of(
        ec2.InstanceClass.T2,
        ec2.InstanceSize.MICRO,
      ),
      machineImage: new ec2.AmazonLinuxImage({
        generation: ec2.AmazonLinuxGeneration.AMAZON_LINUX_2,
      }),
      userData,
      minCapacity: 2,
      maxCapacity: 4,
    });

    // Setup infrastructure resources
    //

    // Target for load balancer to direct traffic to
    listener.addTargets('default-target', {
      port: 80,
      targets: [asg],
      healthCheck: {
        path: '/',
        unhealthyThresholdCount: 2,
        healthyThresholdCount: 5,
        interval: cdk.Duration.seconds(30),
      },
    });

    // Additional static page with information
    listener.addAction('/static', {
      priority: 5,
      conditions: [elbv2.ListenerCondition.pathPatterns(['/static'])],
      action: elbv2.ListenerAction.fixedResponse(200, {
        contentType: 'text/html',
        messageBody: '<h1>1. EC2 Based AWS CDK Load Balancing task</h1>',
      }),
    });

    // Add scaling policy for the Auto Scaling Group
    asg.scaleOnRequestCount('requests-per-minute', {
      targetRequestsPerMinute: 60,
    });

    // Add scaling policy for the Auto Scaling Group
    asg.scaleOnCpuUtilization('cpu-util-scaling', {
      targetUtilizationPercent: 75,
    });

    // Log ALB DNS as an Output in console
    new cdk.CfnOutput(this, 'albDNS', {
      value: alb.loadBalancerDnsName,
    });
  }
}