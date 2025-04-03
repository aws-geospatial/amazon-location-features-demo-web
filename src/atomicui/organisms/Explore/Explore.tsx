/* Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved. */
/* SPDX-License-Identifier: MIT-0 */

import { FC, Fragment, MutableRefObject, lazy, useCallback, useMemo, useState } from "react";

import { Flex } from "@aws-amplify/ui-react";
import {
	IconArrow,
	IconBrandAndroid,
	IconBrandApple,
	IconBrowser,
	IconCustomers,
	IconDeveloperResources,
	IconDirections,
	IconFaqsPrimary,
	IconFinancialService,
	IconGeofencePlusSolid,
	IconGeofencesTrackers,
	IconGlobe,
	IconHealthcare,
	IconMapSolid,
	IconPlacesNew,
	IconProductResources,
	IconRadar,
	IconRetail,
	IconRoute,
	IconTravelHospitality,
	IconTruckSolid
} from "@demo/assets/svgs";
import { appConfig } from "@demo/core/constants";
import BottomSheetHeights from "@demo/core/constants/bottomSheetHeights";
import useBottomSheet from "@demo/hooks/useBottomSheet";
import useDeviceMediaQuery from "@demo/hooks/useDeviceMediaQuery";
import { MenuItemEnum, ResponsiveUIEnum } from "@demo/types/Enums";
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
		PRICING_PAGE,
		SHOW_NEW_NAVIGATION
	},
	ROUTES: {
		DEMO,
		SAMPLES,
		MIGRATE_FROM_GOOGLE_MAPS,
		MIGRATE_A_WEB_APP,
		MIGRATE_AN_ANDROID_APP,
		MIGRATE_AN_IOS_APP,
		MIGRATE_A_WEB_SERVICE,
		PRICING
	},
	LINKS: {
		LEARN_MORE_URL,
		AWS_LOCATION_MAPS_URL,
		AWS_LOCATION_PLACES_URL,
		AWS_LOCATION_ROUTES_URL,
		AWS_LOCATION_GENFENCE_AND_TRACKERS_URL,
		AWS_GETTING_STARTED_URL,
		AWS_PRICING_URL,
		AWS_FAQ_URL,
		AWS_LOCATION_TRANSPORTATION_AND_LOGISTICS_URL,
		AWS_LOCATION_FINANCIAL_SERVICE_URL,
		AWS_LOCATION_HEALTHCARE_URL,
		AWS_LOCATION_RETAILS_URL,
		AWS_LOCATION_TRAVEL_AND_HOSPITALITY_URL,
		AWS_LOCATION_CUSTOMERS_URL,
		AMAZON_LOCATION_DOCUMENTATION_URL,
		AWS_INDUSTRY_OVERVIEW_URL
	}
} = appConfig;

interface ExploreProps {
	updateUIInfo: (ui: ResponsiveUIEnum) => void;
	onCloseSidebar: () => void;
	onOpenFeedbackModal: () => void;
	onShowSettings: () => void;
	onShowAboutModal: () => void;
	onShowUnauthGeofenceBox: () => void;
	onShowUnauthTrackerBox: () => void;
	bottomSheetRef?: MutableRefObject<RefHandles | null>;
}

