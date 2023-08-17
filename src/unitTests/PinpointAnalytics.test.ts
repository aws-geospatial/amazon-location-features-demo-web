/* eslint-disable @typescript-eslint/no-explicit-any */
import { CreateAppCommand, GetEndpointCommand, GetEventStreamCommand, PinpointClient } from "@aws-sdk/client-pinpoint";

import { fromCognitoIdentityPool } from "@aws-sdk/credential-providers";
import { appConfig } from "@demo/core/constants";
import { EventTypeEnum } from "@demo/types";
import { uuid } from "@demo/utils/uuid";

const {
	ENV: { PINPOINT_APPLICATION_ID, PINPOINT_IDENTITY_POOL_ID }
} = appConfig;

const region = PINPOINT_IDENTITY_POOL_ID.split(":")[0];

const { createOrUpdateEndpoint, record } = jest.requireActual("@demo/utils/analyticsUtils");

describe("PinpointAnalytics", () => {
	let pinClient: PinpointClient;

	const returnError = async (func: any) => {
		try {
			await func();
		} catch (error) {
			return error;
		}
	};

	beforeAll(async () => {
		const analyticsCreds = await fromCognitoIdentityPool({
			identityPoolId: PINPOINT_IDENTITY_POOL_ID,
			clientConfig: { region }
		})();

		pinClient = new PinpointClient({ credentials: analyticsCreds, region });
	});

	// Successful cases
	it("should successfully record events", async () => {
		const error = await returnError(
			async () => await record([{ EventType: EventTypeEnum.MAP_UNIT_CHANGE, Attributes: { type: "Automatic" } }])
		);
		expect(error).toBeUndefined();
	});

	it("should successfully create endpoint", async () => {
		const error = await returnError(createOrUpdateEndpoint);
		expect(error).toBeUndefined();
	});

	// Failure cases
	it("should throw permission error on getEndpoint request", async () => {
		const error: any = await returnError(async () => {
			const command = new GetEndpointCommand({
				ApplicationId: PINPOINT_APPLICATION_ID,
				EndpointId: uuid.randomUUID()
			});
			await pinClient.send(command);
		});
		expect(error.$metadata.httpStatusCode).toBe(403);
		expect(error.message).toContain("not authorized to perform: mobiletargeting:GetEndpoint");
	});

	it("should throw permission error on getEventStream request", async () => {
		const error: any = await returnError(async () => {
			const command = new GetEventStreamCommand({ ApplicationId: PINPOINT_APPLICATION_ID });
			await pinClient.send(command);
		});
		expect(error.$metadata.httpStatusCode).toBe(403);
		expect(error.message).toContain("not authorized to perform: mobiletargeting:GetEventStream");
	});

	it("should throw permission error on createApp request", async () => {
		const error: any = await returnError(async () => {
			const command = new CreateAppCommand({ CreateApplicationRequest: { Name: "Test Project" } });
			await pinClient.send(command);
		});
		expect(error.$metadata.httpStatusCode).toBe(403);
		expect(error.message).toContain("not authorized to perform: mobiletargeting:CreateApp");
	});
});
