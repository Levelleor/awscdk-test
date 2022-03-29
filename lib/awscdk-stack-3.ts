/* ***************************
  Task 3. GitOps Infrastructure (via Kubernetes Fargate cluster)
  + ECR as container-image hosting
  + Fargate as serverless compute engine for containers
*/

import { Stack, StackProps } from 'aws-cdk-lib';
import { Construct } from 'constructs';
import * as cdk from 'aws-cdk-lib';
import * as eks from 'aws-cdk-lib/aws-eks';
import * as ec2 from 'aws-cdk-lib/aws-ec2';
import * as iam from 'aws-cdk-lib/aws-iam';

export class AwscdkStack_2 extends Stack {
  public readonly cluster: eks.Cluster;

  constructor(scope: Construct, id: string, props?: StackProps) {
    super(scope, id, props);
    
    const clusterAdmin = iam.Role.fromRoleArn(this, "AdminRole", "arn:aws:iam::406719480672:role/UserEKSServiceRole");

    const vpc = new ec2.Vpc(this, "eks-vpc");
    const cluster = new eks.Cluster(this, "Cluster", {
      vpc: vpc,
      defaultCapacity: 0, // we want to manage capacity ourselves
      version: eks.KubernetesVersion.V1_18,
      mastersRole: clusterAdmin,
    });

    const ng = cluster.addNodegroupCapacity("nodegroup", {
      instanceTypes: [ new ec2.InstanceType("t3.medium") ],
      minSize: 1,
      maxSize: 3,
    });

  }
}