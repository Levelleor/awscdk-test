#!/usr/bin/env node
import 'source-map-support/register';
import * as cdk from 'aws-cdk-lib';
import { AwscdkStack } from '../lib/awscdk-stack';
import { AwscdkStack_1 } from '../lib/awscdk-stack-1';

const app = new cdk.App();

new AwscdkStack(app, 'EC2-based', {});
new AwscdkStack_1(app, 'Container-Related-Infrastructure', {});