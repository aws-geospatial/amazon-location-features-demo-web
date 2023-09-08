/* Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved. */
/* SPDX-License-Identifier: MIT-0 */

import { formatDuration, intervalToDuration } from "date-fns";
import { ar, de, enUS, es, fr, he, hi, it, ja, ko, pt, zhCN, zhTW } from "date-fns/locale";
import { TFunction } from "i18next";
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

export const humanReadableTime = (ms: number, lang: string, t: TFunction, isShortFormat = false) => {
	const duration = intervalToDuration({ start: 0, end: ms });

	if ([duration.days, duration.hours, duration.minutes].every(v => v === 0)) {
		return t("popup__place_time.text");
	} else {
		const duration = formatDuration(intervalToDuration({ start: 0, end: ms }), {
			format: ["days", "hours", "minutes"],
			locale: languages[lang as keyof typeof languages]
		});
		if (isShortFormat) return duration.replace("minutes", " min");

		return duration;
	}
};
