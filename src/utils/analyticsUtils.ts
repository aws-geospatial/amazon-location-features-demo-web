/* Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved. */
/* SPDX-License-Identifier: MIT-0 */

import { appConfig } from "@demo/core/constants";
import { AnalyticsSessionStatus, EventTypeEnum } from "@demo/types/Enums";
import RecordInput from "@demo/types/RecordInput";

import { debounce } from "./debounce";
import sleep from "./sleep";
import { uuid } from "./uuid";

const {
	PERSIST_STORAGE_KEYS: { LOCAL_STORAGE_PREFIX, AUTH_DATA, ANALYTICS_ENDPOINT_ID, PAGE_VIEW_IDENTIFIERS }
} = appConfig;

const amplifyAuthDataLocalStorageKey = `${LOCAL_STORAGE_PREFIX}${AUTH_DATA}`;
const endpointIdKey = `${LOCAL_STORAGE_PREFIX}${ANALYTICS_ENDPOINT_ID}`;
const pageViewIdentifiersKey = `${LOCAL_STORAGE_PREFIX}${PAGE_VIEW_IDENTIFIERS}`;

let endpointId = localStorage.getItem(endpointIdKey);

if (!endpointId) {
	endpointId = uuid.randomUUID();
	localStorage.setItem(endpointIdKey, endpointId);
}

const authLocalStorageKeyString = localStorage.getItem(amplifyAuthDataLocalStorageKey) as string;
const credentials = JSON.parse(authLocalStorageKeyString || "{}")?.state?.credentials;
let userId = `${credentials?.authenticated ? credentials.identityId : `AnonymousUser:${endpointId}`}`;

let session: {
	id?: string;
	startTimestamp?: string;
	creationStatus: AnalyticsSessionStatus;
} = { creationStatus: AnalyticsSessionStatus.NOT_CREATED };

export const record: (input: RecordInput[], excludeAttributes?: string[]) => Promise<void> = async (
	input,
	excludeAttributes = []
) => {
	const { [location.pathname.replace(/\//g, "_")]: pageViewIdentifier } = JSON.parse(
		localStorage.getItem(pageViewIdentifiersKey) || "{}"
	);

	const eventTypes = input.map(x => x.EventType);
	const hasSessionStartEvent = eventTypes.includes(EventTypeEnum.SESSION_START);
	const sessionStopEvent = input.find(x => x.EventType === EventTypeEnum.SESSION_STOP);

	if (!hasSessionStartEvent && !sessionStopEvent) {
		while (session.creationStatus !== AnalyticsSessionStatus.CREATED) {
			if (session.creationStatus === AnalyticsSessionStatus.NOT_CREATED) {
				await startSession();
			} else {
				// sleep in both NOT_CREATED and IN_PROGRESS case (wait until the session event is created)
				await sleep(2000);
			}
		}
	}

	const authLocalStorageKeyString = localStorage.getItem(amplifyAuthDataLocalStorageKey) as string;
	const authLocalStorage = JSON.parse(authLocalStorageKeyString || "{}");
	const { credentials } = authLocalStorage?.state || {};

	const _userId = `${credentials?.authenticated ? credentials.identityId : `AnonymousUser:${endpointId}`}`;

	// incase user id has changed, update endpoint
	if (userId !== _userId) {
		userId = _userId;
	}

	if (!pageViewIdentifier) {
		excludeAttributes.push("pageViewIdentifier");
	} else if (!pageViewIdentifier.split("__")[1]) {
		// reload to regenerate this identifier if it's corrupt (edge case)
		window.location.reload();
	}

	if (sessionStopEvent) {
		// adding a separate session end event because aws pinpoint does not show "_session.stop" event on dashboard, neither stream it.
		input.push({
			...sessionStopEvent,
			EventType: EventTypeEnum.SESSION_END
		});
	}
};

const handleClick = () => {
	// create session whenever user becomes active
	if (session.creationStatus === AnalyticsSessionStatus.NOT_CREATED) {
		startSession();
	} else {
		stopSessionIn30Minutes();
	}
};

const startSession = async () => {
	session.creationStatus = AnalyticsSessionStatus.IN_PROGRESS;
	session.id = uuid.randomUUID();
	await record([{ EventType: EventTypeEnum.SESSION_START, Attributes: {} }], ["pageViewIdentifier"]);
	stopSessionIn30Minutes();
	removeEventListener("mousedown", handleClick);
	addEventListener("mousedown", handleClick);
	session.creationStatus = AnalyticsSessionStatus.CREATED;
};

const stopSession = async () => {
	await record(
		[
			{
				EventType: EventTypeEnum.SESSION_STOP,
				Attributes: {}
			}
		],
		["pageViewIdentifier"]
	);
	session = { creationStatus: AnalyticsSessionStatus.NOT_CREATED };
};

const stopSessionIn30Minutes = debounce(stopSession, 1000 * 60 * 30);
