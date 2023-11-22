/* Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved. */
/* SPDX-License-Identifier: MIT-0 */

import { useMemo } from "react";

import { useFeedbackService } from "@demo/services";
import { useFeedbackStore } from "@demo/stores";
import { errorHandler } from "@demo/utils/errorHandler";

const useFeedback = () => {
	const store = useFeedbackStore();
	const { setState } = useFeedbackStore;
	const feedbackService = useFeedbackService();

	const methods = useMemo(
		() => ({
			setSubmittingState: (isSubmitting = true) => {
				setState({ isSubmitting });
			},
			submitFeedbackForm: async (category: string, rating: number, text: string, email?: string) => {
				try {
					setState({ isSubmitting: true });
					const data = await feedbackService.submitFeedback(category, rating, text, email);
					return data;
				} catch (error) {
					errorHandler(error, "failed to upload feedback");
				} finally {
					setState({ isSubmitting: false });
				}
			},
			setIsSubmitting: (isSubmitting: boolean) => {
				setState({ isSubmitting });
			}
		}),
		[feedbackService, setState]
	);
	return useMemo(() => ({ ...methods, ...store }), [methods, store]);
};

export default useFeedback;
