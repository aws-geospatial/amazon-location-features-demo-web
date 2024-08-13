/* Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved. */
/* SPDX-License-Identifier: MIT-0 */

import { FC, MutableRefObject, lazy, useCallback, useEffect, useMemo, useRef, useState } from "react";

import { Flex, Text, View } from "@aws-amplify/ui-react";
import { IconLocateMe, LogoDark, LogoLight } from "@demo/assets/svgs";
import { SearchBox } from "@demo/atomicui/organisms/SearchBox";
import { appConfig } from "@demo/core/constants";
import BottomSheetHeights from "@demo/core/constants/bottomSheetHeights";
import {
	useAuth,
	useCredsManager,
	useGeofence,
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
import { GrabMapEnum, MapProviderEnum, MapStyleFilterTypes, MenuItemEnum, ShowStateType } from "@demo/types";
import { ResponsiveUIEnum, TriggeredByEnum } from "@demo/types/Enums";
import { errorHandler } from "@demo/utils/errorHandler";
import { Signer } from "aws-amplify";
import { LngLatBoundsLike } from "mapbox-gl";
import { useTranslation } from "react-i18next";
import {
	AttributionControl,
	GeolocateControl,
	GeolocateControlRef,
	Map,
	MapRef,
	NavigationControl
} from "react-map-gl";
import { RefHandles } from "react-spring-bottom-sheet/dist/types";
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
const GrabConfirmationModal = lazy(() =>
	import("@demo/atomicui/molecules/GrabConfirmationModal").then(module => ({
		default: module.GrabConfirmationModal
	}))
);
const OpenDataConfirmationModal = lazy(() =>
	import("@demo/atomicui/molecules/OpenDataConfirmationModal").then(module => ({
		default: module.OpenDataConfirmationModal
	}))
);
const ConnectAwsAccountModal = lazy(() =>
	import("@demo/atomicui/molecules/ConnectAwsAccountModal").then(module => ({
		default: module.ConnectAwsAccountModal
	}))
);
const TrackerInformationModal = lazy(() =>
	import("@demo/atomicui/molecules/ConfirmationModal").then(module => ({
		default: module.ConfirmationModal
	}))
);
const UnauthSimulationDisclaimerModal = lazy(() =>
	import("@demo/atomicui/molecules/ConfirmationModal").then(module => ({
		default: module.ConfirmationModal
	}))
);
const UnauthSimulationExitModal = lazy(() =>
	import("@demo/atomicui/molecules/ConfirmationModal").then(module => ({
		default: module.ConfirmationModal
	}))
);

const {
	MAP_RESOURCES: { MAX_BOUNDS },
	LINKS: { AMAZON_LOCATION_TERMS_AND_CONDITIONS, AWS_LOCATION }
} = appConfig;
const initShow = {
	sidebar: false,
	routeBox: false,
	signInModal: false,
	connectAwsAccount: false,
	authGeofenceBox: false,
	authTrackerBox: false,
	settings: false,
	stylesCard: false,
	authTrackerDisclaimerModal: false,
	about: false,
	unauthGeofenceBox: false,
	unauthTrackerBox: false,
	unauthSimulationBounds: false,
	unauthSimulationDisclaimerModal: false,
	unauthSimulationExitModal: false,
	startUnauthSimulation: false,
	openFeedbackModal: false
};
const peggedRemValue = 13;
const extraGeoLocateTop = 2.6;

const DemoPage: FC = () => {
	const {} = useRecordViewPage("DemoPage");
	const [show, setShow] = useState<ShowStateType>(initShow);
	const [isUnauthNotifications, setUnauthIsNotifications] = useState(false);
	const [confirmCloseUnauthSimulation, setConfirmCloseUnauthSimulation] = useState(false);
	const [searchValue, setSearchValue] = useState("");
	const [triggerOnClose, setTriggerOnClose] = useState(false);
	const [triggerOnReset, setTriggerOnReset] = useState(false);
	const [expandRouteOptionsMobile, setExpandRouteOptionsMobile] = useState(false);
	const [isEditingAuthRoute, setIsEditingAuthRoute] = useState(false);
	const [selectedFilters, setSelectedFilters] = useState<MapStyleFilterTypes>({
		Providers: [],
		Attribute: [],
		Type: []
	});
	const [startSimulation, setStartSimulation] = useState(false);
	const [searchBoxValue, setSearchBoxValue] = useState("");
	const mapViewRef = useRef<MapRef | null>(null);
	const geolocateControlRef = useRef<GeolocateControlRef | null>(null);
	const { credentials, region, isUserAwsAccountConnected } = useAuth();
	const {
		mapProvider: currentMapProvider,
		mapStyle: currentMapStyle,
		currentLocationData,
		setMapProvider,
		isCurrentLocationDisabled,
		viewpoint
	} = useMap();
	const { selectedMarker, suggestions, bound, clearPoiList, zoom, setZoom } = usePlace();
	const { routeData, directions, resetStore: resetRouteStore } = useRoute();
	const { resetStore: resetGeofenceStore } = useGeofence();
	const { isEditingRoute, resetStore: resetTrackerStore } = useTracker();
	const { showWelcomeModal, setShowWelcomeModal, setSettingsOptions } = usePersistedData();
	const { isDesktop, isMobile, isTablet } = useDeviceMediaQuery();
	const { setUI, ui, bottomSheetCurrentHeight = 0, setBottomSheetHeight, setBottomSheetMinHeight } = useBottomSheet();
	const { clearCredsAndClients } = useCredsManager();
	const {
		gridLoader,
		setGridLoader,
		tempMapStyle,
		setTempMapStyle,
		grabDisclaimerModal,
		setGrabDisclaimerModal,
		// doNotAskGrabDisclaimer,
		setDoNotAskGrabDisclaimer,
		openDataDisclaimerModal,
		setOpenDataDisclaimerModal,
		// doNotAskOpenDataDisclaimer,
		setDoNotAskOpenDataDisclaimer,
		isGrabVisible,
		onLoad,
		getCurrentGeoLocation,
		onGeoLocate,
		onGeoLocateError,
		handleMapClick,
		handleCurrentLocationAndViewpoint,
		handleOpenDataMapChange,
		resetAppState,
		handleGrabMapChange,
		onMapProviderChange,
		onMapStyleChange
	} = useMapManager({
		mapViewRef,
		geolocateControlRef,
		isUnauthGeofenceBoxOpen: show.unauthGeofenceBox,
		isUnauthTrackerBoxOpen: show.unauthTrackerBox,
		isAuthGeofenceBoxOpen: show.authGeofenceBox,
		isSettingsOpen: show.settings,
		isRouteBoxOpen: show.routeBox,
		closeRouteBox: () => setShow(s => ({ ...s, routeBox: false })),
		resetAppStateCb: () => setShow(s => ({ ...initShow, stylesCard: s.stylesCard, settings: s.settings })),
		setUnauthSimulationExitModal: (b: boolean) => setShow(s => ({ ...s, unauthSimulationExitModal: b }))
	});
	const { t, i18n } = useTranslation();
	const langDir = i18n.dir();
	const isLtr = langDir === "ltr";
	const geoLocateTopValue = `-${bottomSheetCurrentHeight / peggedRemValue + extraGeoLocateTop}rem`;

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

	const handleResetCallback = useCallback(
		function handleReset() {
			setSearchValue("");
			setSelectedFilters({ Providers: [], Attribute: [], Type: [] });
		},
		[setSearchValue, setSelectedFilters]
	);

	useEffect(() => {
		if (selectedMarker) {
			const { longitude: lng, latitude: lat } = viewpoint;
			mapViewRef?.current?.setCenter({ lat, lng });
		}
	}, [selectedMarker, viewpoint]);

	useEffect(() => {
		const options = isDesktop
			? {
					padding: {
						top: 200,
						bottom: 200,
						left: 450,
						right: 200
					},
					speed: 5,
					linear: true
			  }
			: isTablet
			? {
					padding: {
						top: 100,
						bottom: 100,
						left: 400,
						right: 100
					},
					speed: 5,
					linear: true
			  }
			: {
					padding: {
						top: 100,
						bottom: 400,
						left: 100,
						right: 100
					},
					speed: 5,
					linear: true
			  };

		if (suggestions && bound) {
			mapViewRef.current?.fitBounds(bound as [number, number, number, number], options);
		} else if ((show.routeBox || ui === ResponsiveUIEnum.routes) && routeData?.Summary?.RouteBBox) {
			const boundingBox = routeData.Summary.RouteBBox;
			mapViewRef.current?.fitBounds(
				[
					[boundingBox[0], boundingBox[1]],
					[boundingBox[2], boundingBox[3]]
				],
				options
			);
		}
	}, [suggestions, bound, show.routeBox, ui, routeData, isDesktop, isTablet, currentMapProvider, currentMapStyle]);

	useEffect(() => {
		if (directions) setShow(s => ({ ...s, routeBox: true }));
	}, [directions, show]);

	const onEnableTracking = () => {
		clearPoiList();
		resetRouteStore();
		resetGeofenceStore();
		resetTrackerStore();
		setShow(s => ({ ...s, authTrackerDisclaimerModal: false, authTrackerBox: true }));
		if (!isDesktop) {
			setUI(ResponsiveUIEnum.auth_tracker);
			setBottomSheetMinHeight(window.innerHeight / 2);
			setBottomSheetHeight(window.innerHeight);
			setTimeout(() => setBottomSheetMinHeight(BottomSheetHeights.explore.min), 300);
		}
	};

	const locationError = useMemo(() => !!currentLocationData?.error, [currentLocationData]);

	const transformRequest = useCallback(
		(url: string, resourceType: string) => {
			let newUrl = url;

			if (resourceType === "Style" && !newUrl.includes("://") && region) {
				newUrl = `https://maps.geo.${region}.amazonaws.com/maps/v0/maps/${newUrl}/style-descriptor`;
			}

			if (newUrl.includes("amazonaws.com")) {
				return {
					url: Signer.signUrl(newUrl, {
						access_key: credentials?.accessKeyId,
						secret_key: credentials?.secretAccessKey,
						session_token: credentials?.sessionToken
					})
				};
			}

			return { url: newUrl };
		},
		[region, credentials]
	);

	const searchBoxEl = useCallback(
		(isSimpleSearch = false, bottomSheetRef?: MutableRefObject<RefHandles | null>) => (
			<SearchBox
				mapRef={mapViewRef?.current}
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

	const GeoLocateIcon = useMemo(
		() =>
			locationError || isCurrentLocationDisabled ? (
				<Flex
					style={{
						position: "absolute",
						bottom: isMobile ? `${(bottomSheetCurrentHeight || 0) / 13 + 1.2}rem` : isDesktop ? "9.85rem" : "2rem",
						right: isMobile ? "1rem" : isDesktop ? "2rem" : "2rem"
					}}
					className="location-disabled"
					onClick={() => getCurrentGeoLocation()}
				>
					<IconLocateMe />
				</Flex>
			) : (
				<GeolocateControl
					style={{
						width: "2.46rem",
						height: "2.46rem",
						position: "absolute",
						top: isMobile ? geoLocateTopValue : isDesktop ? "-9.5rem" : "-2.5rem",
						right: isMobile ? "-0.3rem" : isDesktop ? "0.75rem" : "0rem",
						margin: 0,
						borderRadius: "0.62rem",
						display: show.unauthSimulationBounds ? "none" : "block"
					}}
					position="bottom-right"
					ref={geolocateControlRef}
					positionOptions={{ enableHighAccuracy: true }}
					showUserLocation
					showAccuracyCircle={false}
					onGeolocate={onGeoLocate}
					onError={onGeoLocateError}
				/>
			),
		[
			locationError,
			isCurrentLocationDisabled,
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
				mapRef={mapViewRef?.current}
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
			isUserAwsAccountConnected && region
				? `https://${region}.console.aws.amazon.com/location/home?region=${region}#/`
				: AWS_LOCATION,
			"_blank"
		);

	return !!credentials ? (
		<View
			style={{ height: "100%" }}
			className={`${currentMapStyle.toLowerCase().includes("dark") ? "dark-mode" : "light-mode"}`}
		>
			<Map
				style={{ width: "100%", height: "100%" }}
				ref={mapViewRef}
				cursor={isEditingRoute ? "crosshair" : ""}
				maxTileCacheSize={100}
				zoom={zoom}
				initialViewState={
					currentLocationData?.currentLocation && !isCurrentLocationDisabled
						? { ...currentLocationData.currentLocation, zoom }
						: { ...viewpoint, zoom }
				}
				mapStyle={currentMapStyle}
				minZoom={2}
				maxBounds={
					currentMapProvider === MapProviderEnum.GRAB
						? (MAX_BOUNDS.GRAB as LngLatBoundsLike)
						: (show.unauthGeofenceBox || show.unauthTrackerBox) && show.unauthSimulationBounds
						? isDesktop
							? (MAX_BOUNDS.VANCOUVER.DESKTOP as LngLatBoundsLike)
							: isTablet
							? (MAX_BOUNDS.VANCOUVER.TABLET as LngLatBoundsLike)
							: (MAX_BOUNDS.VANCOUVER.MOBILE as LngLatBoundsLike)
						: (MAX_BOUNDS.DEFAULT as LngLatBoundsLike)
				}
				onClick={handleMapClick}
				onLoad={onLoad}
				onZoom={({ viewState }) => setZoom(viewState.zoom)}
				onError={error => errorHandler(error.error)}
				onIdle={() => gridLoader && setGridLoader(false)}
				transformRequest={transformRequest}
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
									onShowAuthTrackerDisclaimerModal={() => setShow(s => ({ ...s, authTrackerDisclaimerModal: true }))}
									onShowAuthTrackerBox={() => setShow(s => ({ ...s, authTrackerBox: true }))}
									onShowUnauthSimulationDisclaimerModal={() =>
										setShow(s => ({ ...s, unauthSimulationDisclaimerModal: true }))
									}
									onShowUnauthGeofenceBox={() => setShow(s => ({ ...s, unauthGeofenceBox: true }))}
									onShowUnauthTrackerBox={() => setShow(s => ({ ...s, unauthTrackerBox: true }))}
									onOpenFeedbackModal={() => setShow(s => ({ ...s, openFeedbackModal: true }))}
								/>
							)}
							{show.routeBox ? (
								<RouteBox
									mapRef={mapViewRef?.current}
									setShowRouteBox={b => setShow(s => ({ ...s, routeBox: b }))}
									isSideMenuExpanded={show.sidebar}
								/>
							) : show.authGeofenceBox ? (
								<AuthGeofenceBox
									mapRef={mapViewRef?.current}
									setShowAuthGeofenceBox={b => setShow(s => ({ ...s, authGeofenceBox: b }))}
									isEditingAuthRoute={isEditingAuthRoute}
									setIsEditingAuthRoute={setIsEditingAuthRoute}
								/>
							) : show.authTrackerBox ? (
								<AuthTrackerBox
									mapRef={mapViewRef?.current}
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
							MapButtons={(ref?: MutableRefObject<RefHandles | null>) => (
								<MapButtons
									renderedUpon={TriggeredByEnum.SETTINGS_MODAL}
									openStylesCard={show.stylesCard}
									setOpenStylesCard={b => setShow(s => ({ ...s, stylesCard: b }))}
									onCloseSidebar={() => setShow(s => ({ ...s, sidebar: false }))}
									onOpenSignInModal={() => setShow(s => ({ ...s, signInModal: true }))}
									isGrabVisible={isGrabVisible}
									showGrabDisclaimerModal={grabDisclaimerModal}
									showOpenDataDisclaimerModal={openDataDisclaimerModal}
									onShowGridLoader={() => setShow(s => ({ ...s, gridLoader: true }))}
									handleMapStyleChange={onMapStyleChange}
									searchValue={searchValue}
									setSearchValue={setSearchValue}
									selectedFilters={selectedFilters}
									setSelectedFilters={setSelectedFilters}
									handleMapProviderChange={onMapProviderChange}
									isAuthTrackerBoxOpen={show.authTrackerBox}
									isAuthTrackerDisclaimerModalOpen={show.authTrackerDisclaimerModal}
									onShowAuthTrackerDisclaimerModal={() => setShow(s => ({ ...s, authTrackerDisclaimerModal: true }))}
									isAuthGeofenceBoxOpen={show.authGeofenceBox}
									onSetShowAuthGeofenceBox={(b: boolean) => setShow(s => ({ ...s, authGeofenceBox: b }))}
									onSetShowAuthTrackerBox={(b: boolean) => setShow(s => ({ ...s, authTrackerBox: b }))}
									onShowUnauthSimulationDisclaimerModal={() =>
										setShow(s => ({ ...s, unauthSimulationDisclaimerModal: true }))
									}
									isUnauthGeofenceBoxOpen={show.unauthGeofenceBox}
									isUnauthTrackerBoxOpen={show.unauthTrackerBox}
									onSetShowUnauthGeofenceBox={(b: boolean) => setShow(s => ({ ...s, unauthGeofenceBox: b }))}
									onSetShowUnauthTrackerBox={(b: boolean) => setShow(s => ({ ...s, unauthTrackerBox: b }))}
									onlyMapStyles
									isHandDevice
									bottomSheetRef={ref}
								/>
							)}
							mapRef={mapViewRef?.current}
							RouteBox={(ref?: MutableRefObject<RefHandles | null>) => (
								<RouteBox
									mapRef={mapViewRef?.current}
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
							onShowTrackingDisclaimerModal={() => setShow(s => ({ ...s, authTrackerDisclaimerModal: true }))}
							onShowAboutModal={() => setShow(s => ({ ...s, about: true }))}
							onShowUnauthGeofenceBox={() => setShow(s => ({ ...s, unauthGeofenceBox: true }))}
							onShowUnauthTrackerBox={() => setShow(s => ({ ...s, unauthTrackerBox: true }))}
							onShowAuthGeofenceBox={() => setShow(s => ({ ...s, authGeofenceBox: true }))}
							onShowAuthTrackerBox={() => setShow(s => ({ ...s, authTrackerBox: true }))}
							onshowUnauthSimulationDisclaimerModal={() =>
								setShow(s => ({ ...s, unauthSimulationDisclaimerModal: true }))
							}
							setShowUnauthGeofenceBox={b => setShow(s => ({ ...s, unauthGeofenceBox: b }))}
							setShowUnauthTrackerBox={b => setShow(s => ({ ...s, unauthTrackerBox: b }))}
							showStartUnauthSimulation={show.startUnauthSimulation}
							setShowStartUnauthSimulation={b => setShow(s => ({ ...s, startUnauthSimulation: b }))}
							from={show.unauthGeofenceBox ? MenuItemEnum.GEOFENCE : MenuItemEnum.TRACKER}
							show={show}
							setShow={setShow}
							AuthGeofenceBox={
								<AuthGeofenceBox
									mapRef={mapViewRef?.current}
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
									mapRef={mapViewRef?.current}
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
							clearCredsAndClients={clearCredsAndClients}
							setShowAuthGeofenceBox={b => setShow(s => ({ ...s, authGeofenceBox: b }))}
							setShowRouteBox={b => setShow(s => ({ ...s, routeBox: b }))}
							isExpandRouteOptionsMobile={expandRouteOptionsMobile}
							setExpandRouteOptionsMobile={setExpandRouteOptionsMobile}
							setSearchBoxValue={setSearchBoxValue}
							onOpenFeedbackModal={() => setShow(s => ({ ...s, openFeedbackModal: true }))}
							geolocateControlRef={geolocateControlRef}
						/>
					)}
					{isDesktop && (
						<MapButtons
							renderedUpon={TriggeredByEnum.DEMO_PAGE}
							openStylesCard={show.stylesCard}
							setOpenStylesCard={b => setShow(s => ({ ...s, stylesCard: b }))}
							onCloseSidebar={() => setShow(s => ({ ...s, sidebar: false }))}
							onOpenSignInModal={() => setShow(s => ({ ...s, signInModal: true }))}
							isGrabVisible={isGrabVisible}
							showGrabDisclaimerModal={grabDisclaimerModal}
							showOpenDataDisclaimerModal={openDataDisclaimerModal}
							onShowGridLoader={() => setShow(s => ({ ...s, gridLoader: true }))}
							handleMapStyleChange={onMapStyleChange}
							searchValue={searchValue}
							setSearchValue={setSearchValue}
							selectedFilters={selectedFilters}
							setSelectedFilters={setSelectedFilters}
							resetSearchAndFilters={handleResetCallback}
							isAuthGeofenceBoxOpen={show.authGeofenceBox}
							onSetShowAuthGeofenceBox={(b: boolean) => setShow(s => ({ ...s, authGeofenceBox: b }))}
							isAuthTrackerDisclaimerModalOpen={show.authTrackerDisclaimerModal}
							isAuthTrackerBoxOpen={show.authTrackerBox}
							onShowAuthTrackerDisclaimerModal={() => setShow(s => ({ ...s, authTrackerDisclaimerModal: true }))}
							onSetShowAuthTrackerBox={(b: boolean) => setShow(s => ({ ...s, authTrackerBox: b }))}
							onShowUnauthSimulationDisclaimerModal={() =>
								setShow(s => ({ ...s, unauthSimulationDisclaimerModal: true }))
							}
							isUnauthGeofenceBoxOpen={show.unauthGeofenceBox}
							isUnauthTrackerBoxOpen={show.unauthTrackerBox}
							onSetShowUnauthGeofenceBox={(b: boolean) => setShow(s => ({ ...s, unauthGeofenceBox: b }))}
							onSetShowUnauthTrackerBox={(b: boolean) => setShow(s => ({ ...s, unauthTrackerBox: b }))}
						/>
					)}
					{GeoLocateIcon}
					{isDesktop && (
						<NavigationControl
							style={{
								width: "2.46rem",
								height: "4.92rem",
								position: "absolute",
								top: "-6rem",
								right: "0.75rem",
								margin: 0,
								borderRadius: "0.62rem"
							}}
							position="bottom-right"
							showZoom
							showCompass={false}
						/>
					)}
				</View>
				<AttributionControl
					style={
						isDesktop
							? {
									display: "flex",
									fontSize: "0.77rem",
									color: currentMapStyle.toLowerCase().includes("dark") ? "var(--white-color)" : "var(--black-color)",
									backgroundColor: currentMapStyle.toLowerCase().includes("dark")
										? "rgba(0, 0, 0, 0.2)"
										: "var(--white-color)",
									border: "0px solid none",
									marginTop: "0rem",
									marginBottom: "0rem"
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
				handleCurrentLocationAndViewpoint={handleCurrentLocationAndViewpoint}
			/>
			<FeedbackModal open={show.openFeedbackModal} onClose={() => setShow(s => ({ ...s, openFeedbackModal: false }))} />
			<SettingsModal
				open={show.settings}
				onClose={() => {
					handleResetCallback();
					setShow(s => ({ ...s, settings: false }));
				}}
				resetAppState={resetAppState}
				isGrabVisible={isGrabVisible}
				handleMapProviderChange={onMapProviderChange}
				handleCurrentLocationAndViewpoint={handleCurrentLocationAndViewpoint}
				resetSearchAndFilters={handleResetCallback}
				mapButtons={
					<MapButtons
						renderedUpon={TriggeredByEnum.SETTINGS_MODAL}
						openStylesCard={show.stylesCard}
						setOpenStylesCard={b => setShow(s => ({ ...s, stylesCard: b }))}
						onCloseSidebar={() => setShow(s => ({ ...s, sidebar: false }))}
						onOpenSignInModal={() => setShow(s => ({ ...s, signInModal: true }))}
						isGrabVisible={isGrabVisible}
						showGrabDisclaimerModal={grabDisclaimerModal}
						showOpenDataDisclaimerModal={openDataDisclaimerModal}
						onShowGridLoader={() => setGridLoader(true)}
						handleMapStyleChange={onMapStyleChange}
						searchValue={searchValue}
						setSearchValue={setSearchValue}
						selectedFilters={selectedFilters}
						setSelectedFilters={setSelectedFilters}
						onlyMapStyles
						isAuthGeofenceBoxOpen={show.authGeofenceBox}
						onSetShowAuthGeofenceBox={(b: boolean) => setShow(s => ({ ...s, authGeofenceBox: b }))}
						isAuthTrackerDisclaimerModalOpen={show.authTrackerDisclaimerModal}
						isAuthTrackerBoxOpen={show.authTrackerBox}
						isSettingsModal
						onShowAuthTrackerDisclaimerModal={() => setShow(s => ({ ...s, authTrackerDisclaimerModal: true }))}
						onSetShowAuthTrackerBox={(b: boolean) => setShow(s => ({ ...s, authTrackerBox: b }))}
						onShowUnauthSimulationDisclaimerModal={() =>
							setShow(s => ({ ...s, unauthSimulationDisclaimerModal: true }))
						}
						isUnauthGeofenceBoxOpen={show.unauthGeofenceBox}
						isUnauthTrackerBoxOpen={show.unauthTrackerBox}
						onSetShowUnauthGeofenceBox={(b: boolean) => setShow(s => ({ ...s, unauthGeofenceBox: b }))}
						onSetShowUnauthTrackerBox={(b: boolean) => setShow(s => ({ ...s, unauthTrackerBox: b }))}
					/>
				}
			/>
			<AboutModal open={show.about} onClose={() => setShow(s => ({ ...s, about: false }))} />
			<TrackerInformationModal
				open={show.authTrackerDisclaimerModal}
				onClose={() => setShow(s => ({ ...s, authTrackerDisclaimerModal: false }))}
				heading={t("tracker_info_modal__heading.text") as string}
				description={
					<Text
						className={`regular-text ${isLtr ? "ltr" : "rtl"}`}
						variation="tertiary"
						marginTop="1.23rem"
						textAlign="center"
						whiteSpace="pre-line"
					>
						{t("tracker_info_modal__desc.text")}{" "}
						<a
							style={{ cursor: "pointer", color: "var(--primary-color)" }}
							href={AMAZON_LOCATION_TERMS_AND_CONDITIONS}
							target="_blank"
							rel="noreferrer"
						>
							{t("t&c.text")}
						</a>
					</Text>
				}
				onConfirm={onEnableTracking}
				hideCancelButton
			/>
			<OpenDataConfirmationModal
				open={openDataDisclaimerModal}
				onClose={() => {
					setOpenDataDisclaimerModal(false);
					setTempMapStyle(undefined);
					setMapProvider(currentMapProvider);
				}}
				onConfirm={() => setTimeout(() => handleOpenDataMapChange(), 0)}
				showDoNotAskAgainCheckbox
				onConfirmationCheckboxOnChange={setDoNotAskOpenDataDisclaimer}
			/>
			<GrabConfirmationModal
				open={grabDisclaimerModal}
				onClose={() => {
					setGrabDisclaimerModal(false);
					setTempMapStyle(undefined);
					setMapProvider(currentMapProvider);
				}}
				onConfirm={() => {
					(show.unauthGeofenceBox || show.unauthTrackerBox) &&
						setShow(s => ({ ...s, unauthGeofenceBox: false, unauthTrackerBox: false }));
					setTimeout(() => handleGrabMapChange(), 0);
				}}
				showDoNotAskAgainCheckbox
				onConfirmationCheckboxOnChange={setDoNotAskGrabDisclaimer}
			/>
			<UnauthSimulationDisclaimerModal
				open={show.unauthSimulationDisclaimerModal}
				onClose={() => setShow(s => ({ ...s, unauthSimulationDisclaimerModal: false }))}
				heading={t("unauth_simulation__disclaimer_modal_heading.text")}
				description={t("unauth_simulation__disclaimer_modal_desc.text")}
				confirmationText={t("unauth_simulation__disclaimer_modal_confirmation.text")}
				onConfirm={() => onMapProviderChange(MapProviderEnum.ESRI, TriggeredByEnum.UNAUTH_SIMULATION_MODULE)}
			/>
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
					setTimeout(() => {
						handleGrabMapChange(tempMapStyle as GrabMapEnum);
						window.location.reload();
					}, 0);
				}}
				cancelationText={t("start_unauth_simulation__stay_in_simulation.text")}
			/>
			{(isDesktop || isTablet) && (
				<Flex
					className={`logo-stroke-container ${isTablet ? "logo-stroke-container-tablet" : ""}`}
					onClick={handleLogoClick}
				>
					{currentMapStyle.toLowerCase().includes("dark") ? <LogoDark /> : <LogoLight />}
				</Flex>
			)}
		</View>
	) : (
		<DemoPlaceholderPage
			value={searchBoxValue}
			setValue={setSearchBoxValue}
			searchValue={searchValue}
			selectedFilters={selectedFilters}
			show={show}
			isGrabVisible={isGrabVisible}
		/>
	);
};

export default DemoPage;
