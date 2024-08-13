/* Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved. */
/* SPDX-License-Identifier: MIT-0 */

import { showToast } from "@demo/core/Toast";

import { appConfig } from "@demo/core/constants";
import i18n from "@demo/locales/i18n";
import { ToastType } from "@demo/types";

import { clearStorage } from "./localstorageUtils";

const {
	PERSIST_STORAGE_KEYS: { LOCAL_STORAGE_PREFIX, SHOULD_CLEAR_CREDENTIALS, AUTH_DATA },
	ROUTES: { ERROR_BOUNDARY, DEMO }
} = appConfig;
const authLocalStorageKey = `${LOCAL_STORAGE_PREFIX}${AUTH_DATA}`;
const errors = {
	excluded: ["Too Many Requests"],
	missingCreds: "Missing credentials in config",
	codes: [403, 404],
	exceptions: ["ExpiredTokenException"]
};
let isStackCorrupted = false;

/* eslint-disable  @typescript-eslint/no-explicit-any */
export const errorHandler = (error: any, message?: string) => {
	console.error("ERROR_HANDLER", JSON.stringify(error), "message:", message || "");
	const authLocalStorageKeyString = localStorage.getItem(authLocalStorageKey) as string;
	const authLocalStorageObj = JSON.parse(authLocalStorageKeyString);
	const isUserAwsAccountConnected = authLocalStorageObj.state.isUserAwsAccountConnected;
	const authTokens = authLocalStorageObj.state.authTokens;

	if (
		!!authTokens &&
		errors.codes.includes(error.statusCode || error.status) &&
		errors.exceptions.includes(error.code)
	) {
		showToast({ content: i18n.t("show_toast__refreshing_session.text"), type: ToastType.INFO });
		setTimeout(() => {
			localStorage.setItem(SHOULD_CLEAR_CREDENTIALS, "true");
			window.location.reload();
		}, 2000);
		return;
	} else {
		if (!isStackCorrupted && errors.codes.includes(error.statusCode || error.status)) {
			if (isUserAwsAccountConnected) {
				isStackCorrupted = true;
				showToast({ content: i18n.t("show_toast__stack_is_corrupted.text"), type: ToastType.ERROR });
				setTimeout(() => {
					clearStorage();
					window.location.reload();
				}, 2000);
				return;
			} else {
				if (error.url.includes("https://maps.geo")) {
					isStackCorrupted = true;
					showToast({ content: i18n.t("show_toast__refreshing_session.text"), type: ToastType.INFO });
					setTimeout(() => {
						localStorage.setItem(SHOULD_CLEAR_CREDENTIALS, "true");
						window.location.reload();
					}, 2000);
					return;
				} else {
					window.location.replace(`${ERROR_BOUNDARY}?from=${DEMO}`);
					showToast({ content: i18n.t("show_toast__something_went_wrong.text"), type: ToastType.ERROR });
					return;
				}
			}
		}
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
