/* Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved. */
/* SPDX-License-Identifier: MIT-0 */

import React from "react";

import { Flex, Text } from "@aws-amplify/ui-react";
import { IconClose } from "@demo/assets";
import { useMediaQuery } from "@demo/hooks";
import { ResponsiveUIEnum } from "@demo/types/Enums";
import { useTranslation } from "react-i18next";
import { BottomSheet } from "react-spring-bottom-sheet";

import "react-spring-bottom-sheet/dist/style.css";
import { Explore } from "../Explore";
import "./styles.scss";

interface IProps {
	SearchBoxEl: (ui: React.Dispatch<React.SetStateAction<ResponsiveUIEnum | undefined>>) => JSX.Element;
	MapButtons: JSX.Element;
	bottomSheetMinHeight: number;
}

const ResponsiveBottomSheet: React.FC<IProps> = ({ SearchBoxEl, MapButtons, bottomSheetMinHeight }) => {
	const isDesktop = useMediaQuery("(min-width: 1024px)");
	const isMobile = useMediaQuery("(max-width: 425px)");
	const isTablet = !isDesktop && !isMobile;
	const { t } = useTranslation();
	const [ui, setUI] = React.useState<ResponsiveUIEnum | undefined>(ResponsiveUIEnum.explore);

	const bottomSheetHeader = (ui?: ResponsiveUIEnum) => {
		switch (ui) {
			case ResponsiveUIEnum.map_styles:
				return (
					<Flex direction="column" gap="0" padding="8px 12px 0 16px" width="100%">
						<Flex justifyContent="flex-end">
							<IconClose
								width={20}
								height={20}
								fill="var(--grey-color)"
								onClick={() => setUI(ResponsiveUIEnum.explore)}
							/>
						</Flex>
						<Flex direction="column" alignItems="flex-start" gap="0">
							<Text fontFamily="AmazonEmber-Bold" fontSize="1.23rem" textAlign="left">
								{t("map_style.text")}
							</Text>
							<Text fontFamily="AmazonEmber-Regular" fontSize="1rem" color="var(--grey-color)" textAlign="left">
								{t("map_buttons__info.text")}
							</Text>
						</Flex>
					</Flex>
				);
			case ResponsiveUIEnum.explore:
			case ResponsiveUIEnum.search:
				return (
					<Flex padding="8px 8px 50px" width="100%">
						{SearchBoxEl(setUI)}
					</Flex>
				);
			default:
				return <></>;
		}
	};

	const bottomSheetBody = (ui?: ResponsiveUIEnum) => {
		switch (ui) {
			case ResponsiveUIEnum.map_styles:
				return MapButtons;
			case ResponsiveUIEnum.explore:
				return <Explore updateUIInfo={setUI} />;
			default:
				return <></>;
		}
	};
	function calculatePixelValue(maxHeight: number, number: number) {
		// Calculate the percentage of the max height
		const percentage = number / 100;

		// Convert the percentage to pixels
		let pixelValue = maxHeight * percentage;

		// Ensure the pixel value is not less than the minimum
		if (pixelValue < bottomSheetMinHeight) {
			pixelValue = bottomSheetMinHeight;
		}

		return pixelValue;
	}

	const heights = { headerHeight: 10, footerHeight: 50, height: 99, minHeight: 10 };

	const headerHeight = (maxHeight: number) => calculatePixelValue(maxHeight, heights.headerHeight);
	const footerHeight = (maxHeight: number) => calculatePixelValue(maxHeight, heights.footerHeight);
	const height = (maxHeight: number) => calculatePixelValue(maxHeight, heights.height);
	const minHeight = (maxHeight: number) => calculatePixelValue(maxHeight, heights.minHeight);

	return (
		<>
			{(isTablet || isMobile) && (
				<BottomSheet
					open
					blocking={false}
					snapPoints={({ maxHeight }) => [
						headerHeight(maxHeight),
						footerHeight(maxHeight),
						height(maxHeight),
						minHeight(maxHeight)
					]}
					header={<Flex>{bottomSheetHeader(ui)}</Flex>}
					className={`bottom-sheet ${isTablet ? "tablet" : "mobile"}`}
					data-amplify-theme="aws-location-theme"
				>
					{bottomSheetBody(ui)}
				</BottomSheet>
			)}
		</>
	);
};

export default ResponsiveBottomSheet;
