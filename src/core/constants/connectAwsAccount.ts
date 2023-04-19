/* Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved. */
/* SPDX-License-Identifier: MIT-0 */

const connectAwsAccount = {
	TITLE: "Connect AWS Account",
	TITLE_DESC:
		"Connect your AWS account to enable Geofences and Trackers. This will ensure your tracking and geofencing data is only stored in your account. After you log in, all features of the Showcase App will run using resources you deploy in your AWS account. Log out if you wish to continue running the Showcase App using resources in AWS’s showcase app account.",
	HOW_TO: "How to connect:",
	STEP1: " to run a CloudFormation template to securely create required resources.",
	STEP1_DESC:
		"You can delete these resources through the stack deletion option or ‘Manage resources’ pages in the menu on the left.",
	STEP2: "Connect the showcase app with the recently created AWS resources by copying in input fields.",
	STEP2_DESC:
		"From your CloudFormation output section copy the corresponding named values as reflected in the right section form (IdentityPoolId etc.). ",
	STEP3: "Log in using the generated user credentials.",
	STEP3_DESC: "Now you should be able to use the tracking and geofencing features using data stored in your account.",
	AGREE: "By connecting I agree to the ",
	POST_CONNECT: "Your AWS account is now connected.",
	POST_CONNECT_DESC:
		"Please Sign in to access Tracking and Geofence features or continue to use other features as unauthenticated user."
};

export default connectAwsAccount;
