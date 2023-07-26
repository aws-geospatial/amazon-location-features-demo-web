import { Amplify, Auth } from "aws-amplify";
import AWS from "aws-sdk";
import * as dotenv from "dotenv";
import * as R from "ramda";

import { policies } from "./constants/index.js";

dotenv.config();

const identityPoolId = process.env.VITE_AWS_COGNITO_IDENTITY_POOL_ID_TEST;
const region = process.env.VITE_AWS_REGION_TEST;
const userPoolId = process.env.VITE_AWS_USER_POOL_ID_TEST;
const userPoolWebClientId = process.env.VITE_AWS_USER_POOL_WEB_CLIENT_ID_TEST;
const username = process.env.VITE_AWS_COGNITO_USERNAME_TEST;
const password = process.env.VITE_AWS_COGNITO_PASSWORD_TEST;
const authRoleName = process.env.VITE_AWS_IAM_AUTH_ROLE_NAME_TEST;
const unauthRoleName = process.env.VITE_AWS_IAM_UNAUTH_ROLE_NAME_TEST;

Amplify.configure({
	Auth: {
		identityPoolId,
		region,
		userPoolId,
		userPoolWebClientId
	}
});

const fetchCredentials = async () => await Auth.currentUserCredentials();

const signIn = async () => await Auth.signIn(username, password);

const completeNewPassword = async (user, newPassword) => await Auth.completeNewPassword(user, newPassword);

const listRolePolicies = async (iamClient, roleName) =>
	await iamClient.listRolePolicies({ RoleName: roleName }).promise();

const getRolePolicy = async (iamClient, policyName, roleName) =>
	await iamClient.getRolePolicy({ PolicyName: policyName, RoleName: roleName }).promise();

const main = async () => {
	try {
		const user = await signIn();

		if (user.challengeName === "NEW_PASSWORD_REQUIRED") {
			await completeNewPassword(user, password);
		}

		const credentialsAuth = await fetchCredentials();
		const iamClientAuth = new AWS.IAM({
			credentials: credentialsAuth,
			region,
			signatureCache: false
		});

		// List authenticated role policies
		console.log("----------------------------------------");
		console.log("Testing authenticated permissions...");
		const listRolePoliciesResAuth = await listRolePolicies(iamClientAuth, authRoleName);
		const getRolePolicyResAuth = await getRolePolicy(
			iamClientAuth,
			listRolePoliciesResAuth.PolicyNames[0],
			authRoleName
		);
		const policyDocumentAuth = JSON.parse(decodeURIComponent(getRolePolicyResAuth.PolicyDocument));

		if (
			R.equals(policyDocumentAuth.Statement[0].Action, policies.AUTH.Statement[0].Action) &&
			R.equals(policyDocumentAuth.Statement[1].Action, policies.AUTH.Statement[1].Action)
		) {
			console.log("%c \u2714 Auth Policy document matched", "color: green; font-size: 16px;");
		} else {
			console.log("%c \u2716 Auth Policy document does not match", "color: red; font-size: 16px;");
			throw new Error("Auth Policy document does not match");
		}

		// List unauthenticated role policies
		console.log("Testing unauthenticated permissions...");
		const listRolePoliciesResUnauth = await listRolePolicies(iamClientAuth, unauthRoleName);
		const getRolePolicyResUnauth = await getRolePolicy(
			iamClientAuth,
			listRolePoliciesResUnauth.PolicyNames[0],
			unauthRoleName
		);
		const policyDocumentUnauth = JSON.parse(decodeURIComponent(getRolePolicyResUnauth.PolicyDocument));

		if (R.equals(policyDocumentUnauth.Statement[0].Action, policies.UNAUTH.Statement[0].Action)) {
			console.log("%c \u2714 Unauth Policy document matched", "color: green; font-size: 16px;");
		} else {
			console.log("%c \u2716 Unauth Policy document does not match", "color: red; font-size: 16px;");
			throw new Error("Unauth Policy document does not match");
		}
	} catch (error) {
		console.error("ERROR", error);
	} finally {
		console.log("----------------------------------------");
	}
};

main();
