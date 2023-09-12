/* Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved. */
/* SPDX-License-Identifier: MIT-0 */

import React, { FC, useCallback, useEffect } from "react";

import { Flex, Text } from "@aws-amplify/ui-react";
import { IconClose, LogoDark, LogoLight } from "@demo/assets";
import { ConfirmationModal } from "@demo/atomicui/molecules";
import { useAmplifyMap, useBottomSheet, useDeviceMediaQuery } from "@demo/hooks";
import { ShowStateType } from "@demo/types";
import { MenuItemEnum, ResponsiveUIEnum } from "@demo/types/Enums";
import { PubSub } from "aws-amplify";
import { useTranslation } from "react-i18next";
import { MapRef } from "react-map-gl";
import { BottomSheet } from "react-spring-bottom-sheet";

import "react-spring-bottom-sheet/dist/style.css";
import { Explore } from "../Explore";

import "./styles.scss";

interface IProps {
	mapRef: MapRef | null;
	SearchBoxEl: () => JSX.Element;
	MapButtons: JSX.Element;
	RouteBox: JSX.Element;
	onCloseSidebar: () => void;
	onOpenConnectAwsAccountModal: () => void;
	onOpenSignInModal: () => void;
	onShowAuthGeofenceBox: () => void;
	onShowAuthTrackerBox: () => void;
	onShowSettings: () => void;
	onShowTrackingDisclaimerModal: () => void;
	onShowAboutModal: () => void;
	onShowUnauthGeofenceBox: () => void;
	onShowUnauthTrackerBox: () => void;
	onshowUnauthSimulationDisclaimerModal: () => void;
	setShowUnauthGeofenceBox: (b: boolean) => void;
	setShowUnauthTrackerBox: (b: boolean) => void;
	setShowConnectAwsAccountModal: (b: boolean) => void;
	setShowStartUnauthSimulation: (b: boolean) => void;
	showStartUnauthSimulation: boolean;
	from: MenuItemEnum;
	UnauthSimulationUI: JSX.Element;
	AuthGeofenceBox: JSX.Element;
	AuthTrackerBox: JSX.Element;
	setShow: React.Dispatch<React.SetStateAction<ShowStateType>>;
	show: ShowStateType;
}

