/* Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved. */
/* SPDX-License-Identifier: MIT-0 */

import { IStateProps } from "@demo/types";

import createStore from "./createStore";

interface FeedbackStoreProps {
	isSubmitting: boolean;
}

const initialState: IStateProps<FeedbackStoreProps> = {
	isSubmitting: false
};

export default createStore<FeedbackStoreProps>(initialState);
