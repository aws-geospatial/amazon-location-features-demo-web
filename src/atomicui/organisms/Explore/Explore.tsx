/* Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved. */
/* SPDX-License-Identifier: MIT-0 */

import { FC, MutableRefObject, lazy } from "react";

import { Button, Divider, Flex, Text } from "@aws-amplify/ui-react";
import {
	IconArrow,
	IconAwsCloudFormation,
	IconDirections,
	IconGeofencePlusSolid,
	IconMapSolid,
	IconRadar
} from "@demo/assets";
import { appConfig } from "@demo/core/constants";
import BottomSheetHeights from "@demo/core/constants/bottomSheetHeights";
import { useAmplifyAuth, useAmplifyMap, useAwsIot } from "@demo/hooks";
import useBottomSheet from "@demo/hooks/useBottomSheet";
import useDeviceMediaQuery from "@demo/hooks/useDeviceMediaQuery";
import {
	AnalyticsEventActionsEnum,
	EventTypeEnum,
	MapProviderEnum,
	MenuItemEnum,
	ResponsiveUIEnum,
	TriggeredByEnum
} from "@demo/types/Enums";
import { record } from "@demo/utils";
import { isAndroid, isIOS } from "react-device-detect";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import { RefHandles } from "react-spring-bottom-sheet/dist/types";
import "./styles.scss";

const ExploreButton = lazy(() =>
	import("@demo/atomicui/atoms/ExploreButton").then(module => ({ default: module.ExploreButton }))
);
const IconicInfoCard = lazy(() =>
	import("@demo/atomicui/molecules/IconicInfoCard").then(module => ({ default: module.IconicInfoCard }))
);

const {
	ROUTES: { SAMPLES, OVERVIEW }
} = appConfig;

interface IProps {
	updateUIInfo: (ui: ResponsiveUIEnum) => void;
	onCloseSidebar: () => void;
	onOpenConnectAwsAccountModal: () => void;
	onOpenFeedbackModal: () => void;
	onOpenSignInModal: () => void;
	onShowAuthGeofenceBox: () => void;
	onShowAuthTrackerBox: () => void;
	onShowSettings: () => void;
	onShowTrackingDisclaimerModal: () => void;
	onShowAboutModal: () => void;
	onShowUnauthGeofenceBox: () => void;
	onShowUnauthTrackerBox: () => void;
	onshowUnauthSimulationDisclaimerModal: () => void;
	bottomSheetRef?: MutableRefObject<RefHandles | null>;
}

