/* Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved. */
/* SPDX-License-Identifier: MIT-0 */

import { formatDuration, intervalToDuration } from "date-fns";
import { ar, de, enUS, es, fr, he, hi, it, ja, ko, pt, zhCN, zhTW } from "date-fns/locale";
const languages = {
	en: enUS,
	ar,
	de,
	es,
	fr,
	he,
	hi,
	it,
	ja,
	ko,
	"pt-BR": pt,
	"zh-CN": zhCN,
	"zh-TW": zhTW
};

export const humanReadableTime = (ms: number, lang: string) => {
	const duration = intervalToDuration({ start: 0, end: ms });

	if (duration.days === 0 && duration.hours === 0 && duration.minutes === 0) {
		return "Less than a minute";
	} else {
		return formatDuration(intervalToDuration({ start: 0, end: ms }), {
			format: ["days", "hours", "minutes"],
			locale: languages[lang as keyof typeof languages]
		});
	}
};
