/* ***************************
  Task 3. GitOps Infrastructure (via ECS Fargate cluster)
  + ECR as container-image hosting
  + Fargate as serverless compute engine for containers
*/

import { Stack, StackProps } from 'aws-cdk-lib';
import { Construct } from 'constructs';
import * as cdk from 'aws-cdk-lib';

const ecs = cdk.aws_ecs;
const ec2 = cdk.aws_ec2;
const iam = cdk.aws_iam;
const ecsPatterns = cdk.aws_ecs_patterns;
const ecr = cdk.aws_ecr;

export class AwscdkStack_2 extends Stack {
  constructor(scope: Construct, id: string, props?: StackProps) {
    super(scope, id, props);

    const imageRepo = new cdk.CfnParameter(this, "imageRepo", {
      type: "String",
      description: "The repository where Docker container image of the app is stored."});
    
    // VPC with 2 availability zones
    const vpc = new ec2.Vpc(this, 'gitops-vpc', {maxAzs: 2});

    // Describe permissions of an IAM user for Fargate task definition
    const taskIamRole = new iam.Role(this, "gitops-approle", {
      roleName: "AppRole",
      assumedBy: new iam.ServicePrincipal('ecs-tasks.amazonaws.com'),
      managedPolicies: [iam.ManagedPolicy.fromAwsManagedPolicyName('AmazonEC2ContainerRegistryPowerUser')]
    });
    
    // Set IAM role to use for Fargate task definition
    const taskDefinition = new ecs.FargateTaskDefinition(this, 'Task', {
        taskRole: taskIamRole,
    });

    // Define user that will interact with ECR public gallery
    const ecrUser = new iam.User(this, 'gitops-ECRUser');
    ecr.PublicGalleryAuthorizationToken.grantRead(ecrUser);

    // Create an ECS cluster
    const cluster = new ecs.Cluster(this, 'gitops-cluster', {
      clusterName: 'gitops-cluster',
      containerInsights: true,
      vpc: vpc,
    });

    // Define public Docker repo where the app image is pulled from
    const image = ecs.ContainerImage.fromRegistry(imageRepo.valueAsString);
    
    // Describe container parameters
    taskDefinition.addContainer('gitops-2048app', {
      image: image,
      portMappings: [{ containerPort: 80 }],
      memoryReservationMiB: 256,
      cpu : 256
    });

    // Fargate Serverless Service
    // rollaback: true - rollbacks the deploy in case of an error
    new ecsPatterns.ApplicationLoadBalancedFargateService(this, "gitops-app", {
      cluster,
      circuitBreaker: {
        rollback: true,
      },
      taskDefinition: taskDefinition,
      desiredCount: 2,
      serviceName: 'gitops-web-app'
    });

  }
}