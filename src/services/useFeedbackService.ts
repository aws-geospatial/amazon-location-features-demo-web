/* Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved. */
/* SPDX-License-Identifier: MIT-0 */

import { useMemo } from "react";

import { appConfig } from "@demo/core/constants";
import { useTranslation } from "react-i18next";

const {
	ENV: { NL_BASE_URL, NL_API_KEY }
} = appConfig;

const useFeedbackService = () => {
	const { t } = useTranslation();
	return useMemo(
		() => ({
			submitFeedback: async (category: string, rating: number, text: string, email?: string) => {
				const response = await fetch(`${NL_BASE_URL}/feedback/submit?`, {
					method: "POST",
					headers: {
						"x-api-key": NL_API_KEY
					},
					body: JSON.stringify({
						category: category,
						rating: rating,
						feedbackText: text,
						email: email
					})
				});
				if (!response.ok) {
					throw new Error((t("error_handler__failed_feedback_text_2.text") as string) + response.status);
				}
				return response.ok;
			}
		}),
		[t]
	);
};

export default useFeedbackService;
