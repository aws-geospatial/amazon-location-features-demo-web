/* eslint-disable @typescript-eslint/no-explicit-any */
import {
	CreateAppCommand,
	DeleteAppCommand,
	DeleteEndpointCommand,
	DeleteEventStreamCommand,
	DeleteUserEndpointsCommand,
	GetAppCommand,
	GetApplicationSettingsCommand,
	GetAppsCommand,
	GetEventStreamCommand,
	GetUserEndpointsCommand,
	PinpointClient,
	RemoveAttributesCommand,
	UpdateApplicationSettingsCommand
} from "@aws-sdk/client-pinpoint";

import { fromCognitoIdentityPool } from "@aws-sdk/credential-providers";
import { appConfig } from "@demo/core/constants";
import { EventTypeEnum } from "@demo/types";
import { uuid } from "@demo/utils/uuid";

const {
	ENV: { PINPOINT_APPLICATION_ID, PINPOINT_IDENTITY_POOL_ID }
} = appConfig;

const region = PINPOINT_IDENTITY_POOL_ID.split(":")[0];

const { createOrUpdateEndpoint, getEndpoint, record } = vi.importActual("@demo/utils/analyticsUtils");

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
	it.skip("should successfully record events", async () => {
		const error = await returnError(
			async () => await record([{ EventType: EventTypeEnum.MAP_UNIT_CHANGE, Attributes: { type: "Automatic" } }])
		);
		expect(error).toBeUndefined();
	});

	it.skip("should successfully create endpoint", async () => {
		const error = await returnError(createOrUpdateEndpoint);
		expect(error).toBeUndefined();
	});

	it.skip("should successfully get endpoint", async () => {
		const error = await returnError(getEndpoint);
		expect(error).toBeUndefined();
	});

	// Failure cases
	it.skip("should throw permission error on deleteEndpoint request", async () => {
		const error: any = await returnError(async () => {
			const command = new DeleteEndpointCommand({
				ApplicationId: PINPOINT_APPLICATION_ID,
				EndpointId: uuid.randomUUID()
			});
			await pinClient.send(command);
		});
		expect(error.$metadata.httpStatusCode).toBe(403);
		expect(error.message).toContain("not authorized to perform: mobiletargeting:DeleteEndpoint");
	});

	it.skip("should throw permission error on removeAttributes request", async () => {
		const error: any = await returnError(async () => {
			const command = new RemoveAttributesCommand({
				ApplicationId: PINPOINT_APPLICATION_ID,
				AttributeType: "STRING_VALUE",
				UpdateAttributesRequest: {
					Blacklist: ["STRING_VALUE"]
				}
			});
			await pinClient.send(command);
		});
		expect(error.$metadata.httpStatusCode).toBe(403);
		expect(error.message).toContain("not authorized to perform: mobiletargeting:RemoveAttributes");
	});

	it.skip("should throw permission error on deleteEventStream request", async () => {
		const error: any = await returnError(async () => {
			const command = new DeleteEventStreamCommand({ ApplicationId: PINPOINT_APPLICATION_ID });
			await pinClient.send(command);
		});
		expect(error.$metadata.httpStatusCode).toBe(403);
		expect(error.message).toContain("not authorized to perform: mobiletargeting:DeleteEventStream");
	});

	it.skip("should throw permission error on getEventStream request", async () => {
		const error: any = await returnError(async () => {
			const command = new GetEventStreamCommand({ ApplicationId: PINPOINT_APPLICATION_ID });
			await pinClient.send(command);
		});
		expect(error.$metadata.httpStatusCode).toBe(403);
		expect(error.message).toContain("not authorized to perform: mobiletargeting:GetEventStream");
	});

	it.skip("should throw permission error on createApp request", async () => {
		const error: any = await returnError(async () => {
			const command = new CreateAppCommand({ CreateApplicationRequest: { Name: "Test Project" } });
			await pinClient.send(command);
		});
		expect(error.$metadata.httpStatusCode).toBe(403);
		expect(error.message).toContain("not authorized to perform: mobiletargeting:CreateApp");
	});

	it.skip("should throw permission error on deleteApp request", async () => {
		const error: any = await returnError(async () => {
			const command = new DeleteAppCommand({ ApplicationId: PINPOINT_APPLICATION_ID });
			await pinClient.send(command);
		});
		expect(error.$metadata.httpStatusCode).toBe(403);
		expect(error.message).toContain("not authorized to perform: mobiletargeting:DeleteApp");
	});

	it.skip("should throw permission error on getApp request", async () => {
		const error: any = await returnError(async () => {
			const command = new GetAppCommand({ ApplicationId: PINPOINT_APPLICATION_ID });
			await pinClient.send(command);
		});
		expect(error.$metadata.httpStatusCode).toBe(403);
		expect(error.message).toContain("not authorized to perform: mobiletargeting:GetApp");
	});

	it.skip("should throw permission error on getApps request", async () => {
		const error: any = await returnError(async () => {
			const command = new GetAppsCommand({});
			await pinClient.send(command);
		});
		expect(error.$metadata.httpStatusCode).toBe(403);
		expect(error.message).toContain("not authorized to perform: mobiletargeting:GetApps");
	});

	it.skip("should throw permission error on getApplicationSettings request", async () => {
		const error: any = await returnError(async () => {
			const command = new GetApplicationSettingsCommand({ ApplicationId: PINPOINT_APPLICATION_ID });
			await pinClient.send(command);
		});
		expect(error.$metadata.httpStatusCode).toBe(403);
		expect(error.message).toContain("not authorized to perform: mobiletargeting:GetApplicationSettings");
	});

	it.skip("should throw permission error on updateApplicationSettings request", async () => {
		const error: any = await returnError(async () => {
			const command = new UpdateApplicationSettingsCommand({
				ApplicationId: PINPOINT_APPLICATION_ID,
				WriteApplicationSettingsRequest: {}
			});
			await pinClient.send(command);
		});
		expect(error.$metadata.httpStatusCode).toBe(403);
		expect(error.message).toContain("not authorized to perform: mobiletargeting:UpdateApplicationSettings");
	});

	it.skip("should throw permission error on deleteUserEndpoints request", async () => {
		const error: any = await returnError(async () => {
			const command = new DeleteUserEndpointsCommand({
				ApplicationId: PINPOINT_APPLICATION_ID,
				UserId: uuid.randomUUID()
			});
			await pinClient.send(command);
		});
		expect(error.$metadata.httpStatusCode).toBe(403);
		expect(error.message).toContain("not authorized to perform: mobiletargeting:DeleteUserEndpoints");
	});

	it.skip("should throw permission error on getUserEndpoints request", async () => {
		const error: any = await returnError(async () => {
			const command = new GetUserEndpointsCommand({
				ApplicationId: PINPOINT_APPLICATION_ID,
				UserId: uuid.randomUUID()
			});
			await pinClient.send(command);
		});
		expect(error.$metadata.httpStatusCode).toBe(403);
		expect(error.message).toContain("not authorized to perform: mobiletargeting:GetUserEndpoints");
	});
});
