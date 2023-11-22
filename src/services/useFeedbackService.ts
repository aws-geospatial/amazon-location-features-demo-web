/* Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved. */
/* SPDX-License-Identifier: MIT-0 */

import { useMemo } from "react";

import { appConfig } from "@demo/core/constants";

const {
	ENV: { NL_BASE_URL, NL_API_KEY }
} = appConfig;

const useFeedbackService = () => {
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
				return response;
			}
		}),
		[]
	);
};

export default useFeedbackService;
