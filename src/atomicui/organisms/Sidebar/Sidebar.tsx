/* Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved. */
/* SPDX-License-Identifier: MIT-0 */

import React from "react";

import { Button, Card, Flex, Text, View } from "@aws-amplify/ui-react";
import { IconClose, IconCompass, IconGear, IconGeofence, IconInfo, IconLockSolid, IconRadar } from "@demo/assets";
import { List, Logo } from "@demo/atomicui/atoms";
import { appConfig, marketingMenuOptionsData } from "@demo/core/constants";
import { useAmplifyAuth, useAmplifyMap, useAwsIot } from "@demo/hooks";
import { AnalyticsEventActionsEnum, EventTypeEnum, MapProviderEnum, MenuItemEnum, TriggeredByEnum } from "@demo/types";
import { record } from "@demo/utils/analyticsUtils";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import { Tooltip } from "react-tooltip";
import "./styles.scss";

const {
	ROUTES: { DEMO, OVERVIEW }
} = appConfig;

interface SidebarProps {
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

const Sidebar: React.FC<SidebarProps> = ({
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
	const { isUserAwsAccountConnected, credentials, onLogin, onLogout, onDisconnectAwsAccount, setAuthTokens } =
		useAmplifyAuth();
	const { mapProvider: currentMapProvider } = useAmplifyMap();
	const { detachPolicy } = useAwsIot();
	const navigate = useNavigate();
	const isAuthenticated = !!credentials?.authenticated;
	const { t } = useTranslation();
	const disconnectButtonText = t("disconnect_aws_account.text");

	const sidebarData = marketingMenuOptionsData.filter(v => t(v.label) !== t("demo.text"));

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
				menuItem === MenuItemEnum.GEOFENCE ? onShowUnauthGeofenceBox() : onShowUnauthTrackerBox();
			}
		}
	};

	const onClickSettings = () => {
		onCloseSidebar();
		onShowSettings();
	};

	const onClickMore = () => {
		onCloseSidebar();
		onShowAboutModal();
	};

	const _onLogout = async () => {
		setAuthTokens(undefined);
		await detachPolicy(credentials!.identityId);
		await onLogout();
	};

	const _onLogin = async () => await onLogin();

	return (
		<Card data-testid="side-bar" className="side-bar">
			<Flex className="title-bar">
				<Logo
					width="100%"
					style={{
						padding: "16px 20px",
						cursor: "pointer"
					}}
					onClick={() => navigate(OVERVIEW)}
				/>

				<View className="icon-container">
					<IconClose data-testid="icon-close" onClick={onCloseSidebar} />
				</View>
			</Flex>

			<View as="ul" className="side-bar__menu">
				<Flex
					className="link-item"
					onClick={() => {
						navigate(DEMO);
						onCloseSidebar();
					}}
				>
					<IconCompass className="menu-icon" />
					<Text>{t("demo.text")}</Text>
				</Flex>
				<Flex className="link-item" onClick={() => onClickMenuItem(MenuItemEnum.GEOFENCE)}>
					<IconGeofence className="menu-icon" />
					<Text>{t("geofence.text")}</Text>
					{isUserAwsAccountConnected && !isAuthenticated && (
						<Flex className="locked-item">
							<IconLockSolid
								className="lock-icon"
								data-tooltip-id="geofence-lock"
								data-tooltip-place="top"
								data-tooltip-content={t("tooltip__sign_in_required.text")}
							/>
							<Tooltip id="geofence-lock" />
						</Flex>
					)}
				</Flex>
				<Flex className="link-item" onClick={() => onClickMenuItem(MenuItemEnum.TRACKER)}>
					<IconRadar className="menu-icon" />
					<Text>{t("tracker.text")}</Text>
					{isUserAwsAccountConnected && !isAuthenticated && (
						<Flex className="locked-item">
							<IconLockSolid
								className="lock-icon"
								data-tooltip-id="tracker-lock"
								data-tooltip-place="top"
								data-tooltip-content={t("tooltip__sign_in_required.text")}
							/>
							<Tooltip id="tracker-lock" />
						</Flex>
					)}
				</Flex>
				<Flex className="link-item" onClick={onClickSettings}>
					<IconGear className="menu-icon" />
					<Text>{t("settings.text")}</Text>
				</Flex>
				<Flex className="link-item" onClick={onClickMore}>
					<IconInfo className="menu-icon" />
					<Text>{t("about.text")}</Text>
				</Flex>
			</View>
			<List listArray={sidebarData} className="verticle-list side-bar__external-menu" hideIcons />
			<View className="button-wrapper">
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
					<Button
						data-testid="connect-aws-account-button"
						variation="primary"
						fontFamily="AmazonEmber-Bold"
						textAlign="center"
						onClick={() => onConnectAwsAccount(AnalyticsEventActionsEnum.CONNECT_AWS_ACCOUNT_BUTTON_CLICKED)}
					>
						{t("connect_aws_account.text")}
					</Button>
				)}
				{isUserAwsAccountConnected && !isAuthenticated && (
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
				)}
			</View>
		</Card>
	);
};

export default Sidebar;
