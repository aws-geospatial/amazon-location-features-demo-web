/* Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved. */
/* SPDX-License-Identifier: MIT-0 */

import { FC, MutableRefObject, lazy, useCallback, useEffect, useMemo, useRef, useState } from "react";

import { Flex, View } from "@aws-amplify/ui-react";
import { IconLocateMe, LogoDark, LogoLight } from "@demo/assets/svgs";
import { SearchBox } from "@demo/atomicui/organisms/SearchBox";
import { appConfig } from "@demo/core/constants";
import {
	useAuth,
	useAuthManager,
	useMap,
	useMapManager,
	usePersistedData,
	usePlace,
	useRecordViewPage,
	useRoute,
	useTracker
} from "@demo/hooks";
import useBottomSheet from "@demo/hooks/useBottomSheet";
import useDeviceMediaQuery from "@demo/hooks/useDeviceMediaQuery";
import { MenuItemEnum, ShowStateType } from "@demo/types";
import { MapColorSchemeEnum, MapStyleEnum, ResponsiveUIEnum, TriggeredByEnum } from "@demo/types/Enums";
import { getBoundsFromLineString } from "@demo/utils";
import { errorHandler } from "@demo/utils/errorHandler";
import type { GeolocateControl as GeolocateControlRef } from "maplibre-gl";
import { useTranslation } from "react-i18next";
import {
	AttributionControl,
	GeolocateControl,
	LngLatBoundsLike,
	Map,
	MapRef,
	NavigationControl
} from "react-map-gl/maplibre";
import { RefHandles } from "react-spring-bottom-sheet/dist/types";
import "maplibre-gl/dist/maplibre-gl.css";
import "./styles.scss";

const DemoPlaceholderPage = lazy(() =>
	import("@demo/atomicui/pages/DemoPlaceholderPage").then(module => ({
		default: module.DemoPlaceholderPage
	}))
);
const WelcomeModal = lazy(() =>
	import("@demo/atomicui/molecules/WelcomeModal").then(module => ({
		default: module.WelcomeModal
	}))
);
const MapButtons = lazy(() =>
	import("@demo/atomicui/molecules/MapButtons").then(module => ({
		default: module.MapButtons
	}))
);
const Sidebar = lazy(() =>
	import("@demo/atomicui/organisms/Sidebar").then(module => ({
		default: module.Sidebar
	}))
);
const RouteBox = lazy(() =>
	import("@demo/atomicui/organisms/RouteBox").then(module => ({
		default: module.RouteBox
	}))
);
const UnauthSimulation = lazy(() =>
	import("@demo/atomicui/organisms/UnauthSimulation").then(module => ({
		default: module.UnauthSimulation
	}))
);
const AuthGeofenceBox = lazy(() =>
	import("@demo/atomicui/organisms/AuthGeofenceBox").then(module => ({
		default: module.AuthGeofenceBox
	}))
);
const AuthTrackerBox = lazy(() =>
	import("@demo/atomicui/organisms/AuthTrackerBox").then(module => ({
		default: module.AuthTrackerBox
	}))
);
const ResponsiveBottomSheet = lazy(() =>
	import("@demo/atomicui/organisms/ResponsiveBottomSheet").then(module => ({
		default: module.ResponsiveBottomSheet
	}))
);
const SettingsModal = lazy(() =>
	import("@demo/atomicui/organisms/SettingsModal").then(module => ({
		default: module.SettingsModal
	}))
);
const AboutModal = lazy(() =>
	import("@demo/atomicui/organisms/AboutModal").then(module => ({
		default: module.AboutModal
	}))
);
const FeedbackModal = lazy(() =>
	import("@demo/atomicui/molecules/FeedbackModal").then(module => ({
		default: module.FeedbackModal
	}))
);
const SignInModal = lazy(() =>
	import("@demo/atomicui/molecules/SignInModal").then(module => ({
		default: module.SignInModal
	}))
);
const ConnectAwsAccountModal = lazy(() =>
	import("@demo/atomicui/molecules/ConnectAwsAccountModal").then(module => ({
		default: module.ConnectAwsAccountModal
	}))
);
const UnauthSimulationExitModal = lazy(() =>
	import("@demo/atomicui/molecules/ConfirmationModal").then(module => ({
		default: module.ConfirmationModal
	}))
);

