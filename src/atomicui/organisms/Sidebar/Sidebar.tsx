/* Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved. */
/* SPDX-License-Identifier: MIT-0 */

import { FC, lazy } from "react";

import { Button, Card, Flex, Text, View } from "@aws-amplify/ui-react";
import { IconClose, IconCompass, IconGear, IconGeofence, IconInfo, IconLockSolid, IconRadar } from "@demo/assets/svgs";
import { appConfig, marketingMenuOptionsData } from "@demo/core/constants";
import { useAuth, useIot, useMap } from "@demo/hooks";
import useBottomSheet from "@demo/hooks/useBottomSheet";
import { AnalyticsEventActionsEnum, EventTypeEnum, MapProviderEnum, MenuItemEnum, TriggeredByEnum } from "@demo/types";
import { ResponsiveUIEnum } from "@demo/types/Enums";
import { record } from "@demo/utils/analyticsUtils";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import { Tooltip } from "react-tooltip";
import "./styles.scss";

const List = lazy(() => import("@demo/atomicui/atoms/List").then(module => ({ default: module.List })));
const Logo = lazy(() => import("@demo/atomicui/atoms/Logo").then(module => ({ default: module.Logo })));

const {
	ROUTES: { DEFAULT, DEMO }
} = appConfig;

interface SidebarProps {
	onCloseSidebar: () => void;
	onOpenConnectAwsAccountModal: () => void;
	onOpenSignInModal: () => void;
	onShowSettings: () => void;
	onShowAboutModal: () => void;
	onShowAuthGeofenceBox: () => void;
	onShowAuthTrackerDisclaimerModal: () => void;
	onShowAuthTrackerBox: () => void;
	onShowUnauthGeofenceBox: () => void;
	onShowUnauthTrackerBox: () => void;
	onShowUnauthSimulationDisclaimerModal: () => void;
	onOpenFeedbackModal: () => void;
}

const Sidebar: FC<SidebarProps> = ({
	onCloseSidebar,
	onOpenConnectAwsAccountModal,
	onOpenSignInModal,
	onShowSettings,
	onShowAboutModal,
	onShowAuthGeofenceBox,
	onShowAuthTrackerDisclaimerModal,
	onShowAuthTrackerBox,
	onShowUnauthSimulationDisclaimerModal,
	onShowUnauthGeofenceBox,
	onShowUnauthTrackerBox,
	onOpenFeedbackModal
}) => {
	const { isUserAwsAccountConnected, credentials, onLogin, onLogout, onDisconnectAwsAccount } = useAuth();
	const { mapProvider: currentMapProvider } = useMap();
	const { detachPolicy } = useIot();
	const navigate = useNavigate();
	const isAuthenticated = !!credentials?.authenticated;
	const { t } = useTranslation();
	const disconnectButtonText = t("disconnect_aws_account.text");
	const { setUI } = useBottomSheet();

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

	const onClickFeedbackButton = () => {
		onCloseSidebar();
		onOpenFeedbackModal();
	};

	const onClickMenuItem = (menuItem: MenuItemEnum) => {
		onCloseSidebar();

		if (isUserAwsAccountConnected) {
			if (isAuthenticated) {
				if (menuItem === MenuItemEnum.GEOFENCE) {
					onShowAuthGeofenceBox();
				} else {
					currentMapProvider === MapProviderEnum.ESRI ? onShowAuthTrackerDisclaimerModal() : onShowAuthTrackerBox();
				}
			} else {
				onOpenSignInModal();
			}
		} else {
			if (currentMapProvider === MapProviderEnum.GRAB) {
				onShowUnauthSimulationDisclaimerModal();
			} else {
				if (menuItem === MenuItemEnum.GEOFENCE) {
					onShowUnauthGeofenceBox();
				} else {
					onShowUnauthTrackerBox();
					setUI(ResponsiveUIEnum.non_start_unauthorized_tracker);
				}
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

	return (
		<Card data-testid="side-bar" className="side-bar">
			<Flex className="title-bar">
				<Logo
					width="100%"
					style={{
						padding: "16px 20px",
						cursor: "pointer"
					}}
					onClick={() => navigate(DEFAULT)}
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
			<List listArray={marketingMenuOptionsData} className="verticle-list side-bar__external-menu" hideIcons />
			<View className="button-wrapper">
				{isUserAwsAccountConnected ? (
					<>
						<Button
							data-testid={isAuthenticated ? "sign-out-button" : "sign-in-button"}
							variation="primary"
							fontFamily="AmazonEmber-Bold"
							textAlign="center"
							onClick={async () => {
								if (isAuthenticated) {
									record(
										[
											{
												EventType: EventTypeEnum.SIGN_OUT_STARTED,
												Attributes: { triggeredBy: TriggeredByEnum.SIDEBAR }
											}
										],
										["userAWSAccountConnectionStatus", "userAuthenticationStatus"]
									);
									await detachPolicy(credentials!.identityId);
									onLogout();
								} else {
									record(
										[
											{ EventType: EventTypeEnum.SIGN_IN_STARTED, Attributes: { triggeredBy: TriggeredByEnum.SIDEBAR } }
										],
										["userAWSAccountConnectionStatus", "userAuthenticationStatus"]
									);
									onLogin();
								}
							}}
						>
							{isAuthenticated ? t("sign_out.text") : t("sign_in.text")}
						</Button>
						{!isAuthenticated && (
							<Flex
								style={{
									flexDirection: "column"
								}}
							>
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
							</Flex>
						)}
					</>
				) : (
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
				<Button
					data-testid="provide-feedback-button"
					variation="primary"
					fontFamily="AmazonEmber-Bold"
					textAlign="center"
					marginTop="0.62rem"
					onClick={() => onClickFeedbackButton()}
				>
					{t("fm__provide_feedback_btn.text")}
				</Button>
			</View>
		</Card>
	);
};

export default Sidebar;
