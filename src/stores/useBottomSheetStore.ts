/* Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved. */
/* SPDX-License-Identifier: MIT-0 */

import { IStateProps } from "@demo/types";
import { ResponsiveUIEnum } from "@demo/types/Enums";

import createStore from "./createStore";

interface BottomSheetStoreProps {
	bottomSheetCurrentHeight?: number;
	bottomSheetMinHeight: number;
	bottomSheetHeight: number;
	POICard?: JSX.Element;
	ui?: ResponsiveUIEnum;
}

const initialState: IStateProps<BottomSheetStoreProps> = {
	bottomSheetMinHeight: 80,
	bottomSheetHeight: window.innerHeight
};

export default createStore<BottomSheetStoreProps>(initialState);