const {
	API_KEYS,
	MAP_RESOURCES: { MAX_BOUNDS, SEARCH_ROUTE_BOUND_OPTIONS },
	LINKS: { AWS_LOCATION },
	ROUTES: { DEMO }
} = appConfig;
const initShow: ShowStateType = {
	sidebar: false,
	routeBox: false,
	signInModal: false,
	connectAwsAccount: false,
	authGeofenceBox: false,
	authTrackerBox: false,
	settings: false,
	stylesCard: false,
	about: false,
	unauthGeofenceBox: false,
	unauthTrackerBox: false,
	unauthSimulationBounds: false,
	unauthSimulationExitModal: false,
	startUnauthSimulation: false,
	openFeedbackModal: false
};

const DemoPage: FC = () => {
	const {} = useRecordViewPage("DemoPage");
	const [show, setShow] = useState<ShowStateType>(initShow);
	const [isUnauthNotifications, setUnauthIsNotifications] = useState(false);
	const [confirmCloseUnauthSimulation, setConfirmCloseUnauthSimulation] = useState(false);
	const [triggerOnClose, setTriggerOnClose] = useState(false);
	const [triggerOnReset, setTriggerOnReset] = useState(false);
	const [expandRouteOptionsMobile, setExpandRouteOptionsMobile] = useState(false);
	const [isEditingAuthRoute, setIsEditingAuthRoute] = useState(false);
	const [startSimulation, setStartSimulation] = useState(false);
	const [searchBoxValue, setSearchBoxValue] = useState("");
	const mapRef = useRef<MapRef | null>(null);
	const geolocateControlRef = useRef<GeolocateControlRef | null>(null);
	const { apiKey, baseValues, userProvidedValues } = useAuth();
	const apiKeyRegion = useMemo(
		() => (baseValues && baseValues.region in API_KEYS ? baseValues.region : Object.keys(API_KEYS)[0]),
		[baseValues]
	);
	const { currentLocationData, viewpoint, mapStyle, mapColorScheme, mapPoliticalView } = useMap();
	const { zoom, setZoom } = usePlace();
	const { routeData, directions } = useRoute();
	const { isEditingRoute } = useTracker();
	const { showWelcomeModal, setShowWelcomeModal, setSettingsOptions } = usePersistedData();
	const { isDesktop, isMobile, isTablet, isMax766 } = useDeviceMediaQuery();
	const { ui, bottomSheetCurrentHeight = 0 } = useBottomSheet();
	const { clearCredsAndClients } = useAuthManager();
	const {
		gridLoader,
		setGridLoader,
		onLoad,
		getCurrentGeoLocation,
		onGeoLocate,
		onGeoLocateError,
		handleMapClick,
		resetAppState
	} = useMapManager({
		mapRef,
		geolocateControlRef,
		isUnauthGeofenceBoxOpen: show.unauthGeofenceBox,
		isUnauthTrackerBoxOpen: show.unauthTrackerBox,
		isAuthGeofenceBoxOpen: show.authGeofenceBox,
		isSettingsOpen: show.settings,
		isRouteBoxOpen: show.routeBox,
		closeRouteBox: () => setShow(s => ({ ...s, routeBox: false })),
		resetAppStateCb: () => setShow(s => ({ ...initShow, stylesCard: s.stylesCard, settings: s.settings }))
	});
	const { t } = useTranslation();
	const geoLocateTopValue = `${bottomSheetCurrentHeight / 13 + 0.59}rem`;

	const isColorSchemeDisabled = useMemo(
		() => [MapStyleEnum.HYBRID, MapStyleEnum.SATELLITE].includes(mapStyle),
		[mapStyle]
	);

	const handlePopState = () => {
		if (isMax766 && window.location.pathname === DEMO) {
			history.go();
		}
	};

	useEffect(() => {
		window.addEventListener("popstate", handlePopState);

		return () => {
			window.removeEventListener("popstate", handlePopState);
		};
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, []);

	useEffect(() => {
		let previousWidth = document.body.clientWidth;

		const resizeObserver = new ResizeObserver(() => {
			const currentWidth = document.body.clientWidth;

			if ((previousWidth < 1024 && currentWidth >= 1024) || (previousWidth >= 1024 && currentWidth < 1024)) {
				window.location.reload();
			}

			previousWidth = currentWidth;
		});

		const handleWindowResize = () => {
			resizeObserver.observe(document.body);
		};

		window.addEventListener("resize", handleWindowResize);

		return () => {
			window.removeEventListener("resize", handleWindowResize);
			resizeObserver.disconnect();
		};
	}, []);

	// TODO: move to useRouteManager
	useEffect(() => {
		if ((show.routeBox || ui === ResponsiveUIEnum.routes) && routeData?.Routes![0]?.Legs) {
			const options = isDesktop
				? SEARCH_ROUTE_BOUND_OPTIONS.DESKTOP
				: isTablet
				? SEARCH_ROUTE_BOUND_OPTIONS.TABLET
				: SEARCH_ROUTE_BOUND_OPTIONS.MOBILE;
			const ls: number[][] = [];

			routeData.Routes[0].Legs.forEach(({ Geometry }) => {
				Geometry?.LineString && Geometry.LineString.length > 0 && ls.push(...Geometry.LineString);
			});

			const bounds = getBoundsFromLineString(ls);
			bounds && mapRef.current?.fitBounds(bounds as [number, number, number, number], options);
		}
	}, [isDesktop, isTablet, routeData, show.routeBox, ui]);

	// TODO: move to useRouteManager
	useEffect(() => {
		if (directions) setShow(s => ({ ...s, routeBox: true }));
	}, [directions, show]);

	const locationError = useMemo(() => !!currentLocationData?.error, [currentLocationData]);

	const searchBoxEl = useCallback(
		(isSimpleSearch = false, bottomSheetRef?: MutableRefObject<RefHandles | null>) => (
			<SearchBox
				mapRef={mapRef}
				value={searchBoxValue}
				setValue={setSearchBoxValue}
				isSideMenuExpanded={show.sidebar}
				onToggleSideMenu={() => setShow(s => ({ ...s, sidebar: !s.sidebar }))}
				setShowRouteBox={b => setShow(s => ({ ...s, routeBox: b }))}
				isRouteBoxOpen={show.routeBox}
				isAuthGeofenceBoxOpen={show.authGeofenceBox}
				isAuthTrackerBoxOpen={show.authTrackerBox}
				isSettingsOpen={show.settings}
				isStylesCardOpen={show.stylesCard}
				isSimpleSearch={isSimpleSearch}
				bottomSheetRef={bottomSheetRef}
			/>
		),
		[
			searchBoxValue,
			setSearchBoxValue,
			show.authGeofenceBox,
			show.authTrackerBox,
			show.routeBox,
			show.settings,
			show.sidebar,
			show.stylesCard
		]
	);

	const _GeolocateControl = useMemo(
		() => (
			<>
				<Flex
					style={{
						display: locationError ? "flex" : "none",
						bottom: isMobile ? `${(bottomSheetCurrentHeight || 0) / 13 + 1.2}rem` : isDesktop ? "9.9rem" : "2rem",
						right: isMobile ? "1rem" : isDesktop ? "2rem" : "2rem"
					}}
					className="location-disabled"
					onClick={() => getCurrentGeoLocation()}
				>
					<IconLocateMe />
				</Flex>
				<GeolocateControl
					ref={geolocateControlRef}
					style={{
						bottom: isMobile ? geoLocateTopValue : isDesktop ? "9.05rem" : "0.55rem",
						right: isMobile ? "0.18rem" : isDesktop ? "1.19rem" : "0.5rem",
						display: show.unauthSimulationBounds || locationError ? "none" : "flex"
					}}
					position="bottom-right"
					positionOptions={{ enableHighAccuracy: true }}
					showUserLocation
					showAccuracyCircle={false}
					onGeolocate={onGeoLocate}
					onError={onGeoLocateError}
				/>
			</>
		),
		[
			locationError,
			isMobile,
			bottomSheetCurrentHeight,
			isDesktop,
			geoLocateTopValue,
			onGeoLocate,
			onGeoLocateError,
			getCurrentGeoLocation,
			show.unauthSimulationBounds
		]
	);

	const UnauthSimulationUI = useMemo(
		() => (
			<UnauthSimulation
				mapRef={mapRef}
				from={show.unauthGeofenceBox ? MenuItemEnum.GEOFENCE : MenuItemEnum.TRACKER}
				setShowUnauthGeofenceBox={b => setShow(s => ({ ...s, unauthGeofenceBox: b }))}
				setShowUnauthTrackerBox={b => setShow(s => ({ ...s, unauthTrackerBox: b }))}
				setShowConnectAwsAccountModal={b => setShow(s => ({ ...s, connectAwsAccount: b }))}
				showStartUnauthSimulation={show.startUnauthSimulation}
				setShowStartUnauthSimulation={b => setShow(s => ({ ...s, startUnauthSimulation: b }))}
				startSimulation={startSimulation}
				setStartSimulation={setStartSimulation}
				setShowUnauthSimulationBounds={b => setShow(s => ({ ...s, unauthSimulationBounds: b }))}
				isNotifications={isUnauthNotifications}
				setIsNotifications={setUnauthIsNotifications}
				confirmCloseSimulation={confirmCloseUnauthSimulation}
				setConfirmCloseSimulation={setConfirmCloseUnauthSimulation}
				geolocateControlRef={geolocateControlRef}
			/>
		),
		[
			confirmCloseUnauthSimulation,
			isUnauthNotifications,
			show.startUnauthSimulation,
			show.unauthGeofenceBox,
			startSimulation
		]
	);

	const handleLogoClick = () =>
		window.open(
			userProvidedValues
				? `https://${userProvidedValues.region}.console.aws.amazon.com/location/home?region=${userProvidedValues.region}#/`
				: AWS_LOCATION,
			userProvidedValues ? "_blank" : "_self"
		);

	return !!apiKeyRegion && !!apiKey ? (
		<View
			style={{ height: "100%" }}
			className={`${mapColorScheme === MapColorSchemeEnum.DARK ? "dark-mode" : "light-mode"}`}
		>
			<Map
				ref={mapRef}
				style={{ width: "100%", height: "100%" }}
				cursor={isEditingRoute ? "crosshair" : ""}
				maxTileCacheSize={100}
				zoom={zoom}
				initialViewState={
					currentLocationData?.currentLocation
						? { ...currentLocationData.currentLocation, zoom }
						: { ...viewpoint, zoom }
				}
				mapStyle={`https://maps.geo.${apiKeyRegion}.amazonaws.com/v2/styles/${mapStyle}/descriptor?key=${apiKey}${
					!isColorSchemeDisabled ? `&color-scheme=${mapColorScheme}` : ""
				}${!!mapPoliticalView ? `&political-view=${mapPoliticalView}` : ""}`}
				minZoom={2}
				maxBounds={
					(show.unauthGeofenceBox || show.unauthTrackerBox) && show.unauthSimulationBounds
						? isDesktop
							? (MAX_BOUNDS.VANCOUVER.DESKTOP as LngLatBoundsLike)
							: isTablet
							? (MAX_BOUNDS.VANCOUVER.TABLET as LngLatBoundsLike)
							: (MAX_BOUNDS.VANCOUVER.MOBILE as LngLatBoundsLike)
						: undefined
				}
				onClick={handleMapClick}
				onLoad={onLoad}
				onZoom={({ viewState }) => setZoom(viewState.zoom)}
				onError={error => errorHandler(error.error)}
				onIdle={() => gridLoader && setGridLoader(false)}
				attributionControl={false}
			>
				<View className={gridLoader ? "loader-container" : ""}>
					{isDesktop && (
						<>
							{show.sidebar && (
								<Sidebar
									onCloseSidebar={() => setShow(s => ({ ...s, sidebar: false }))}
									onOpenConnectAwsAccountModal={() => setShow(s => ({ ...s, connectAwsAccount: true }))}
									onOpenSignInModal={() => setShow(s => ({ ...s, signInModal: true }))}
									onShowSettings={() => setShow(s => ({ ...s, settings: true }))}
									onShowAboutModal={() => setShow(s => ({ ...s, about: true }))}
									onShowAuthGeofenceBox={() => setShow(s => ({ ...s, authGeofenceBox: true }))}
									onShowAuthTrackerBox={() => setShow(s => ({ ...s, authTrackerBox: true }))}
									onShowUnauthGeofenceBox={() => setShow(s => ({ ...s, unauthGeofenceBox: true }))}
									onShowUnauthTrackerBox={() => setShow(s => ({ ...s, unauthTrackerBox: true }))}
									onOpenFeedbackModal={() => setShow(s => ({ ...s, openFeedbackModal: true }))}
								/>
							)}
							{show.routeBox ? (
								<RouteBox
									mapRef={mapRef}
									setShowRouteBox={b => setShow(s => ({ ...s, routeBox: b }))}
									isSideMenuExpanded={show.sidebar}
								/>
							) : show.authGeofenceBox ? (
								<AuthGeofenceBox
									mapRef={mapRef}
									setShowAuthGeofenceBox={b => setShow(s => ({ ...s, authGeofenceBox: b }))}
									isEditingAuthRoute={isEditingAuthRoute}
									setIsEditingAuthRoute={setIsEditingAuthRoute}
								/>
							) : show.authTrackerBox ? (
								<AuthTrackerBox
									mapRef={mapRef}
									setShowAuthTrackerBox={b => setShow(s => ({ ...s, authTrackerBox: b }))}
									clearCredsAndClients={clearCredsAndClients}
								/>
							) : show.unauthGeofenceBox || show.unauthTrackerBox ? (
								UnauthSimulationUI
							) : (
								searchBoxEl()
							)}
						</>
					)}
					{!isDesktop && (
						<ResponsiveBottomSheet
							SearchBoxEl={(ref?: MutableRefObject<RefHandles | null>) => searchBoxEl(true, ref)}
							MapButtons={() => (
								<MapButtons
									renderedUpon={TriggeredByEnum.SETTINGS_MODAL}
									openStylesCard={show.stylesCard}
									setOpenStylesCard={b => setShow(s => ({ ...s, stylesCard: b }))}
									onCloseSidebar={() => setShow(s => ({ ...s, sidebar: false }))}
									onOpenSignInModal={() => setShow(s => ({ ...s, signInModal: true }))}
									onShowGridLoader={() => setShow(s => ({ ...s, gridLoader: true }))}
									isAuthTrackerBoxOpen={show.authTrackerBox}
									isAuthGeofenceBoxOpen={show.authGeofenceBox}
									onSetShowAuthGeofenceBox={(b: boolean) => setShow(s => ({ ...s, authGeofenceBox: b }))}
									onSetShowAuthTrackerBox={(b: boolean) => setShow(s => ({ ...s, authTrackerBox: b }))}
									isUnauthGeofenceBoxOpen={show.unauthGeofenceBox}
									isUnauthTrackerBoxOpen={show.unauthTrackerBox}
									onSetShowUnauthGeofenceBox={(b: boolean) => setShow(s => ({ ...s, unauthGeofenceBox: b }))}
									onSetShowUnauthTrackerBox={(b: boolean) => setShow(s => ({ ...s, unauthTrackerBox: b }))}
									onlyMapStyles
									isHandDevice
								/>
							)}
							mapRef={mapRef}
							RouteBox={(ref?: MutableRefObject<RefHandles | null>) => (
								<RouteBox
									mapRef={mapRef}
									setShowRouteBox={b => setShow(s => ({ ...s, routeBox: b }))}
									isSideMenuExpanded={show.sidebar}
									isDirection={ui === ResponsiveUIEnum.direction_to_routes}
									expandRouteOptionsMobile={expandRouteOptionsMobile}
									setExpandRouteOptionsMobile={setExpandRouteOptionsMobile}
									bottomSheetRef={ref}
								/>
							)}
							isEditingAuthRoute={isEditingAuthRoute}
							onCloseSidebar={() => setShow(s => ({ ...s, sidebar: false }))}
							onOpenConnectAwsAccountModal={() => setShow(s => ({ ...s, connectAwsAccount: true }))}
							onOpenSignInModal={() => setShow(s => ({ ...s, signInModal: true }))}
							onShowSettings={() => {
								setShow(s => ({ ...s, settings: true }));
								isMobile && setSettingsOptions(undefined);
							}}
							onShowAboutModal={() => setShow(s => ({ ...s, about: true }))}
							onShowUnauthGeofenceBox={() => setShow(s => ({ ...s, unauthGeofenceBox: true }))}
							onShowUnauthTrackerBox={() => setShow(s => ({ ...s, unauthTrackerBox: true }))}
							onShowAuthGeofenceBox={() => setShow(s => ({ ...s, authGeofenceBox: true }))}
							onShowAuthTrackerBox={() => setShow(s => ({ ...s, authTrackerBox: true }))}
							setShowUnauthGeofenceBox={b => setShow(s => ({ ...s, unauthGeofenceBox: b }))}
							setShowUnauthTrackerBox={b => setShow(s => ({ ...s, unauthTrackerBox: b }))}
							showStartUnauthSimulation={show.startUnauthSimulation}
							setShowStartUnauthSimulation={b => setShow(s => ({ ...s, startUnauthSimulation: b }))}
							from={show.unauthGeofenceBox ? MenuItemEnum.GEOFENCE : MenuItemEnum.TRACKER}
							show={show}
							setShow={setShow}
							AuthGeofenceBox={
								<AuthGeofenceBox
									mapRef={mapRef}
									setShowAuthGeofenceBox={b => setShow(s => ({ ...s, authGeofenceBox: b }))}
									triggerOnClose={triggerOnClose}
									setTriggerOnClose={setTriggerOnClose}
									triggerOnReset={triggerOnReset}
									setTriggerOnReset={setTriggerOnReset}
									isEditingAuthRoute={isEditingAuthRoute}
									setIsEditingAuthRoute={setIsEditingAuthRoute}
								/>
							}
							AuthTrackerBox={
								<AuthTrackerBox
									mapRef={mapRef}
									setShowAuthTrackerBox={b => setShow(s => ({ ...s, authTrackerBox: b }))}
								/>
							}
							setTriggerOnReset={setTriggerOnReset}
							setTriggerOnClose={setTriggerOnClose}
							handleLogoClick={handleLogoClick}
							startSimulation={startSimulation}
							setStartSimulation={setStartSimulation}
							isNotifications={isUnauthNotifications}
							setIsNotifications={setUnauthIsNotifications}
							confirmCloseSimulation={confirmCloseUnauthSimulation}
							setConfirmCloseSimulation={setConfirmCloseUnauthSimulation}
							setShowAuthTrackerBox={b => setShow(s => ({ ...s, authTrackerBox: b }))}
							setShowAuthGeofenceBox={b => setShow(s => ({ ...s, authGeofenceBox: b }))}
							setShowRouteBox={b => setShow(s => ({ ...s, routeBox: b }))}
							isExpandRouteOptionsMobile={expandRouteOptionsMobile}
							setExpandRouteOptionsMobile={setExpandRouteOptionsMobile}
							setSearchBoxValue={setSearchBoxValue}
							onOpenFeedbackModal={() => setShow(s => ({ ...s, openFeedbackModal: true }))}
							geolocateControlRef={geolocateControlRef}
							setShowUnauthSimulationBounds={b => setShow(s => ({ ...s, unauthSimulationBounds: b }))}
						/>
					)}
					{isDesktop && (
						<MapButtons
							renderedUpon={TriggeredByEnum.DEMO_PAGE}
							openStylesCard={show.stylesCard}
							setOpenStylesCard={b => setShow(s => ({ ...s, stylesCard: b }))}
							onCloseSidebar={() => setShow(s => ({ ...s, sidebar: false }))}
							onOpenSignInModal={() => setShow(s => ({ ...s, signInModal: true }))}
							onShowGridLoader={() => setShow(s => ({ ...s, gridLoader: true }))}
							isAuthGeofenceBoxOpen={show.authGeofenceBox}
							onSetShowAuthGeofenceBox={(b: boolean) => setShow(s => ({ ...s, authGeofenceBox: b }))}
							isAuthTrackerBoxOpen={show.authTrackerBox}
							onSetShowAuthTrackerBox={(b: boolean) => setShow(s => ({ ...s, authTrackerBox: b }))}
							isUnauthGeofenceBoxOpen={show.unauthGeofenceBox}
							isUnauthTrackerBoxOpen={show.unauthTrackerBox}
							onSetShowUnauthGeofenceBox={(b: boolean) => setShow(s => ({ ...s, unauthGeofenceBox: b }))}
							onSetShowUnauthTrackerBox={(b: boolean) => setShow(s => ({ ...s, unauthTrackerBox: b }))}
						/>
					)}
					{isDesktop && <NavigationControl position="bottom-right" showZoom showCompass={false} />}
					{_GeolocateControl}
				</View>
				<AttributionControl
					style={
						isDesktop
							? {
									color: mapColorScheme === MapColorSchemeEnum.DARK ? "var(--white-color)" : "var(--black-color)",
									backgroundColor:
										mapColorScheme === MapColorSchemeEnum.DARK ? "rgba(0, 0, 0, 0.2)" : "var(--white-color)"
							  }
							: { display: "none" }
					}
					compact={true}
				/>
			</Map>
			<WelcomeModal open={showWelcomeModal} onClose={() => setShowWelcomeModal(false)} />
			<SignInModal open={show.signInModal} onClose={() => setShow(s => ({ ...s, signInModal: false }))} />
			<ConnectAwsAccountModal
				open={show.connectAwsAccount}
				onClose={() => setShow(s => ({ ...s, connectAwsAccount: false }))}
			/>
			<FeedbackModal open={show.openFeedbackModal} onClose={() => setShow(s => ({ ...s, openFeedbackModal: false }))} />
			<SettingsModal
				open={show.settings}
				onClose={() => {
					setShow(s => ({ ...s, settings: false }));
				}}
				resetAppState={resetAppState}
				mapButtons={
					<MapButtons
						renderedUpon={TriggeredByEnum.SETTINGS_MODAL}
						openStylesCard={show.stylesCard}
						setOpenStylesCard={b => setShow(s => ({ ...s, stylesCard: b }))}
						onCloseSidebar={() => setShow(s => ({ ...s, sidebar: false }))}
						onOpenSignInModal={() => setShow(s => ({ ...s, signInModal: true }))}
						onShowGridLoader={() => setGridLoader(true)}
						onlyMapStyles
						isAuthGeofenceBoxOpen={show.authGeofenceBox}
						onSetShowAuthGeofenceBox={(b: boolean) => setShow(s => ({ ...s, authGeofenceBox: b }))}
						isAuthTrackerBoxOpen={show.authTrackerBox}
						isSettingsModal
						onSetShowAuthTrackerBox={(b: boolean) => setShow(s => ({ ...s, authTrackerBox: b }))}
						isUnauthGeofenceBoxOpen={show.unauthGeofenceBox}
						isUnauthTrackerBoxOpen={show.unauthTrackerBox}
						onSetShowUnauthGeofenceBox={(b: boolean) => setShow(s => ({ ...s, unauthGeofenceBox: b }))}
						onSetShowUnauthTrackerBox={(b: boolean) => setShow(s => ({ ...s, unauthTrackerBox: b }))}
					/>
				}
			/>
			<AboutModal open={show.about} onClose={() => setShow(s => ({ ...s, about: false }))} />
			<UnauthSimulationExitModal
				open={show.unauthSimulationExitModal}
				onClose={() => setShow(s => ({ ...s, unauthSimulationExitModal: false }))}
				heading={t("start_unauth_simulation__exit_simulation.text")}
				description={t("start_unauth_simulation__exit_modal_desc.text")}
				confirmationText={t("start_unauth_simulation__exit_simulation.text")}
				onConfirm={() => {
					setShow(s => ({
						...s,
						unauthSimulationExitModal: false,
						unauthGeofenceBox: false,
						unauthTrackerBox: false
					}));
				}}
				cancelationText={t("start_unauth_simulation__stay_in_simulation.text")}
			/>
			{(isDesktop || isTablet) && (
				<Flex
					className={`logo-stroke-container ${isTablet ? "logo-stroke-container-tablet" : ""}`}
					onClick={handleLogoClick}
				>
					{mapColorScheme === MapColorSchemeEnum.DARK ? <LogoDark /> : <LogoLight />}
				</Flex>
			)}
		</View>
	) : (
		<DemoPlaceholderPage value={searchBoxValue} setValue={setSearchBoxValue} show={show} />
	);
};

export default DemoPage;
