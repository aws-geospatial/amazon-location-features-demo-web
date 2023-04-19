/* Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved. */
/* SPDX-License-Identifier: MIT-0 */

import {
	ConfirmDeletePolicy,
	ConfirmDeleteStack,
	ConnectSuccess,
	CreateStack1,
	CreateStack2,
	CreateStack34,
	DeleteFailed,
	DeleteStack,
	DisconnectAccount,
	EmptyConnectModal,
	FilledConnectModal,
	HostedUiLogin1,
	HostedUiLogin2,
	Login,
	SearchCloudFormation,
	SearchIotCore,
	SelectPolicy,
	SelectStack,
	StackOutputs,
	SuccessLogin
} from "@demo/assets";
import { HelpAccordionEnum } from "@demo/types";

export const helpData = [
	{
		title: HelpAccordionEnum.CREATE,
		description:
			"Running a CloudFormation template via your own AWS account to configure a stack which creates all the necessary resources.",
		content: [
			{
				text: "Open sidebar on showcase page and click on [click here] link to get redirected to AWS console.",
				image: EmptyConnectModal
			},
			{
				text: "Once redirected, if your AWS isn't logged in, you'll be asked to login.",
				image: Login
			},
			{
				text: "After login you'll be taken to CloudFormation create stack step and you'd notice that Amazon S3 URL field is prefilled. Click on Next.",
				image: CreateStack1
			},
			{
				text: "On the next step enter any email address in CognitoUserEmail field, you'll be sent a temporary password on this email, which will be later used to login into the applicatoin using Amazon Hosted UI. Click on Next.",
				image: CreateStack2
			},
			{
				text: "Do not modify any config on the next couple of steps and simply proceed by clicking Next, until you are presented with the Submit button, here accept the acknowledgement and press Submit.",
				image: CreateStack34
			},
			{
				text: "You'll see that the stack is now being created, depending on you internet speed this step can take from 5 to 10 minutes. Once the stack creation is completed, go to Outputs tab.",
				image: StackOutputs
			},
			{
				text: "Copy and paste all the values into the form. Make sure all values are copied correctly to ensure a successful connection. Click on Connect.",
				image: FilledConnectModal
			},
			{
				text: "If you encounter any error, make sure that all the values copied from step 6 are correct and try again, once succeeded, you'd notice a success state.",
				image: ConnectSuccess
			},
			{
				text: "You can now either continue to use Maps, Places and Routes funtionality or sign in to use Geofence and Tracking functionality. Use the email you entered in step 4 and enter the temporary password that you received on that email.",
				image: HostedUiLogin1
			},
			{
				text: "You'd be asked to updated your temporary password if you are using the credentials for the first time.",
				image: HostedUiLogin2
			},
			{
				text: "After you have successfully logged in, you'd notice in the sidebar that Geofence and Tracking functionality is now unlocked/enabled.",
				image: SuccessLogin
			}
		]
	},
	{
		title: HelpAccordionEnum.DELETE,
		description: "Deleting a CloudFormation stack successfully.",
		content: [
			{
				text: "Make sure you have signed out of the application.",
				image: SuccessLogin
			},
			{
				text: "After signing out, make sure to Disconnect AWS Account.",
				image: DisconnectAccount
			},
			{
				text: "Once disconnected, go to AWS Console and search for CloudFormation.",
				image: SearchCloudFormation
			},
			{
				text: "Select amazon-location-resource-setup stack.",
				image: SelectStack
			},
			{
				text: "After selecting the above mentioned stack, Click on Delete.",
				image: DeleteStack
			}
		]
	},
	{
		title: HelpAccordionEnum.TROUBLESHOOT,
		description:
			"Ways to resolve possible issues that could arise while deleting a stack. Such as corruption of stack.",
		content: [
			{
				text: "Sometimes the stack might fail to be deleted successfully.",
				image: DeleteFailed
			},
			{
				text: "In that case, search for IoT Core in the search box and open it.",
				image: SearchIotCore
			},
			{
				text: "In the left sidebar, select Policies under Security and select AmazonLocationIotPolicy and click on Delete.",
				image: SelectPolicy
			},
			{
				text: "Confirm delete by agreeing.",
				image: ConfirmDeletePolicy
			},
			{
				text: "Go back to CloudFormation service, select amazon-location-resource-setup stack and click on Delete.",
				image: DeleteFailed
			},
			{
				text: "A confirmation popup would appear asking if you'd like to retain resources, without checking anything, click on Delete stack, after a few minutes the stack should be deleted successfully.",
				image: ConfirmDeleteStack
			}
		]
	}
];