const Explore: FC<ExploreProps> = ({
	updateUIInfo,
	onCloseSidebar,
	onOpenFeedbackModal,
	onShowSettings,
	onShowAboutModal,
	onShowUnauthGeofenceBox,
	onShowUnauthTrackerBox,
	bottomSheetRef
}) => {
	const [isMenuExpanded, setIsMenuExpanded] = useState<{ [key: string]: boolean }>({
		"migration.text": false,
		"header__product.text": false,
		"industry.text": false,
		"resources.text": false
	});
	const { t, i18n } = useTranslation();
	const currentLanguage = i18n.language;
	const { setBottomSheetMinHeight, setBottomSheetHeight, bottomSheetCurrentHeight = 0 } = useBottomSheet();
	const { isDesktopBrowser } = useDeviceMediaQuery();
	const navigate = useNavigate();

	const onClickMenuItem = useCallback(
		(menuItem: MenuItemEnum) => {
			onCloseSidebar();

			if (menuItem === MenuItemEnum.GEOFENCE) {
				onShowUnauthGeofenceBox();
				updateUIInfo(ResponsiveUIEnum.non_start_unauthorized_geofence);
			} else {
				updateUIInfo(ResponsiveUIEnum.non_start_unauthorized_tracker);
				onShowUnauthTrackerBox();
			}
		},
		[onCloseSidebar, onShowUnauthGeofenceBox, onShowUnauthTrackerBox, updateUIInfo]
	);

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

	const exploreMoreOptions = useMemo(
		() =>
			!SHOW_NEW_NAVIGATION
				? [
						{
							title: "samples.text",
							description: "settings_modal_option__samples.text",
							onClickHandler: () => navigate(SAMPLES),
							isEnabled: true
						},
						{
							title: "migration.text",
							description: "migration_desc.text",
							onClickHandler: () => setIsMenuExpanded(s => ({ ...s, "migration.text": !s["migration.text"] })),
							isEnabled:
								MIGRATE_FROM_GOOGLE_MAPS_PAGE ||
								MIGRATE_A_WEB_APP_PAGE ||
								MIGRATE_AN_ANDROID_APP_PAGE ||
								MIGRATE_AN_IOS_APP_PAGE ||
								MIGRATE_A_WEB_SERVICE_PAGE,
							subMenu: [
								{
									title: "header__overview.text",
									description: "migrate_from_google_maps.text",
									onClickHandler: () => navigate(MIGRATE_FROM_GOOGLE_MAPS),
									isEnabled: MIGRATE_FROM_GOOGLE_MAPS_PAGE,
									iconComponent: (
										<IconBrowser
											style={{ alignSelf: "flex-start", margin: "0.15rem 0rem 0rem 0.8rem" }}
											width={18}
											height={18}
										/>
									)
								},
								{
									title: "web_app.text",
									description: "migrate_a_web_app.text",
									onClickHandler: () => navigate(MIGRATE_A_WEB_APP),
									isEnabled: MIGRATE_A_WEB_APP_PAGE,
									iconComponent: (
										<IconBrowser
											style={{ alignSelf: "flex-start", margin: "0.15rem 0rem 0rem 0.8rem" }}
											width={18}
											height={18}
										/>
									)
								},
								{
									title: "android_app.text",
									description: "migrate_an_android_app.text",
									onClickHandler: () => navigate(MIGRATE_AN_ANDROID_APP),
									isEnabled: MIGRATE_AN_ANDROID_APP_PAGE,
									iconComponent: (
										<IconBrandAndroid
											style={{ alignSelf: "flex-start", margin: "0.15rem 0rem 0rem 0.8rem" }}
											width={18}
											height={18}
										/>
									)
								},
								{
									title: "ios_app.text",
									description: "migrate_an_ios_app.text",
									onClickHandler: () => navigate(MIGRATE_AN_IOS_APP),
									isEnabled: MIGRATE_AN_IOS_APP_PAGE,
									iconComponent: (
										<IconBrandApple
											style={{ alignSelf: "flex-start", margin: "0.15rem 0rem 0rem 0.8rem" }}
											width={18}
											height={18}
										/>
									)
								},
								{
									title: "web_service.text",
									description: "migrate_a_web_service.text",
									onClickHandler: () => navigate(MIGRATE_A_WEB_SERVICE),
									isEnabled: MIGRATE_A_WEB_SERVICE_PAGE,
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
							title: "pricing.text",
							description: "pricing_desc.text",
							onClickHandler: () => navigate(PRICING),
							isEnabled: PRICING_PAGE
						},
						{
							title: "settings.text",
							description: "settings_modal_option__settings.text",
							onClickHandler: onClickSettings,
							isEnabled: true
						},
						{
							title: "about.text",
							description: "settings_modal_option__about.text",
							onClickHandler: onClickMore,
							isEnabled: true
						},
						{
							title: "fm__provide_feedback_btn.text",
							description: "fm__mobile_view_desc.text",
							onClickHandler: onClickFeedback,
							isEnabled: true
						}
				  ]
				: [
						{
							title: "samples.text",
							description: "settings_modal_option__samples.text",
							onClickHandler: () => navigate(SAMPLES),
							isEnabled: true
						},
						{
							title: "migration.text",
							description: "migration_desc.text",
							onClickHandler: () => setIsMenuExpanded(s => ({ ...s, "migration.text": !s["migration.text"] })),
							isEnabled:
								MIGRATE_FROM_GOOGLE_MAPS_PAGE ||
								MIGRATE_A_WEB_APP_PAGE ||
								MIGRATE_AN_ANDROID_APP_PAGE ||
								MIGRATE_AN_IOS_APP_PAGE ||
								MIGRATE_A_WEB_SERVICE_PAGE,
							subMenu: [
								{
									title: "header__overview.text",
									description: "migrate_from_google_maps.text",
									onClickHandler: () => navigate(MIGRATE_FROM_GOOGLE_MAPS),
									isEnabled: MIGRATE_FROM_GOOGLE_MAPS_PAGE,
									iconComponent: (
										<IconBrowser
											style={{ alignSelf: "flex-start", margin: "0.15rem 0rem 0rem 0.8rem" }}
											width={18}
											height={18}
										/>
									)
								},
								{
									title: "web_app.text",
									description: "migrate_a_web_app.text",
									onClickHandler: () => navigate(MIGRATE_A_WEB_APP),
									isEnabled: MIGRATE_A_WEB_APP_PAGE,
									iconComponent: (
										<IconBrowser
											style={{ alignSelf: "flex-start", margin: "0.15rem 0rem 0rem 0.8rem" }}
											width={18}
											height={18}
										/>
									)
								},
								{
									title: "android_app.text",
									description: "migrate_an_android_app.text",
									onClickHandler: () => navigate(MIGRATE_AN_ANDROID_APP),
									isEnabled: MIGRATE_AN_ANDROID_APP_PAGE,
									iconComponent: (
										<IconBrandAndroid
											style={{ alignSelf: "flex-start", margin: "0.15rem 0rem 0rem 0.8rem" }}
											width={18}
											height={18}
										/>
									)
								},
								{
									title: "ios_app.text",
									description: "migrate_an_ios_app.text",
									onClickHandler: () => navigate(MIGRATE_AN_IOS_APP),
									isEnabled: MIGRATE_AN_IOS_APP_PAGE,
									iconComponent: (
										<IconBrandApple
											style={{ alignSelf: "flex-start", margin: "0.15rem 0rem 0rem 0.8rem" }}
											width={18}
											height={18}
										/>
									)
								},
								{
									title: "web_service.text",
									description: "migrate_a_web_service.text",
									onClickHandler: () => navigate(MIGRATE_A_WEB_SERVICE),
									isEnabled: MIGRATE_A_WEB_SERVICE_PAGE,
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
							title: "settings.text",
							description: "settings_modal_option__settings.text",
							onClickHandler: onClickSettings,
							isEnabled: true
						},
						{
							title: "about.text",
							description: "settings_modal_option__about.text",
							onClickHandler: onClickMore,
							isEnabled: true
						},
						{
							title: "fm__provide_feedback_btn.text",
							description: "fm__mobile_view_desc.text",
							onClickHandler: onClickFeedback,
							isEnabled: true
						},
						{
							title: "header__overview.text",
							description: "new_overview_desc.text",
							onClickHandler: () => window.open(LEARN_MORE_URL, "_self"),
							isEnabled: true
						},
						{
							title: "header__product.text",
							description: "new_products_desc.text",
							onClickHandler: () =>
								setIsMenuExpanded(s => ({ ...s, "header__product.text": !s["header__product.text"] })),
							isEnabled: true,
							subMenu: [
								{
									title: "maps.text",
									description: "new_maps_desc.text",
									onClickHandler: () => window.open(AWS_LOCATION_MAPS_URL, "_self"),
									isEnabled: true,
									iconComponent: (
										<IconMapSolid
											style={{
												alignSelf: "flex-start",
												margin: "0.15rem 0rem 0rem 0.8rem",
												fill: "var(--primary-color)"
											}}
											width={18}
											height={18}
										/>
									)
								},
								{
									title: "places.text",
									description: "new_places_desc.text",
									onClickHandler: () => window.open(AWS_LOCATION_PLACES_URL, "_self"),
									isEnabled: true,
									iconComponent: (
										<IconPlacesNew
											style={{
												alignSelf: "flex-start",
												margin: "0.15rem 0rem 0rem 0.8rem"
											}}
											width={18}
											height={18}
										/>
									)
								},
								{
									title: "routes.text",
									description: "new_routes_desc.text",
									onClickHandler: () => window.open(AWS_LOCATION_ROUTES_URL, "_self"),
									isEnabled: true,
									iconComponent: (
										<IconRoute
											style={{
												alignSelf: "flex-start",
												margin: "0.15rem 0rem 0rem 0.8rem",
												fill: "var(--primary-color)"
											}}
											width={18}
											height={18}
										/>
									)
								},
								{
									title: "geofences_and_trackers.text",
									description: "new_geofences_trackers_desc.text",
									onClickHandler: () => window.open(AWS_LOCATION_GENFENCE_AND_TRACKERS_URL, "_self"),
									isEnabled: true,
									iconComponent: (
										<IconGeofencesTrackers
											style={{ alignSelf: "flex-start", margin: "0.15rem 0rem 0rem 0.8rem" }}
											width={18}
											height={18}
										/>
									)
								}
							]
						},
						{
							title: "industry.text",
							description: "new_industry_desc.text",
							onClickHandler: () => setIsMenuExpanded(s => ({ ...s, "industry.text": !s["industry.text"] })),
							isEnabled: true,
							subMenu: [
								{
									title: "industry_overview.text",
									description: "new_industry_desc.text",
									onClickHandler: () => window.open(AWS_INDUSTRY_OVERVIEW_URL, "_self"),
									isEnabled: true,
									iconComponent: (
										<IconGlobe
											style={{
												alignSelf: "flex-start",
												margin: "0.15rem 0rem 0rem 0.8rem",
												fill: "var(--primary-color)"
											}}
											width={18}
											height={18}
										/>
									)
								},
								{
									title: "transportation_and_logistics.text",
									description: "new_transportation_logistics_desc.text",
									onClickHandler: () => window.open(AWS_LOCATION_TRANSPORTATION_AND_LOGISTICS_URL, "_self"),
									isEnabled: true,
									iconComponent: (
										<IconTruckSolid
											style={{
												alignSelf: "flex-start",
												margin: "0.15rem 0rem 0rem 0.8rem",
												fill: "var(--primary-color)"
											}}
											width={18}
											height={18}
										/>
									)
								},
								{
									title: "financial_service.text",
									description: "new_financial_service_desc.text",
									onClickHandler: () => window.open(AWS_LOCATION_FINANCIAL_SERVICE_URL, "_self"),
									isEnabled: true,
									iconComponent: (
										<IconFinancialService
											style={{ alignSelf: "flex-start", margin: "0.15rem 0rem 0rem 0.8rem" }}
											width={18}
											height={18}
										/>
									)
								},
								{
									title: "healthcare.text",
									description: "new_healthcare_desc.text",
									onClickHandler: () => window.open(AWS_LOCATION_HEALTHCARE_URL, "_self"),
									isEnabled: true,
									iconComponent: (
										<IconHealthcare
											style={{ alignSelf: "flex-start", margin: "0.15rem 0rem 0rem 0.8rem" }}
											width={18}
											height={18}
										/>
									)
								},
								{
									title: "retails.text",
									description: "new_retail_desc.text",
									onClickHandler: () => window.open(AWS_LOCATION_RETAILS_URL, "_self"),
									isEnabled: true,
									iconComponent: (
										<IconRetail
											style={{ alignSelf: "flex-start", margin: "0.15rem 0rem 0rem 0.8rem" }}
											width={18}
											height={18}
										/>
									)
								},
								{
									title: "travel_and_hospitality.text",
									description: "new_travel_hospitality_desc.text",
									onClickHandler: () => window.open(AWS_LOCATION_TRAVEL_AND_HOSPITALITY_URL, "_self"),
									isEnabled: true,
									iconComponent: (
										<IconTravelHospitality
											style={{ alignSelf: "flex-start", margin: "0.15rem 0rem 0rem 0.8rem" }}
											width={18}
											height={18}
										/>
									)
								}
							]
						},
						{
							title: "footer__getting_started.text",
							description: "new_getting_started_desc.text",
							onClickHandler: () => window.open(AWS_GETTING_STARTED_URL, "_self"),
							isEnabled: true
						},
						{
							title: "pricing.text",
							description: "new_pricing_desc.text",
							onClickHandler: () => window.open(AWS_PRICING_URL, "_self"),
							isEnabled: true
						},
						{
							title: "resources.text",
							description: "new_resources_desc.text",
							onClickHandler: () => setIsMenuExpanded(s => ({ ...s, "resources.text": !s["resources.text"] })),
							isEnabled: true,
							subMenu: [
								{
									title: "footer__faq.text",
									description: "new_faqs_desc.text",
									onClickHandler: () => window.open(AWS_FAQ_URL, "_self"),
									isEnabled: true,
									iconComponent: (
										<IconFaqsPrimary
											style={{
												alignSelf: "flex-start",
												margin: "0.15rem 0rem 0rem 0.8rem",
												fill: "var(--primary-color)"
											}}
											width={18}
											height={18}
										/>
									)
								},
								{
									title: "customers.text",
									description: "new_customers_desc.text",
									onClickHandler: () => window.open(AWS_LOCATION_CUSTOMERS_URL, "_self"),
									isEnabled: true,
									iconComponent: (
										<IconCustomers
											style={{
												alignSelf: "flex-start",
												margin: "0.15rem 0rem 0rem 0.8rem",
												fill: "var(--primary-color)"
											}}
											width={18}
											height={18}
										/>
									)
								},
								{
									title: "documentation.text",
									description: "new_developer_resources_desc.text",
									onClickHandler: () => window.open(AMAZON_LOCATION_DOCUMENTATION_URL, "_self"),
									isEnabled: true,
									iconComponent: (
										<IconDeveloperResources
											style={{ alignSelf: "flex-start", margin: "0.15rem 0rem 0rem 0.8rem" }}
											width={18}
											height={18}
										/>
									)
								},
								{
									title: "places_routes_maps.text",
									description: "description_demo.text",
									onClickHandler: () => navigate(DEMO),
									isEnabled: true,
									iconComponent: (
										<IconProductResources
											style={{ alignSelf: "flex-start", margin: "0.15rem 0rem 0rem 0.8rem" }}
											width={18}
											height={18}
										/>
									)
								},
								{
									title: "sample_applications.text",
									description: "settings_modal_option__samples.text",
									onClickHandler: () => navigate(SAMPLES),
									isEnabled: true,
									iconComponent: (
										<IconProductResources
											style={{ alignSelf: "flex-start", margin: "0.15rem 0rem 0rem 0.8rem" }}
											width={18}
											height={18}
										/>
									)
								}
							]
						}
				  ],
		[navigate, onClickFeedback, onClickMore, onClickSettings]
	);

	const renderExploreMoreOptions = useMemo(() => {
		return exploreMoreOptions.map(({ isEnabled, subMenu, title, description, onClickHandler }, idx) => {
			if (isEnabled) {
				if (subMenu?.length) {
					return (
						<Fragment key={idx}>
							<IconicInfoCard
								gap="0"
								IconComponent={
									<IconArrow className={isMenuExpanded[title] ? "up-icon" : "reverse-icon"} width={20} height={20} />
								}
								title={t(title)}
								titleColor={isMenuExpanded[title] ? "var(--primary-color)" : ""}
								description={t(description)}
								cardMargin={idx === 0 ? "2rem 0 0.923rem 0" : "0.923rem 0"}
								direction="row-reverse"
								cardAlignItems="center"
								onClickHandler={onClickHandler}
								style={{ padding: "0 1rem" }}
							/>
							{isMenuExpanded[title] &&
								subMenu.map(({ isEnabled, iconComponent, title, description, onClickHandler }, subIdx) => {
									if (isEnabled) {
										return (
											<Flex key={`${subIdx}-${title}`} gap="0" direction="column" backgroundColor="var(--ghost-white)">
												<IconicInfoCard
													key={subIdx}
													gap="0"
													IconComponent={iconComponent}
													title={t(title)}
													description={t(description)}
													cardMargin={idx === 0 ? "2rem 0 0.923rem 0" : "0.923rem 0"}
													cardAlignItems="center"
													onClickHandler={onClickHandler}
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
							title={t(title)}
							description={t(description)}
							cardMargin={idx === 0 ? "2rem 0 0.923rem 0" : "0.923rem 0"}
							direction="row-reverse"
							cardAlignItems="center"
							onClickHandler={onClickHandler}
							style={{ padding: "0 1rem" }}
						/>
					);
				}
			}
		});
	}, [exploreMoreOptions, isMenuExpanded, t]);

	const exploreButtons = useMemo(
		() => [
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
		],
		[
			bottomSheetCurrentHeight,
			bottomSheetRef,
			isDesktopBrowser,
			onClickMenuItem,
			setBottomSheetHeight,
			setBottomSheetMinHeight,
			t,
			updateUIInfo
		]
	);

	return (
		<Flex direction="column" className="explore-container" gap="0">
			<Flex
				className={`feature-container ${["fr", "es"].includes(currentLanguage) ? "feature-container-baseline" : ""}`}
			>
				{exploreButtons.map((button, index) => (
					<ExploreButton key={index} text={button.text} icon={button.icon} onClick={button.onClick} />
				))}
			</Flex>
			<Flex direction="column" gap="0" className="explore-more-options">
				{renderExploreMoreOptions}
			</Flex>
		</Flex>
	);
};

export default Explore;