const ResponsiveBottomSheet: FC<IProps> = ({
	SearchBoxEl,
	MapButtons,
	RouteBox,
	onCloseSidebar,
	onOpenConnectAwsAccountModal,
	onOpenSignInModal,
	onShowAuthGeofenceBox,
	onShowAuthTrackerBox,
	onShowSettings,
	onShowTrackingDisclaimerModal,
	onShowAboutModal,
	onShowUnauthGeofenceBox,
	onShowUnauthTrackerBox,
	onshowUnauthSimulationDisclaimerModal,
	setShowUnauthGeofenceBox,
	setShowUnauthTrackerBox,
	UnauthSimulationUI,
	from,
	AuthGeofenceBox,
	AuthTrackerBox,
	show
}) => {
	const { isDesktop, isTablet, isMax556 } = useDeviceMediaQuery();
	const { t } = useTranslation();
	const {
		setBottomSheetMinHeight,
		setBottomSheetHeight,
		bottomSheetMinHeight,
		bottomSheetHeight,
		bottomSheetCurrentHeight,
		setBottomSheetCurrentHeight,
		ui,
		setUI
	} = useBottomSheet();
	const { mapStyle } = useAmplifyMap();

	const isShortHeader =
		ui &&
		[
			ResponsiveUIEnum.auth_tracker,
			ResponsiveUIEnum.auth_geofence,
			ResponsiveUIEnum.non_start_unauthorized_tracker,
			ResponsiveUIEnum.non_start_unauthorized_geofence
		].includes(ui);
	const isNonStartedSimulation =
		!isDesktop &&
		ui &&
		[ResponsiveUIEnum.before_start_unauthorized_tracker, ResponsiveUIEnum.before_start_unauthorized_geofence].includes(
			ui
		);

	const isExitSimulation =
		!isDesktop &&
		ui &&
		[ResponsiveUIEnum.exit_unauthorized_tracker, ResponsiveUIEnum.exit_unauthorized_geofence].includes(ui);

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
						<Flex className="map-header-mobile">
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
				case ResponsiveUIEnum.unauth_tracker:
				case ResponsiveUIEnum.unauth_geofence:
				case ResponsiveUIEnum.auth_tracker:
				case ResponsiveUIEnum.auth_geofence:
				case ResponsiveUIEnum.non_start_unauthorized_tracker:
				case ResponsiveUIEnum.non_start_unauthorized_geofence:
				case ResponsiveUIEnum.direction_to_routes:
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
				case ResponsiveUIEnum.direction_to_routes:
					return RouteBox;
				case ResponsiveUIEnum.search:
				case ResponsiveUIEnum.poi_card:
					return null;
				case ResponsiveUIEnum.unauth_tracker:
				case ResponsiveUIEnum.unauth_geofence:
				case ResponsiveUIEnum.exit_unauthorized_tracker:
				case ResponsiveUIEnum.exit_unauthorized_geofence:
				case ResponsiveUIEnum.non_start_unauthorized_tracker:
				case ResponsiveUIEnum.non_start_unauthorized_geofence:
					return UnauthSimulationUI;
				case ResponsiveUIEnum.auth_tracker:
					return AuthTrackerBox;
				case ResponsiveUIEnum.auth_geofence:
					return AuthGeofenceBox;
				case ResponsiveUIEnum.explore:
				default:
					return (
						<Explore
							updateUIInfo={setUI}
							onCloseSidebar={onCloseSidebar}
							onOpenConnectAwsAccountModal={onOpenConnectAwsAccountModal}
							onOpenSignInModal={onOpenSignInModal}
							onShowAuthGeofenceBox={onShowAuthGeofenceBox}
							onShowAuthTrackerBox={onShowAuthTrackerBox}
							onShowSettings={onShowSettings}
							onShowTrackingDisclaimerModal={onShowTrackingDisclaimerModal}
							onShowAboutModal={onShowAboutModal}
							onShowUnauthGeofenceBox={onShowUnauthGeofenceBox}
							onShowUnauthTrackerBox={onShowUnauthTrackerBox}
							onshowUnauthSimulationDisclaimerModal={onshowUnauthSimulationDisclaimerModal}
						/>
					);
			}
		},
		[
			AuthGeofenceBox,
			AuthTrackerBox,
			MapButtons,
			RouteBox,
			UnauthSimulationUI,
			onCloseSidebar,
			onOpenConnectAwsAccountModal,
			onOpenSignInModal,
			onShowAboutModal,
			onShowAuthGeofenceBox,
			onShowAuthTrackerBox,
			onShowSettings,
			onShowTrackingDisclaimerModal,
			onShowUnauthGeofenceBox,
			onShowUnauthTrackerBox,
			onshowUnauthSimulationDisclaimerModal,
			setUI
		]
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

	const onCloseHandler = useCallback(() => {
		PubSub.removePluggable("AWSIoTProvider");
		from === MenuItemEnum.GEOFENCE ? setShowUnauthGeofenceBox(false) : setShowUnauthTrackerBox(false);
		window.location.reload();
	}, [from, setShowUnauthGeofenceBox, setShowUnauthTrackerBox]);

	const ExitSimulation = useCallback(
		() => (
			<Flex className="confirmation-modal-container">
				<ConfirmationModal
					open
					onClose={onCloseHandler}
					heading={t("start_unauth_simulation__exit_simulation.text") as string}
					description={
						<Text
							className="small-text"
							variation="tertiary"
							marginTop="1.23rem"
							textAlign="center"
							whiteSpace="pre-line"
						>
							{t("start_unauth_simulation__exit_simulation_desc.text")}
						</Text>
					}
					onConfirm={() =>
						setUI(from === MenuItemEnum.GEOFENCE ? ResponsiveUIEnum.unauth_geofence : ResponsiveUIEnum.unauth_tracker)
					}
					confirmationText={t("start_unauth_simulation__stay_in_simulation.text") as string}
					cancelationText={t("exit.text") as string}
				/>
			</Flex>
		),
		[from, onCloseHandler, setUI, t]
	);

	return (
		<>
			{!isDesktop && isNonStartedSimulation && UnauthSimulationUI}
			{!isDesktop && isExitSimulation && ExitSimulation()}

			<BottomSheet
				open
				blocking={isDesktop}
				snapPoints={({ maxHeight }) => [
					bottomSheetMinHeight,
					footerHeight(maxHeight),
					bottomSheetHeight - 10,
					bottomSheetMinHeight
				]}
				maxHeight={bottomSheetHeight}
				header={
					<Flex>
						{isMax556 && (
							<Flex className="logo-mobile-container" top={show.isAttributionOpen ? "-7rem" : "-2.89rem"}>
								<Flex className="logo-mobile">
									{mapStyle.toLowerCase().includes("dark") ? <LogoDark /> : <LogoLight />}
								</Flex>
								{/* <Flex
									alignItems="center"
									paddingTop={show.isAttributionOpen ? "0.55rem" : "0.35rem"}
									marginLeft="0.2rem"
								>
									<IconInfo
										width={18}
										fill="var(--grey-color)"
										onClick={() => setShow(s => ({ ...s, isAttributionOpen: !s.isAttributionOpen }))}
									/>
								</Flex> */}
							</Flex>
						)}
						{bottomSheetHeader(ui)}
					</Flex>
				}
				className={`bottom-sheet ${isDesktop ? "desktop" : isTablet ? "tablet" : "mobile"} ${
					isShortHeader ? "short-header" : ""
				} ${(bottomSheetCurrentHeight || 0) + 30 < window.innerHeight ? "add-overlay" : ""}`}
				data-amplify-theme="aws-location-theme"
			>
				{bottomSheetBody(ui)}
			</BottomSheet>
		</>
	);
};

export default ResponsiveBottomSheet;
