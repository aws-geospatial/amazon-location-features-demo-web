/* Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved. */
/* SPDX-License-Identifier: MIT-0 */

import { formatDuration, intervalToDuration } from "date-fns";

export const humanReadableTime = (ms: number) => {
	const duration = intervalToDuration({ start: 0, end: ms });

	if (duration.days === 0 && duration.hours === 0 && duration.minutes === 0) {
		return "Less than a minute";
	} else {
		return formatDuration(intervalToDuration({ start: 0, end: ms }), { format: ["days", "hours", "minutes"] });
	}
};
