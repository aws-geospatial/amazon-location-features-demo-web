/* Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved. */
/* SPDX-License-Identifier: MIT-0 */

import React from "react";

import { Button, Flex, Text } from "@aws-amplify/ui-react";
import {
	IconArrow,
	IconAwsCloudFormation,
	IconDirections,
	IconGeofencePlusSolid,
	IconMapSolid,
	IconRadar
} from "@demo/assets";
import { ExploreButton } from "@demo/atomicui/atoms";
import { IconicInfoCard } from "@demo/atomicui/molecules";
import BottomSheetHeights from "@demo/core/constants/bottomSheetHeights";
import { useAmplifyAuth, useAmplifyMap, useAwsIot, useBottomSheet } from "@demo/hooks";
import {
	AnalyticsEventActionsEnum,
	EventTypeEnum,
	MapProviderEnum,
	MenuItemEnum,
	ResponsiveUIEnum,
	TriggeredByEnum
} from "@demo/types/Enums";
import { record } from "@demo/utils";
import { useTranslation } from "react-i18next";
import "./styles.scss";

interface IProps {
	updateUIInfo: (ui: ResponsiveUIEnum) => void;
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
}

const Explore: React.FC<IProps> = ({
	updateUIInfo,
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
	onshowUnauthSimulationDisclaimerModal
}) => {
	const { t } = useTranslation();
	const { setBottomSheetMinHeight, setBottomSheetHeight } = useBottomSheet();
	const { isUserAwsAccountConnected, credentials, onLogin, onLogout, onDisconnectAwsAccount, setAuthTokens } =
		useAmplifyAuth();
	const { mapProvider: currentMapProvider } = useAmplifyMap();
	const { detachPolicy } = useAwsIot();
	const isAuthenticated = !!credentials?.authenticated;
	const disconnectButtonText = t("disconnect_aws_account.text");

	const onConnectAwsAccount = (action: AnalyticsEventActionsEnum) => {
		onCloseSidebar();
		onOpenConnectAwsAccountModal();

		record(
			[
				{
					EventType: EventTypeEnum.AWS_ACCOUNT_CONNECTION_STARTED,
					Attributes: { triggeredBy: TriggeredByEnum.SIDEBAR, action }
				}
			],
			["userAWSAccountConnectionStatus", "userAuthenticationStatus"]
		);
	};

	const onClickMenuItem = (menuItem: MenuItemEnum) => {
		onCloseSidebar();
		const isAuthenticated = !!credentials?.authenticated;

		if (isUserAwsAccountConnected) {
			if (isAuthenticated) {
				if (menuItem === MenuItemEnum.GEOFENCE) {
					onShowAuthGeofenceBox();
				} else {
					currentMapProvider === MapProviderEnum.ESRI ? onShowTrackingDisclaimerModal() : onShowAuthTrackerBox();
				}
			} else {
				onOpenSignInModal();
			}
		} else {
			if (currentMapProvider === MapProviderEnum.GRAB) {
				onshowUnauthSimulationDisclaimerModal();
			} else {
				if (menuItem === MenuItemEnum.GEOFENCE) {
					onShowUnauthGeofenceBox();
					updateUIInfo(ResponsiveUIEnum.non_start_unauthorized_geofence);
				} else {
					updateUIInfo(ResponsiveUIEnum.non_start_unauthorized_tracker);
					onShowUnauthTrackerBox();
				}
			}
		}
	};

	const _onLogout = async () => {
		setAuthTokens(undefined);
		await detachPolicy(credentials!.identityId);
		await onLogout();
	};

	const _onLogin = async () => await onLogin();

	return (
		<Flex direction="column" className="explore-container" gap="0">
			<Flex className="feature-container">
				<ExploreButton
					text={t("routes.text")}
					icon={<IconDirections width="1.53rem" height="1.53rem" fill="white" />}
					onClick={() => {
						updateUIInfo(ResponsiveUIEnum.routes);
						setBottomSheetMinHeight(BottomSheetHeights.routes.min);
						setBottomSheetHeight(BottomSheetHeights.routes.max);
					}}
				/>
				<ExploreButton
					text={t("map_style.text")}
					icon={<IconMapSolid width="1.53rem" height="1.53rem" fill="white" />}
					onClick={() => {
						updateUIInfo(ResponsiveUIEnum.map_styles);
						setBottomSheetMinHeight(BottomSheetHeights.map_styles.min);
						setBottomSheetHeight(BottomSheetHeights.map_styles.max);
					}}
				/>
				<ExploreButton
					text={t("trackers.text")}
					icon={<IconRadar width="1.53rem" height="1.53rem" />}
					onClick={() => onClickMenuItem(MenuItemEnum.TRACKER)}
				/>
				<ExploreButton
					text={t("geofences.text")}
					icon={<IconGeofencePlusSolid width="1.53rem" height="1.53rem" fill="white" />}
					onClick={() => onClickMenuItem(MenuItemEnum.GEOFENCE)}
				/>
			</Flex>
			<Flex direction="column" className="aws-connect-container button-wrapper">
				{isUserAwsAccountConnected && (
					<Button
						data-testid={isAuthenticated ? "sign-out-button" : "sign-in-button"}
						variation="primary"
						fontFamily="AmazonEmber-Bold"
						textAlign="center"
						onClick={async () => {
							if (isAuthenticated) {
								_onLogout();
							} else {
								await record(
									[{ EventType: EventTypeEnum.SIGN_IN_STARTED, Attributes: { triggeredBy: TriggeredByEnum.SIDEBAR } }],
									["userAWSAccountConnectionStatus", "userAuthenticationStatus"]
								);

								_onLogin();
							}
						}}
					>
						{isAuthenticated ? t("sign_out.text") : t("sign_in.text")}
					</Button>
				)}
				{!isUserAwsAccountConnected && (
					<>
						<Flex alignItems="center">
							<IconAwsCloudFormation width="1.2rem" height="1.38rem" />
							<Text fontFamily="AmazonEmber-Bold" fontSize="1.23rem">
								{t("explore__connect_aws_account.text")}
							</Text>
						</Flex>
						<Text fontFamily="AmazonEmber-Regular" fontSize="1rem" color="var(--grey-color)">
							{t("explore__connect_description.text")}
						</Text>
						<Button
							variation="primary"
							width="100%"
							height="3.07rem"
							onClick={() => onConnectAwsAccount(AnalyticsEventActionsEnum.CONNECT_AWS_ACCOUNT_BUTTON_CLICKED)}
						>
							{t("caam__connect.text")}
						</Button>
					</>
				)}
				{isUserAwsAccountConnected && !isAuthenticated && (
					<>
						<Button
							data-testid="disconnect-aws-account-button"
							variation="primary"
							fontFamily="AmazonEmber-Bold"
							className="disconnect-button"
							marginTop="8px"
							textAlign="center"
							onClick={onDisconnectAwsAccount}
							fontSize={disconnectButtonText.length > 22 ? "0.92rem" : "1rem"}
						>
							{disconnectButtonText}
						</Button>
					</>
				)}
			</Flex>
			<Flex direction="column" gap="0" margin="0 1rem" className="explore-more-options">
				<IconicInfoCard
					gap="0"
					IconComponent={<IconArrow className="reverse-icon" width={20} height={20} />}
					title={t("header__overview.text")}
					description={"Description text will be there"}
					cardMargin={"2rem 0 0.923rem 0"}
					direction="row-reverse"
					cardAlignItems="center"
				/>
				<IconicInfoCard
					gap="0"
					IconComponent={<IconArrow className="reverse-icon" width={20} height={20} />}
					title={t("samples.text")}
					description={"Description text will be there"}
					cardMargin={"0.923rem 0"}
					direction="row-reverse"
					cardAlignItems="center"
				/>
				<IconicInfoCard
					gap="0"
					IconComponent={<IconArrow className="reverse-icon" width={20} height={20} />}
					title={t("settings.text")}
					description={"Description text will be there"}
					cardMargin={"0.923rem 0"}
					direction="row-reverse"
					cardAlignItems="center"
				/>
				<IconicInfoCard
					gap="0"
					IconComponent={<IconArrow className="reverse-icon" width={20} height={20} />}
					title={t("about.text")}
					description={"Description text will be there"}
					cardMargin={"0.923rem 0"}
					direction="row-reverse"
					cardAlignItems="center"
				/>
			</Flex>
		</Flex>
	);
};

export default Explore;
