/* Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved. */
/* SPDX-License-Identifier: MIT-0 */

import { showToast } from "@demo/core";

import appConfig from "@demo/core/constants/appConfig";
import { CurrentLocationDataType, ToastType } from "@demo/types";
import * as R from "ramda";

const {
	PERSIST_STORAGE_KEYS: { GEO_LOCATION_ALLOWED }
} = appConfig;

export const getCurrentLocation = (
	setCurrentLocation: (currentLocationData: CurrentLocationDataType) => void
): void => {
	if ("geolocation" in navigator) {
		navigator.geolocation.getCurrentPosition(
			currentLocation => {
				const {
					coords: { latitude, longitude }
				} = currentLocation;
				// setCurrentLocation({ currentLocation, error: undefined });
				setCurrentLocation({ currentLocation: { latitude, longitude }, error: undefined });
				setTimeout(() => {
					window.location.reload();
				}, 0);
			},
			error => {
				const errorObj = {
					...R.pick(["code", "message", "PERMISSION_DENIED", "POSITION_UNAVAILABLE", "TIMEOUT"], error)
				};

				switch (errorObj.code) {
					case 1:
						errorObj.message = "Location permission denied, please enable browser location and refresh the page";
						break;
					case 2:
						errorObj.message = "Location permission unavailable, please try again";
						break;
					case 3:
						errorObj.message = "Location timeout, please try again";
						break;
					default:
						errorObj.message = "Location permission denied, please enable browser location and refresh the page";
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
			PERMISSION_DENIED: 1,
			POSITION_UNAVAILABLE: 2,
			TIMEOUT: 3,
			code: 1,
			message: "Please check that your location services are enabled on your phone."
		};

		setCurrentLocation({ currentLocation: undefined, error: errorObj });
		showToast({ content: errorObj.message, type: ToastType.ERROR });
	}
};
