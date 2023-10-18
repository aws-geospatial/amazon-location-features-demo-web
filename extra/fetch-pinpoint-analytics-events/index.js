import { GetEndpointCommand, PinpointClient } from "@aws-sdk/client-pinpoint";
import { fromCognitoIdentityPool } from "@aws-sdk/credential-providers";

const main = async () => {
	try {
		const pinpointIdentityPoolId = process.env.PINPOINT_IDENTITY_POOL_ID;
		const pinpointApplicationId = process.env.PINPOINT_APPLICATION_ID;
		const analyticsEndpointId = process.env.ANALYTICS_ENDPOINT_ID;
		const region = pinpointIdentityPoolId.split(":")[0];
		console.log({ pinpointIdentityPoolId, pinpointApplicationId, analyticsEndpointId, region });

		const credentials = await fromCognitoIdentityPool({
			identityPoolId: pinpointIdentityPoolId,
			clientConfig: { region }
		})();
		const pinpointClient = new PinpointClient({ credentials, region });
		const getEndpointCommand = new GetEndpointCommand({
			ApplicationId: pinpointApplicationId,
			EndpointId: analyticsEndpointId
		});
		const response = await pinpointClient.send(getEndpointCommand);
		console.log(JSON.stringify(response));
	} catch (error) {
		console.error("Error", { error });
		throw new Error(`Error: ${error}`);
	}
};

main();
