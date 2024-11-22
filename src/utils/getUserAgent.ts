/* Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved. */
/* SPDX-License-Identifier: MIT-0 */

import { UserAgentEnum } from "@demo/types";

const { IOS, ANDROID } = UserAgentEnum;

const androidCheck = /(android)/i.test(navigator.userAgent);
const iosCheck =
	["iPad Simulator", "iPhone Simulator", "iPod Simulator", "iPad", "iPhone", "iPod"].includes(navigator.platform) ||
	/* iPad on iOS 13 detection */
	(navigator.userAgent.includes("Mac") && "ontouchend" in document);

const isUserDeviceIsIOS = () => {
	return iosCheck && androidCheck === false ? IOS : undefined;
};

const isUserDeviceIsAndroid = () => {
	return androidCheck && iosCheck === false ? ANDROID : undefined;
};

const isUserDeviceIsWin = (): boolean => {
	const userAgentData = (navigator as Navigator & { userAgentData?: { platform: string } }).userAgentData;

	if (userAgentData) {
		return userAgentData.platform.includes("Win");
	}

	return /Windows/.test(navigator.userAgent);
};

export { isUserDeviceIsIOS, isUserDeviceIsAndroid, isUserDeviceIsWin };
