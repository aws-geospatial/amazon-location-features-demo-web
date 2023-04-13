/* Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved. */
/* SPDX-License-Identifier: MIT-0 */

import { userAgent } from "@demo/core/constants";

const androidCheck = /(android)/i.test(navigator.userAgent);
const iosCheck =
	["iPad Simulator", "iPhone Simulator", "iPod Simulator", "iPad", "iPhone", "iPod"].includes(navigator.platform) ||
	/* iPad on iOS 13 detection */
	(navigator.userAgent.includes("Mac") && "ontouchend" in document);

function isUserDeviceIsIOS() {
	return iosCheck && androidCheck === false ? userAgent.IOS : undefined;
}
function isUserDeviceIsAndroid(): string | undefined {
	return androidCheck && iosCheck === false ? userAgent.Android : undefined;
}

export { isUserDeviceIsIOS, isUserDeviceIsAndroid };
