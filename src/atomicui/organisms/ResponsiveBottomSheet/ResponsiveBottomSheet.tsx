/* Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved. */
/* SPDX-License-Identifier: MIT-0 */

import React, { FC, useCallback, useEffect } from "react";

import { Flex, Text } from "@aws-amplify/ui-react";
import { IconClose } from "@demo/assets";
import { useBottomSheet, useMediaQuery } from "@demo/hooks";
import { ResponsiveUIEnum } from "@demo/types/Enums";
import { useTranslation } from "react-i18next";
import { BottomSheet } from "react-spring-bottom-sheet";

import "react-spring-bottom-sheet/dist/style.css";
import { Explore } from "../Explore";
import "./styles.scss";

interface IProps {
	SearchBoxEl: () => JSX.Element;
	MapButtons: JSX.Element;
	RouteBox: JSX.Element;
}

const ResponsiveBottomSheet: FC<IProps> = ({ SearchBoxEl, MapButtons, RouteBox }) => {
	const isDesktop = useMediaQuery("(min-width: 1024px)");
	const isMobile = useMediaQuery("(max-width: 425px)");
	const isTablet = !isDesktop && !isMobile;
	const { t } = useTranslation();

	const {
		setBottomSheetMinHeight,
		setBottomSheetHeight,
		bottomSheetMinHeight,
		bottomSheetHeight,
		setBottomSheetCurrentHeight,
		ui,
		setUI
	} = useBottomSheet();

	useEffect(() => {
		const resizeObserver = new ResizeObserver(entries => {
			for (const entry of entries) {
				setBottomSheetHeight(entry.contentRect.height);

				if (bottomSheetHeight > window.innerHeight) {
					setBottomSheetHeight(window.innerHeight);
				}
			}
		});

		const handleWindowResize = () => {
			resizeObserver.observe(document.body);
		};

		window.addEventListener("resize", handleWindowResize);

		return () => {
			window.removeEventListener("resize", handleWindowResize);
			resizeObserver.disconnect();
		};
	}, [setBottomSheetCurrentHeight, setBottomSheetHeight, bottomSheetHeight]);

	useEffect(() => {
		const resizeObserver = new ResizeObserver(entries => {
			for (const entry of entries) {
				setBottomSheetCurrentHeight(entry.contentRect.height);
				setBottomSheetHeight(window.innerHeight);
			}
		});

		const mutationObserver = new MutationObserver((mutationsList, observer) => {
			for (const mutation of mutationsList) {
				if (mutation.type === "childList") {
					const element = document.querySelector('div[data-rsbs-overlay="true"]') as HTMLDivElement;
					if (element) {
						resizeObserver.observe(element);
						observer.disconnect();
					}
				}
			}
		});

		mutationObserver.observe(document.body, { childList: true, subtree: true });

		return () => {
			mutationObserver.disconnect();
			resizeObserver.disconnect();
		};
	}, [setBottomSheetCurrentHeight, setBottomSheetHeight, setBottomSheetMinHeight]);

	const bottomSheetHeader = useCallback(
		(ui?: ResponsiveUIEnum) => {
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
				case ResponsiveUIEnum.routes:
					return null;
				case ResponsiveUIEnum.explore:
				case ResponsiveUIEnum.poi_card:
				case ResponsiveUIEnum.search:
				default:
					return <Flex width="100%">{SearchBoxEl()}</Flex>;
			}
		},
		[SearchBoxEl, setUI, t]
	);

	const bottomSheetBody = useCallback(
		(ui?: ResponsiveUIEnum) => {
			switch (ui) {
				case ResponsiveUIEnum.map_styles:
					return MapButtons;
				case ResponsiveUIEnum.routes:
					return RouteBox;
				case ResponsiveUIEnum.search:
				case ResponsiveUIEnum.poi_card:
					return null;
				case ResponsiveUIEnum.explore:
				default:
					return <Explore updateUIInfo={setUI} />;
			}
		},
		[MapButtons, RouteBox, setUI]
	);

	const calculatePixelValue = useCallback(
		(maxHeight: number, number: number) => {
			const percentage = number / 100;

			let pixelValue = maxHeight * percentage;

			if (pixelValue < bottomSheetMinHeight) {
				pixelValue = bottomSheetMinHeight;
			}

			return pixelValue;
		},
		[bottomSheetMinHeight]
	);

	const footerHeight = useCallback((maxHeight: number) => calculatePixelValue(maxHeight, 50), [calculatePixelValue]);

	return (
		<>
			{(isTablet || isMobile) && (
				<BottomSheet
					open
					blocking={false}
					snapPoints={({ maxHeight }) => [
						bottomSheetMinHeight,
						footerHeight(maxHeight),
						bottomSheetHeight - 10,
						bottomSheetMinHeight
					]}
					maxHeight={bottomSheetHeight}
					header={<Flex>{bottomSheetHeader(ui)}</Flex>}
					className={`bottom-sheet ${isTablet ? "tablet" : "mobile"} 
					`}
					data-amplify-theme="aws-location-theme"
				>
					{bottomSheetBody(ui)}
				</BottomSheet>
			)}
		</>
	);
};

export default ResponsiveBottomSheet;
