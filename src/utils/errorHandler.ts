/* Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved. */
/* SPDX-License-Identifier: MIT-0 */

import { showToast } from "@demo/core/Toast";

import appConfig from "@demo/core/constants/appConfig";
import { ToastType } from "@demo/types";

const {
	GLOBAL_CONSTANTS: { LOCAL_STORAGE_PREFIX },
	PERSIST_STORAGE_KEYS: { AMPLIFY_AUTH_DATA },
	ROUTES: { ERROR_BOUNDARY }
} = appConfig;
const authLocalStorageKey = `${LOCAL_STORAGE_PREFIX}${AMPLIFY_AUTH_DATA}`;
const errors = {
	excluded: ["Too Many Requests"],
	missingCreds: "Missing credentials in config",
	codes: [403, 404]
};
let isStackCorrupted = false;

/* eslint-disable  @typescript-eslint/no-explicit-any */
export const errorHandler = (error: any, message?: string) => {
	console.error("ERROR_HANDLER", JSON.stringify(error), message);
	const str = localStorage.getItem(authLocalStorageKey) as string;
	const authLocalStorageObj = JSON.parse(str);

	if (
		!isStackCorrupted &&
		authLocalStorageObj.state.isUserAwsAccountConnected &&
		(errors.codes.includes(error.status) || errors.codes.includes(error.statusCode))
	) {
		isStackCorrupted = true;
		showToast({ content: "Stack is corrupted, switching back to default stack", type: ToastType.ERROR });
		setTimeout(() => {
			localStorage.clear();
			window.location.reload();
		}, 3000);
		return;
	}

	if (errors.codes.includes(error.statusCode || error.status)) {
		window.location.replace(ERROR_BOUNDARY);
		showToast({ content: "Something went wrong!", type: ToastType.ERROR });
		return;
	}

	if (error instanceof Error) {
		const { message: apiErrorMsg } = error;

		if (!errors.excluded.includes(apiErrorMsg)) {
			if (apiErrorMsg.includes(errors.missingCreds)) {
				window.location.reload();
				return;
			}

			if (message) {
				showToast({ content: `${message}, ${apiErrorMsg}`, type: ToastType.ERROR });
				return;
			}
		}
	}
};