const Explore: FC<IProps> = ({
	updateUIInfo,
	onCloseSidebar,
	onOpenConnectAwsAccountModal,
	onOpenFeedbackModal,
	onOpenSignInModal,
	onShowAuthGeofenceBox,
	onShowAuthTrackerBox,
	onShowSettings,
	onShowTrackingDisclaimerModal,
	onShowAboutModal,
	onShowUnauthGeofenceBox,
	onShowUnauthTrackerBox,
	onshowUnauthSimulationDisclaimerModal,
	bottomSheetRef
}) => {
	const { t, i18n } = useTranslation();
	const currentLanguage = i18n.language;
	const langDir = i18n.dir();
	const isLtr = langDir === "ltr";
	const { setBottomSheetMinHeight, setBottomSheetHeight, bottomSheetCurrentHeight = 0 } = useBottomSheet();
	const { isDesktop, isDesktopBrowser } = useDeviceMediaQuery();
	const { isUserAwsAccountConnected, credentials, onLogin, onLogout, onDisconnectAwsAccount, setAuthTokens } =
		useAmplifyAuth();
	const { mapProvider: currentMapProvider } = useAmplifyMap();
	const { detachPolicy } = useAwsIot();
	const isAuthenticated = !!credentials?.authenticated;
	const disconnectButtonText = t("disconnect_aws_account.text");
	const navigate = useNavigate();

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
					updateUIInfo(ResponsiveUIEnum.auth_geofence);
					if (!isDesktop) {
						setBottomSheetMinHeight(window.innerHeight * 0.4 - 10);
						setBottomSheetHeight(window.innerHeight * 0.4);
						setTimeout(() => {
							setBottomSheetMinHeight(BottomSheetHeights.explore.min);
							setBottomSheetHeight(window.innerHeight);
						}, 300);
					}
				} else {
					if (currentMapProvider === MapProviderEnum.ESRI) {
						onShowTrackingDisclaimerModal();
					} else {
						onShowAuthTrackerBox();
						updateUIInfo(ResponsiveUIEnum.auth_tracker);
						if (!isDesktop) {
							setBottomSheetMinHeight(window.innerHeight * 0.4 - 10);
							setBottomSheetHeight(window.innerHeight * 0.4);
							setTimeout(() => {
								setBottomSheetMinHeight(BottomSheetHeights.explore.min);
								setBottomSheetHeight(window.innerHeight);
							}, 300);
						}
					}
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

	const onClickSettings = () => {
		onCloseSidebar();
		onShowSettings();
	};

	const onClickMore = () => {
		onCloseSidebar();
		onShowAboutModal();
	};

	const onClickFeedback = () => {
		onCloseSidebar();
		onOpenFeedbackModal();
	};

	const ConnectAccount = ({ isAuthenticated = false }) => (
		<>
			<Flex alignItems="center">
				<IconAwsCloudFormation width="1.2rem" height="1.38rem" />
				<Text fontFamily="AmazonEmber-Bold" fontSize="1.23rem" dir={isLtr ? "ltr" : "rtl"}>
					{t("explore__connect_aws_account.text")}
				</Text>
			</Flex>
			<Text fontFamily="AmazonEmber-Regular" fontSize="1rem" color="var(--grey-color)" dir={isLtr ? "ltr" : "rtl"}>
				{t("explore__connect_description.text")}
			</Text>
			{isAuthenticated ? (
				<AwsAccountButton />
			) : (
				<Button
					data-testid="connect-aws-account-button"
					variation="primary"
					width="100%"
					height="3.07rem"
					fontFamily={"AmazonEmber-Bold"}
					fontSize="1.07rem"
					onClick={() => onConnectAwsAccount(AnalyticsEventActionsEnum.CONNECT_AWS_ACCOUNT_BUTTON_CLICKED)}
				>
					{t("caam__connect.text")}
				</Button>
			)}
		</>
	);

	const AwsAccountButton = ({ isFooter = false }) => (
		<Button
			data-testid={isAuthenticated ? "sign-out-button" : "sign-in-button"}
			variation={isFooter ? "link" : "primary"}
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
			className={isFooter ? "auth-footer-button" : ""}
		>
			{isAuthenticated ? t("sign_out.text") : t("sign_in.text")}
		</Button>
	);

	const DisconnectButton = ({ isFooter = false }) => (
		<Button
			data-testid="disconnect-aws-account-button"
			variation={isFooter ? "link" : "primary"}
			fontFamily="AmazonEmber-Bold"
			className={`disconnect-button ${isFooter ? "auth-footer-button" : ""}`}
			marginTop={"1.84rem"}
			textAlign="center"
			onClick={onDisconnectAwsAccount}
			fontSize={disconnectButtonText.length > 22 ? "0.92rem" : "1rem"}
		>
			{disconnectButtonText}
		</Button>
	);

	const exploreMoreOptions = [
		{
			title: t("header__overview.text"),
			description: t("settings_modal_option__overview.text"),
			onClickHandler: () => navigate(OVERVIEW)
		},
		{
			title: t("samples.text"),
			description: t("settings_modal_option__samples.text"),
			onClickHandler: () => navigate(SAMPLES)
		},
		{
			title: t("settings.text"),
			description: t("settings_modal_option__settings.text"),
			onClickHandler: onClickSettings
		},
		{ title: t("about.text"), description: t("settings_modal_option__about.text"), onClickHandler: onClickMore },
		{
			title: t("fm__provide_feedback_btn.text"),
			description: t("fm__mobile_view_desc.text"),
			onClickHandler: onClickFeedback
		}
	];

	const exploreButtons = [
		{
			text: t("routes.text"),
			icon: <IconDirections width="1.53rem" height="1.53rem" fill="white" />,
			onClick: () => {
				updateUIInfo(ResponsiveUIEnum.routes);
				if ((isAndroid || isIOS) && !isDesktopBrowser) {
					setBottomSheetMinHeight(window.innerHeight - 10);
					setBottomSheetHeight(window.innerHeight);
					bottomSheetRef?.current?.snapTo(1000);
					setTimeout(() => {
						setBottomSheetMinHeight(BottomSheetHeights.explore.min);
					}, 400);
				} else {
					if (bottomSheetCurrentHeight < window.innerHeight * 0.4) {
						setBottomSheetMinHeight(window.innerHeight * 0.4 - 10);
						setBottomSheetHeight(window.innerHeight * 0.4);

						setTimeout(() => {
							setBottomSheetMinHeight(BottomSheetHeights.explore.min);
							setBottomSheetHeight(window.innerHeight);
						}, 200);
					}
				}
			}
		},
		{
			text: t("map_style.text"),
			icon: <IconMapSolid width="1.53rem" height="1.53rem" fill="white" />,
			onClick: () => {
				updateUIInfo(ResponsiveUIEnum.map_styles);
				if (bottomSheetCurrentHeight < window.innerHeight * 0.4) {
					setBottomSheetMinHeight(window.innerHeight * 0.4 - 10);
					setBottomSheetHeight(window.innerHeight * 0.4);
				}

				setTimeout(() => {
					setBottomSheetMinHeight(BottomSheetHeights.explore.min);
					setBottomSheetHeight(window.innerHeight);
				}, 500);
			}
		},
		{
			text: t("trackers.text"),
			icon: <IconRadar width="1.53rem" height="1.53rem" />,
			onClick: () => onClickMenuItem(MenuItemEnum.TRACKER)
		},
		{
			text: t("geofences.text"),
			icon: <IconGeofencePlusSolid width="1.53rem" height="1.53rem" fill="white" />,
			onClick: () => onClickMenuItem(MenuItemEnum.GEOFENCE)
		}
	];

	return (
		<Flex direction="column" className="explore-container" gap="0">
			<Flex
				className={`feature-container ${["fr", "es"].includes(currentLanguage) ? "feature-container-baseline" : ""}`}
			>
				{exploreButtons.map((button, index) => (
					<ExploreButton key={index} text={button.text} icon={button.icon} onClick={button.onClick} />
				))}
			</Flex>
			{(!isUserAwsAccountConnected || !isAuthenticated) && (
				<Flex direction="column" className="aws-connect-container button-wrapper">
					<ConnectAccount isAuthenticated={isUserAwsAccountConnected} />
				</Flex>
			)}
			<Flex direction="column" gap="0" margin="0 1rem" className="explore-more-options">
				{exploreMoreOptions.map((option, index) => (
					<IconicInfoCard
						key={index}
						gap="0"
						IconComponent={<IconArrow className="reverse-icon" width={20} height={20} />}
						title={option.title}
						description={option.description}
						cardMargin={
							index === 0 && (!isUserAwsAccountConnected || !isAuthenticated) ? "2rem 0 0.923rem 0" : "0.923rem 0"
						}
						direction="row-reverse"
						cardAlignItems="center"
						onClickHandler={option.onClickHandler}
					/>
				))}
			</Flex>

			{isUserAwsAccountConnected && isAuthenticated && (
				<>
					<Divider className="title-divider" />
					<AwsAccountButton isFooter />
				</>
			)}
			{isUserAwsAccountConnected && !isAuthenticated && (
				<>
					<Divider className="title-divider" />
					<DisconnectButton isFooter />
				</>
			)}
		</Flex>
	);
};

export default Explore;
