/* Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved. */
/* SPDX-License-Identifier: MIT-0 */

const connectAwsAccountData = {
	TITLE: "Connect AWS Account",
	TITLE_DESC:
		"Connect your AWS account to enable Geofences and Trackers. This will ensure your tracking and geofencing data is only stored in your account. After you log in, all features of the Demo App will run using resources you deploy in your AWS account. Log out if you wish to continue running the Demo App using resources in AWS’s demo app account.",
	HOW_TO: "How to connect:",
	STEP1: " to run a CloudFormation template to securely create required resources.",
	STEP1_DESC:
		"You can delete these resources through the stack deletion option or ‘Manage resources’ pages in the menu on the left. Please note, Grab resources can only be created in ap-southeast-1 region.",
	STEP2: "Connect the demo app with the recently created AWS resources by copying in input fields.",
	STEP2_DESC:
		"From your CloudFormation output section copy the corresponding named values as reflected in the right section form (IdentityPoolId etc.). ",
	STEP3: "Log in using the generated user credentials.",
	STEP3_DESC: "Now you should be able to use the tracking and geofencing features using data stored in your account.",
	AGREE: "By connecting I agree to the ",
	POST_CONNECT: "Your AWS account is now connected.",
	POST_CONNECT_DESC:
		"Please Sign in to access Tracking and Geofence features or continue to use other features as unauthenticated user.",
	OPTIONS: [
		{ value: "us-east-1", label: "US East (N. Virginia) us-east-1" },
		{ value: "us-east-2", label: "US East (Ohio) us-east-2" },
		{ value: "us-west-2", label: "US West (Oregon) us-west-2" },
		// { value: "ap-south-1", label: "Asia Pacific (Mumbai) ap-south-1" },
		{ value: "ap-southeast-1", label: "Asia Pacific (Singapore) ap-southeast-1" },
		{ value: "ap-southeast-2", label: "Asia Pacific (Sydney) ap-southeast-2" },
		{ value: "ap-northeast-1", label: "Asia Pacific (Tokyo) ap-northeast-1" },
		{ value: "ca-central-1	", label: "anada (Central) ca-central-1" },
		{ value: "eu-central-1", label: "Europe (Frankfurt) eu-central-1" },
		{ value: "eu-west-1", label: "Europe (Ireland) eu-west-1" },
		{ value: "eu-west-2", label: "Europe (London) eu-west-2" },
		{ value: "eu-north-1", label: "Europe (Stockholm) eu-north-1" },
		{ value: "sa-east-1", label: "South America (São Paulo) sa-east-1" }
	]
};

export default connectAwsAccountData;
