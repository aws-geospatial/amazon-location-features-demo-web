/* Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved. */
/* SPDX-License-Identifier: MIT-0 */

import { appConfig } from "@demo/core/constants";

import sleep from "./sleep";

let failCount = 0;
let countryCode = "";

const {
	ENV: { COUNTRY_EVALUATION_URL }
} = appConfig;

export const getCountryCode: () => Promise<string | undefined> = async () => {
	try {
		if (countryCode) {
			return countryCode === "Unknown" ? undefined : countryCode;
		}

		const response = await fetch(COUNTRY_EVALUATION_URL);
		const country = response.headers.get("x-country");
		countryCode = country || "Unknown";

		failCount = 0;

		if (country === "Unknown") {
			return;
		} else {
			return country!;
		}
	} catch (error) {
		failCount++;
		console.error("error: ", error);

		// try three times before failing
		if (failCount === 3) {
			throw error;
		} else {
			sleep(1000);
			return await getCountryCode();
		}
	}
};
