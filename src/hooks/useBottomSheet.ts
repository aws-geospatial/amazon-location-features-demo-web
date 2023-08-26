/* Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved. */
/* SPDX-License-Identifier: MIT-0 */

import { useMemo } from "react";

import { useBottomSheetStore } from "@demo/stores";
import { ResponsiveUIEnum } from "@demo/types/Enums";

const useBottomSheet = () => {
	const store = useBottomSheetStore();
	const { setState } = useBottomSheetStore;

	const methods = useMemo(
		() => ({
			setBottomSheetCurrentHeight: (bottomSheetCurrentHeight: number) => {
				setState({ bottomSheetCurrentHeight });
			},
			setBottomSheetHeight: (bottomSheetHeight: number) => {
				setState({ bottomSheetHeight });
			},
			setBottomSheetMinHeight: (bottomSheetMinHeight: number) => {
				setState({ bottomSheetMinHeight });
			},
			setPOICard: (POICard?: JSX.Element) => {
				setState({ POICard });
			},
			setUI: (ui: ResponsiveUIEnum) => {
				setState({ ui });
			}
		}),
		[setState]
	);
	return useMemo(() => ({ ...methods, ...store }), [methods, store]);
};

export default useBottomSheet;
