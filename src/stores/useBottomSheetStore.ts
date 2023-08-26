/* Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved. */
/* SPDX-License-Identifier: MIT-0 */

import { IStateProps } from "@demo/types";

import createStore from "./createStore";

interface BottomSheetStoreProps {
	bottomSheetCurrentHeight?: number;
	bottomSheetMinHeight: number;
	bottomSheetHeight: number;
	showPOI: boolean;
}

const initialState: IStateProps<BottomSheetStoreProps> = {
	bottomSheetMinHeight: 80,
	bottomSheetHeight: window.innerHeight,
	showPOI: false
};

export default createStore<BottomSheetStoreProps>(initialState);
