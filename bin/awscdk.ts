#!/usr/bin/env node
import 'source-map-support/register';
import * as cdk from 'aws-cdk-lib';
import { AwscdkStack } from '../lib/awscdk-stack-0';
import { AwscdkStack_1 } from '../lib/awscdk-stack-1';
import { AwscdkStack_2 } from '../lib/awscdk-stack-2';

const app = new cdk.App();

new AwscdkStack(app, 'EC2', {});
new AwscdkStack_1(app, 'Container', {});
new AwscdkStack_2(app, 'GitOps-ecs', {});