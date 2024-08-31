/* Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved. */
/* SPDX-License-Identifier: MIT-0 */

import { FC, Fragment, MutableRefObject, lazy, useCallback, useMemo, useState } from "react";

import { Button, Divider, Flex, Text } from "@aws-amplify/ui-react";
import {
	IconArrow,
	IconAwsCloudFormation,
	IconBrandAndroid,
	IconBrandApple,
	IconBrowser,
	IconDirections,
	IconGeofencePlusSolid,
	IconGlobe,
	IconMapSolid,
	IconRadar
} from "@demo/assets/svgs";
import { appConfig } from "@demo/core/constants";
import BottomSheetHeights from "@demo/core/constants/bottomSheetHeights";
import { useAuth, useIot, useMap } from "@demo/hooks";
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
	ENV: {
		MIGRATE_FROM_GOOGLE_MAPS_PAGE,
		MIGRATE_A_WEB_APP_PAGE,
		MIGRATE_AN_ANDROID_APP_PAGE,
		MIGRATE_AN_IOS_APP_PAGE,
		MIGRATE_A_WEB_SERVICE_PAGE,
		PRICING_PAGE
	},
	ROUTES: {
		SAMPLES,
		MIGRATE_FROM_GOOGLE_MAPS,
		MIGRATE_A_WEB_APP,
		MIGRATE_AN_ANDROID_APP,
		MIGRATE_AN_IOS_APP,
		MIGRATE_A_WEB_SERVICE,
		PRICING
	}
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
	const [isMigrationMenuExapnded, setIsMigrationMenuExapnded] = useState(false);
	const { t, i18n } = useTranslation();
	const currentLanguage = i18n.language;
	const langDir = i18n.dir();
	const isLtr = langDir === "ltr";
	const { setBottomSheetMinHeight, setBottomSheetHeight, bottomSheetCurrentHeight = 0 } = useBottomSheet();
	const { isDesktop, isDesktopBrowser } = useDeviceMediaQuery();
	const { isUserAwsAccountConnected, credentials, onLogin, onLogout, onDisconnectAwsAccount } = useAuth();
	const { mapProvider: currentMapProvider } = useMap();
	const { detachPolicy } = useIot();
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

	const onClickSettings = useCallback(() => {
		onCloseSidebar();
		onShowSettings();
	}, [onCloseSidebar, onShowSettings]);

	const onClickMore = useCallback(() => {
		onCloseSidebar();
		onShowAboutModal();
	}, [onCloseSidebar, onShowAboutModal]);

	const onClickFeedback = useCallback(() => {
		onCloseSidebar();
		onOpenFeedbackModal();
	}, [onCloseSidebar, onOpenFeedbackModal]);

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
					record(
						[{ EventType: EventTypeEnum.SIGN_OUT_STARTED, Attributes: { triggeredBy: TriggeredByEnum.SIDEBAR } }],
						["userAWSAccountConnectionStatus", "userAuthenticationStatus"]
					);
					await detachPolicy(credentials!.identityId);
					onLogout();
				} else {
					record(
						[{ EventType: EventTypeEnum.SIGN_IN_STARTED, Attributes: { triggeredBy: TriggeredByEnum.SIDEBAR } }],
						["userAWSAccountConnectionStatus", "userAuthenticationStatus"]
					);
					onLogin();
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

	const exploreMoreOptions = useMemo(
		() => [
			{
				title: t("samples.text"),
				description: t("settings_modal_option__samples.text"),
				onClickHandler: () => navigate(SAMPLES),
				isEnabled: true
			},
			{
				title: t("migration.text"),
				description: t("migration_desc.text"),
				onClickHandler: () => setIsMigrationMenuExapnded(!isMigrationMenuExapnded),
				isEnabled:
					!!parseInt(MIGRATE_FROM_GOOGLE_MAPS_PAGE) ||
					!!parseInt(MIGRATE_A_WEB_APP_PAGE) ||
					!!parseInt(MIGRATE_AN_ANDROID_APP_PAGE) ||
					!!parseInt(MIGRATE_AN_IOS_APP_PAGE) ||
					!!parseInt(MIGRATE_A_WEB_SERVICE_PAGE),
				subMenu: [
					{
						title: t("header__overview.text"),
						description: t("migrate_from_google_maps.text"),
						onClickHandler: () => navigate(MIGRATE_FROM_GOOGLE_MAPS),
						isEnabled: !!parseInt(MIGRATE_FROM_GOOGLE_MAPS_PAGE),
						iconComponent: (
							<IconBrowser
								style={{ alignSelf: "flex-start", margin: "0.15rem 0rem 0rem 0.8rem" }}
								width={18}
								height={18}
							/>
						)
					},
					{
						title: t("web_app.text"),
						description: t("migrate_a_web_app.text"),
						onClickHandler: () => navigate(MIGRATE_A_WEB_APP),
						isEnabled: !!parseInt(MIGRATE_A_WEB_APP_PAGE),
						iconComponent: (
							<IconBrowser
								style={{ alignSelf: "flex-start", margin: "0.15rem 0rem 0rem 0.8rem" }}
								width={18}
								height={18}
							/>
						)
					},
					{
						title: t("android_app.text"),
						description: t("migrate_an_android_app.text"),
						onClickHandler: () => navigate(MIGRATE_AN_ANDROID_APP),
						isEnabled: !!parseInt(MIGRATE_AN_ANDROID_APP_PAGE),
						iconComponent: (
							<IconBrandAndroid
								style={{ alignSelf: "flex-start", margin: "0.15rem 0rem 0rem 0.8rem" }}
								width={18}
								height={18}
							/>
						)
					},
					{
						title: t("ios_app.text"),
						description: t("migrate_an_ios_app.text"),
						onClickHandler: () => navigate(MIGRATE_AN_IOS_APP),
						isEnabled: !!parseInt(MIGRATE_AN_IOS_APP_PAGE),
						iconComponent: (
							<IconBrandApple
								style={{ alignSelf: "flex-start", margin: "0.15rem 0rem 0rem 0.8rem" }}
								width={18}
								height={18}
							/>
						)
					},
					{
						title: t("web_service.text"),
						description: t("migrate_a_web_service.text"),
						onClickHandler: () => navigate(MIGRATE_A_WEB_SERVICE),
						isEnabled: !!parseInt(MIGRATE_A_WEB_SERVICE_PAGE),
						iconComponent: (
							<IconGlobe
								style={{ alignSelf: "flex-start", margin: "0.15rem 0rem 0rem 0.8rem" }}
								fill="var(--primary-color)"
								width={18}
								height={18}
							/>
						)
					}
				]
			},
			{
				title: t("pricing.text"),
				description: t("pricing_desc.text"),
				onClickHandler: () => navigate(PRICING),
				isEnabled: !!parseInt(PRICING_PAGE)
			},
			{
				title: t("settings.text"),
				description: t("settings_modal_option__settings.text"),
				onClickHandler: onClickSettings,
				isEnabled: true
			},
			{
				title: t("about.text"),
				description: t("settings_modal_option__about.text"),
				onClickHandler: onClickMore,
				isEnabled: true
			},
			{
				title: t("fm__provide_feedback_btn.text"),
				description: t("fm__mobile_view_desc.text"),
				onClickHandler: onClickFeedback,
				isEnabled: true
			}
		],
		[isMigrationMenuExapnded, navigate, onClickFeedback, onClickMore, onClickSettings, t]
	);

	const renderExploreMoreOptions = useMemo(() => {
		return exploreMoreOptions.map((option, idx) => {
			if (option.isEnabled) {
				if (option.subMenu?.length) {
					return (
						<Fragment key={idx}>
							<IconicInfoCard
								gap="0"
								IconComponent={
									<IconArrow className={isMigrationMenuExapnded ? "up-icon" : "reverse-icon"} width={20} height={20} />
								}
								title={option.title}
								titleColor={isMigrationMenuExapnded ? "var(--primary-color)" : ""}
								description={option.description}
								cardMargin={
									idx === 0 && (!isUserAwsAccountConnected || !isAuthenticated) ? "2rem 0 0.923rem 0" : "0.923rem 0"
								}
								direction="row-reverse"
								cardAlignItems="center"
								onClickHandler={option.onClickHandler}
								style={{ padding: "0 1rem" }}
							/>
							{isMigrationMenuExapnded &&
								option.subMenu.map((subOption, subIdx) => {
									if (subOption.isEnabled) {
										return (
											<Flex gap={0} direction="column" backgroundColor="var(--ghost-white)">
												<IconicInfoCard
													key={subIdx}
													gap="0"
													IconComponent={subOption.iconComponent}
													title={subOption.title}
													description={subOption.description}
													cardMargin={
														idx === 0 && (!isUserAwsAccountConnected || !isAuthenticated)
															? "2rem 0 0.923rem 0"
															: "0.923rem 0"
													}
													cardAlignItems="center"
													onClickHandler={subOption.onClickHandler}
													isTitleBold
													style={{ padding: "0 1rem" }}
												/>
											</Flex>
										);
									}
								})}
						</Fragment>
					);
				} else {
					return (
						<IconicInfoCard
							key={idx}
							gap="0"
							IconComponent={<IconArrow className="reverse-icon" width={20} height={20} />}
							title={option.title}
							description={option.description}
							cardMargin={
								idx === 0 && (!isUserAwsAccountConnected || !isAuthenticated) ? "2rem 0 0.923rem 0" : "0.923rem 0"
							}
							direction="row-reverse"
							cardAlignItems="center"
							onClickHandler={option.onClickHandler}
							style={{ padding: "0 1rem" }}
						/>
					);
				}
			}
		});
	}, [exploreMoreOptions, isAuthenticated, isMigrationMenuExapnded, isUserAwsAccountConnected]);

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
			<Flex direction="column" gap="0" className="explore-more-options">
				{renderExploreMoreOptions}
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
