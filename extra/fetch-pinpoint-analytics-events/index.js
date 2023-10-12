import { PinpointClient, GetEventStreamCommand } from "@aws-sdk/client-pinpoint";
import { fromCognitoIdentityPool } from "@aws-sdk/credential-providers";

const main = async () => {
	try {
		console.log(
			JSON.stringify({
				PINPOINT_IDENTITY_POOL_ID: process.env.PINPOINT_IDENTITY_POOL_ID,
				PINPOINT_APPLICATION_ID: process.env.PINPOINT_APPLICATION_ID
			})
		);
	} catch (error) {
		console.error("Error", { error });
		throw new Error(`Error: ${error}`);
	}
};

main();
