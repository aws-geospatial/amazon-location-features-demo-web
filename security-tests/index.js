import { CognitoIdentityClient } from "@aws-sdk/client-cognito-identity";
import { GetRolePolicyCommand, IAMClient, ListRolePoliciesCommand } from "@aws-sdk/client-iam";
import { fromCognitoIdentityPool } from "@aws-sdk/credential-providers";
import { Amplify, Auth } from "aws-amplify";
import * as dotenv from "dotenv";
import * as R from "ramda";

import { policies } from "./constants/index.js";

dotenv.config();

const identityPoolId = process.env.IDENTITY_POOL_ID;
const userPoolId = process.env.USER_POOL_ID;
const userPoolClientId = process.env.USER_POOL_CLIENT_ID;
const username = process.env.COGNITO_EMAIL;
const password = process.env.COGNITO_PASSWORD;
const authRoleName = process.env.IAM_AUTH_ROLE_NAME;
const unauthRoleName = process.env.IAM_UNAUTH_ROLE_NAME;
const region = identityPoolId.split(":")[0];

Amplify.configure({
	Auth: {
		identityPoolId,
		region,
		userPoolId,
		userPoolWebClientId: userPoolClientId
	}
});

const completeNewPassword = async (user, newPassword) => await Auth.completeNewPassword(user, newPassword);

const listRolePolicies = async (iamClient, roleName) => {
	const command = new ListRolePoliciesCommand({ RoleName: roleName });
	const response = await iamClient.send(command);
	return response;
};

const getRolePolicy = async (iamClient, policyName, roleName) => {
	const command = new GetRolePolicyCommand({ PolicyName: policyName, RoleName: roleName });
	const response = await iamClient.send(command);
	return response;
};

const main = async () => {
	try {
		const user = await Auth.signIn(username, password);

		if (user.challengeName === "NEW_PASSWORD_REQUIRED") {
			await completeNewPassword(user, password);
		}

		const session = await Auth.currentSession();
		const idToken = session.getIdToken().getJwtToken();
		const cognitoIdentityClient = new CognitoIdentityClient({ region });
		const awsAuthCredentials = await fromCognitoIdentityPool({
			client: cognitoIdentityClient,
			identityPoolId,
			logins: {
				[`cognito-idp.${region}.amazonaws.com/${userPoolId}`]: idToken
			}
		})();
		const iamClient = new IAMClient({
			credentials: awsAuthCredentials,
			region,
			signatureCache: false
		});

		// List authenticated role policies
		console.log("----------------------------------------");
		console.log("Testing authenticated permissions...");
		const listRolePoliciesResAuth = await listRolePolicies(iamClient, authRoleName);
		const getRolePolicyResAuth = await getRolePolicy(iamClient, listRolePoliciesResAuth.PolicyNames[0], authRoleName);
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
		const listRolePoliciesResUnauth = await listRolePolicies(iamClient, unauthRoleName);
		const getRolePolicyResUnauth = await getRolePolicy(
			iamClient,
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
		throw new Error(`Error: ${error}`);
	} finally {
		console.log("----------------------------------------");
	}
};

main();
