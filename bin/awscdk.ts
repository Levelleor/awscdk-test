#!/usr/bin/env node
import 'source-map-support/register';
import * as cdk from 'aws-cdk-lib';
import { AwscdkStack } from '../lib/awscdk-stack';

const app = new cdk.App();

new AwscdkStack(app, 'AwscdkStack', {});