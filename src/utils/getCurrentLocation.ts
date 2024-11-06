/* Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved. */
/* SPDX-License-Identifier: MIT-0 */

import { showToast } from "@demo/core/Toast";

import { appConfig } from "@demo/core/constants";
import i18n from "@demo/locales/i18n";
import { CurrentLocationDataType, ToastType, ViewPointType } from "@demo/types";
import { pick } from "ramda";

const {
	PERSIST_STORAGE_KEYS: { GEO_LOCATION_ALLOWED }
} = appConfig;

export const getCurrentLocation = (
	setCurrentLocation: (currentLocationData: CurrentLocationDataType) => void,
	setViewpoint: (viewpoint: ViewPointType) => void
): void => {
	if ("geolocation" in navigator) {
		navigator.geolocation.getCurrentPosition(
			currentLocation => {
				const {
					coords: { latitude, longitude }
				} = currentLocation;

				setCurrentLocation({ currentLocation: { latitude, longitude }, error: undefined });
				setViewpoint({ latitude, longitude });
				setTimeout(() => {
					window.location.reload();
				}, 0);
			},
			error => {
				const errorObj = {
					...pick(["code", "message", "PERMISSION_DENIED", "POSITION_UNAVAILABLE", "TIMEOUT"], error)
				};

				switch (errorObj.code) {
					case 1:
						errorObj.message = i18n.t("show_toast__lpd.text");
						break;
					case 2:
						errorObj.message = i18n.t("show_toast__lpu.text");
						break;
					case 3:
						errorObj.message = i18n.t("show_toast__cl__error_3.text");
						break;
					default:
						errorObj.message = i18n.t("show_toast__lpd.text");
				}

				localStorage.setItem(GEO_LOCATION_ALLOWED, "no");
				setCurrentLocation({ currentLocation: undefined, error: errorObj });
				showToast({ content: errorObj.message, type: ToastType.ERROR });
			},
			{
				maximumAge: 0,
				enableHighAccuracy: true
			}
		);
	} else {
		const errorObj = {
			PERMISSION_DENIED: 1 as number,
			POSITION_UNAVAILABLE: 2,
			TIMEOUT: 3,
			code: 1,
			message: i18n.t("show_toast__cl__error_5.text")
		} as GeolocationPositionError;

		setCurrentLocation({ currentLocation: undefined, error: errorObj });
		showToast({ content: errorObj.message, type: ToastType.ERROR });
	}
};
