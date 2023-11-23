/* Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved. */
/* SPDX-License-Identifier: MIT-0 */

import React, { useCallback, useEffect, useMemo, useRef } from "react";

import { Flex, Text, View } from "@aws-amplify/ui-react";
import { IconLocateMe, LogoDark, LogoLight } from "@demo/assets";
import {
	ConnectAwsAccountModal,
	FeedbackModal,
	GrabConfirmationModal,
	MapButtons,
	OpenDataConfirmationModal,
	SignInModal,
	ConfirmationModal as TrackerInformationModal,
	ConfirmationModal as UnauthSimulationDisclaimerModal,
	ConfirmationModal as UnauthSimulationExitModal,
	WelcomeModal
} from "@demo/atomicui/molecules";
import {
	AboutModal,
	AuthGeofenceBox,
	AuthTrackerBox,
	ResponsiveBottomSheet,
	RouteBox,
	SearchBox,
	SettingsModal,
	Sidebar,
	UnauthSimulation
} from "@demo/atomicui/organisms";
import { DemoPlaceholderPage } from "@demo/atomicui/pages";
import { showToast } from "@demo/core";
import { appConfig, regionsData } from "@demo/core/constants";
import BottomSheetHeights from "@demo/core/constants/bottomSheetHeights";
import {
	useAmplifyAuth,
	useAmplifyMap,
	useAws,
	useAwsGeofence,
	useAwsIot,
	useAwsPlace,
	useAwsRoute,
	useAwsTracker,
	usePersistedData,
	useRecordViewPage
} from "@demo/hooks";
import useBottomSheet from "@demo/hooks/useBottomSheet";
import useDeviceMediaQuery from "@demo/hooks/useDeviceMediaQuery";
import {
	EsriMapEnum,
	GrabMapEnum,
	HereMapEnum,
	MapProviderEnum,
	MapStyleFilterTypes,
	MenuItemEnum,
	ShowStateType,
	ToastType
} from "@demo/types";
import { EventTypeEnum, OpenDataMapEnum, ResponsiveUIEnum, TriggeredByEnum } from "@demo/types/Enums";
import { record } from "@demo/utils/analyticsUtils";
import { errorHandler } from "@demo/utils/errorHandler";
import { getCurrentLocation } from "@demo/utils/getCurrentLocation";
import { Signer } from "aws-amplify";
import { differenceInMilliseconds } from "date-fns";
import { LngLatBoundsLike } from "mapbox-gl";
import { omit } from "ramda";
import { useTranslation } from "react-i18next";
import {
	AttributionControl,
	GeolocateControl,
	GeolocateControlRef,
	GeolocateErrorEvent,
	GeolocateResultEvent,
	Map,
	MapLayerMouseEvent,
	MapRef,
	NavigationControl
} from "react-map-gl";

import "./styles.scss";
import { RefHandles } from "react-spring-bottom-sheet/dist/types";

const {
	POOLS,
	PERSIST_STORAGE_KEYS: { SHOULD_CLEAR_CREDENTIALS, GEO_LOCATION_ALLOWED, FASTEST_REGION },
	ROUTES: { DEMO },
	MAP_RESOURCES: { MAX_BOUNDS, AMAZON_HQ, GRAB_SUPPORTED_AWS_REGIONS },
	LINKS: { AMAZON_LOCATION_TERMS_AND_CONDITIONS, AWS_LOCATION },
	GET_PARAMS: { DATA_PROVIDER }
} = appConfig;
const initShow = {
	gridLoader: true,
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
	grabDisclaimerModal: false,
	openDataDisclaimerModal: false,
	mapStyle: undefined,
	unauthGeofenceBox: false,
	unauthTrackerBox: false,
	unauthSimulationBounds: false,
	unauthSimulationDisclaimerModal: false,
	unauthSimulationExitModal: false,
	startUnauthSimulation: false,
	openFeedbackModal: false
};
let interval: NodeJS.Timer | undefined;
let timeout: NodeJS.Timer | undefined;
const searchParams = new URLSearchParams(window.location.search);
let switchToMapProvider = searchParams.get(DATA_PROVIDER);
const peggedRemValue = 13;
const extraGeoLocateTop = 2.6;

const DemoPage: React.FC = () => {
	const {} = useRecordViewPage("DemoPage");
	const [show, setShow] = React.useState<ShowStateType>(initShow);
	const [isUnauthNotifications, setUnauthIsNotifications] = React.useState(false);
	const [confirmCloseUnauthSimulation, setConfirmCloseUnauthSimulation] = React.useState(false);
	const [searchValue, setSearchValue] = React.useState("");
	const [doNotAskGrabDisclaimer, setDoNotAskGrabDisclaimer] = React.useState(false);
	const [doNotAskOpenDataDisclaimer, setDoNotAskOpenDataDisclaimer] = React.useState(false);
	const [triggerOnClose, setTriggerOnClose] = React.useState(false);
	const [triggerOnReset, setTriggerOnReset] = React.useState(false);
	const [expandRouteOptionsMobile, setExpandRouteOptionsMobile] = React.useState(false);
	const [isEditingAuthRoute, setIsEditingAuthRoute] = React.useState(false);
	const [selectedFilters, setSelectedFilters] = React.useState<MapStyleFilterTypes>({
		Providers: [],
		Attribute: [],
		Type: []
	});
	const [startSimulation, setStartSimulation] = React.useState(false);
	const [searchBoxValue, setSearchBoxValue] = React.useState("");
	const mapViewRef = useRef<MapRef | null>(null);
	const geolocateControlRef = useRef<GeolocateControlRef | null>(null);
	const {
		credentials,
		getCurrentUserCredentials,
		clearCredentials,
		region,
		authTokens,
		setAuthTokens,
		onLogout,
		handleCurrentSession,
		switchToGrabMapRegionStack,
		isUserAwsAccountConnected,
		switchToDefaultRegionStack,
		handleStackRegion
	} = useAmplifyAuth();
	const { locationClient, createLocationClient, iotClient, createIotClient, resetStore: resetAwsStore } = useAws();
	const { attachPolicy } = useAwsIot();
	const {
		mapProvider: currentMapProvider,
		mapStyle: currentMapStyle,
		currentLocationData,
		setMapProvider,
		setMapStyle,
		isCurrentLocationDisabled,
		setIsCurrentLocationDisabled,
		setCurrentLocation,
		viewpoint,
		setViewpoint,
		autoMapUnit,
		setAutomaticMapUnit
	} = useAmplifyMap();
	const { setMarker, marker, selectedMarker, suggestions, bound, clearPoiList, zoom, setZoom, setSelectedMarker } =
		useAwsPlace();
	const { routeData, directions, resetStore: resetAwsRouteStore, setRouteData } = useAwsRoute();
	const { resetStore: resetAwsGeofenceStore } = useAwsGeofence();
	const { isEditingRoute, trackerPoints, setTrackerPoints, resetStore: resetAwsTrackingStore } = useAwsTracker();
	const {
		showWelcomeModal,
		setShowWelcomeModal,
		doNotAskGrabDisclaimerModal,
		setDoNotAskGrabDisclaimerModal,
		doNotAskOpenDataDisclaimerModal,
		setDoNotAskOpenDataDisclaimerModal,
		setSettingsOptions
	} = usePersistedData();
	const { isDesktop, isMobile, isTablet } = useDeviceMediaQuery();
	const {
		setUI,
		ui,
		bottomSheetCurrentHeight = 0,
		setBottomSheetHeight,
		setBottomSheetMinHeight,
		setBottomSheetOpen
	} = useBottomSheet();
	const { t, i18n } = useTranslation();
	const langDir = i18n.dir();
	const isLtr = langDir === "ltr";
	const shouldClearCredentials = localStorage.getItem(SHOULD_CLEAR_CREDENTIALS) === "true";
	const geoLocateTopValue = `-${bottomSheetCurrentHeight / peggedRemValue + extraGeoLocateTop}rem`;
	const fallbackRegion = Object.values(POOLS)[0];
	const fastestRegion = localStorage.getItem(FASTEST_REGION) ?? fallbackRegion;
	const defaultRegion = regionsData.find(option => option.value === fastestRegion) as { value: string; label: string };

	const isGrabAvailableInRegion = useMemo(() => !!region && GRAB_SUPPORTED_AWS_REGIONS.includes(region), [region]);

	const isGrabVisible = useMemo(
		() =>
			!show.unauthGeofenceBox &&
			!show.unauthTrackerBox &&
			(!isUserAwsAccountConnected || (isUserAwsAccountConnected && isGrabAvailableInRegion)),
		[show.unauthGeofenceBox, show.unauthTrackerBox, isUserAwsAccountConnected, isGrabAvailableInRegion]
	);

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

	useEffect(() => {
		autoMapUnit.selected && setAutomaticMapUnit();
	}, [autoMapUnit.selected, setAutomaticMapUnit]);

	const handleResetCallback = useCallback(
		function handleReset() {
			setSearchValue("");
			setSelectedFilters({ Providers: [], Attribute: [], Type: [] });
		},
		[setSearchValue, setSelectedFilters]
	);

	const clearCredsAndLocationClient = useCallback(() => {
		clearCredentials();
		resetAwsStore();
	}, [clearCredentials, resetAwsStore]);

	if (shouldClearCredentials || (!!credentials && !credentials?.identityId)) {
		localStorage.removeItem(SHOULD_CLEAR_CREDENTIALS);
		clearCredsAndLocationClient();
	}

	/* Fetch the current user credentials */
	useEffect(() => {
		if (credentials?.identityId && credentials?.expiration) {
			const now = new Date();
			const expiration = new Date(credentials.expiration);

			if (now > expiration) {
				/* If the credentials are expired, clear them and the location client */
				clearCredsAndLocationClient();
			} else {
				/* If the credentials are not expired, set the refresh interval/timeout */
				interval && clearInterval(interval);
				timeout && clearTimeout(timeout);

				if (credentials.authenticated) {
					/* If the credentials are authenticated, set the refresh interval */
					interval = setInterval(() => {
						handleCurrentSession(resetAwsStore);
					}, 10 * 60 * 1000);
				} else {
					/* If the credentials are not authenticated, set the refresh timeout */
					timeout = setTimeout(() => {
						clearCredsAndLocationClient();
					}, differenceInMilliseconds(new Date(credentials.expiration || 0), new Date()));
				}
			}
		} else {
			/* If the credentials are not present, fetch them */
			getCurrentUserCredentials();
		}
	}, [credentials, getCurrentUserCredentials, handleCurrentSession, resetAwsStore, clearCredsAndLocationClient]);

	/* Instantiate location and iot client from aws-sdk whenever the credentials change */
	useEffect(() => {
		if (credentials && region) {
			!locationClient && createLocationClient(credentials, region);
			!iotClient && createIotClient(credentials, region);
		}
	}, [credentials, locationClient, createLocationClient, region, iotClient, createIotClient]);

	const _onLogout = useCallback(async () => {
		await onLogout();
		clearCredentials();
		resetAwsStore();
	}, [onLogout, clearCredentials, resetAwsStore]);

	/* Fired when user logs in or logs out */
	useEffect(() => {
		const searchParams = new URLSearchParams(window.location.search);
		const code = searchParams.get("code");
		const state = searchParams.get("state");
		const sign_out = searchParams.get("sign_out");

		/* After login */
		if (code && state && !authTokens) {
			window.history.replaceState(undefined, "", DEMO);
			setAuthTokens({ code, state });
			record(
				[{ EventType: EventTypeEnum.SIGN_IN_SUCCESSFUL, Attributes: {} }],
				["userAWSAccountConnectionStatus", "userAuthenticationStatus"]
			);
			setTimeout(() => clearCredsAndLocationClient(), 0);
		}

		/* After logout */
		if (sign_out === "true") {
			window.history.replaceState(undefined, "", DEMO);
			!!credentials?.authenticated && !authTokens && _onLogout();
		}
	}, [setAuthTokens, clearCredsAndLocationClient, credentials, authTokens, _onLogout]);

	const _attachPolicy = useCallback(async () => {
		if (credentials?.identityId && credentials?.expiration) {
			const now = new Date();
			const expiration = new Date(credentials.expiration);

			if (now > expiration) {
				/* If the credentials are expired, clear them and the location client */
				clearCredsAndLocationClient();
			} else {
				if (!!credentials.authenticated && !!authTokens) {
					await attachPolicy(credentials.identityId);
				} else if (!isUserAwsAccountConnected && currentMapProvider !== MapProviderEnum.GRAB) {
					await attachPolicy(credentials.identityId, true);
				}
			}
		}
	}, [
		credentials,
		clearCredsAndLocationClient,
		authTokens,
		attachPolicy,
		isUserAwsAccountConnected,
		currentMapProvider
	]);

	/* Attach IoT policy to authenticated user to ensure successful websocket connection */
	useEffect(() => {
		_attachPolicy();
	}, [_attachPolicy]);

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
		} else if ((show.routeBox || ui === ResponsiveUIEnum.routes) && routeData?.Summary.RouteBBox) {
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

	const onLoad = useCallback(() => {
		clearPoiList();
		!isCurrentLocationDisabled && geolocateControlRef.current?.trigger();
		routeData && setRouteData(routeData);
	}, [clearPoiList, isCurrentLocationDisabled, routeData, setRouteData]);

	const getCurrentGeoLocation = useCallback(() => {
		if (!region) {
			return;
		}

		if (isGrabAvailableInRegion) {
			if (isCurrentLocationDisabled) {
				showToast({
					content: t("show_toast__grab_not_supported.text"),
					type: ToastType.INFO
				});
				mapViewRef.current?.flyTo({ center: [AMAZON_HQ.SG.longitude, AMAZON_HQ.SG.latitude], zoom: 15 });
			} else {
				getCurrentLocation(setCurrentLocation, setViewpoint, currentMapProvider, setIsCurrentLocationDisabled);
			}
		} else {
			getCurrentLocation(setCurrentLocation, setViewpoint, currentMapProvider, setIsCurrentLocationDisabled);
		}
	}, [
		region,
		isGrabAvailableInRegion,
		isCurrentLocationDisabled,
		t,
		setCurrentLocation,
		setViewpoint,
		currentMapProvider,
		setIsCurrentLocationDisabled
	]);

	useEffect(() => {
		if ("permissions" in navigator && region) {
			navigator.permissions.query({ name: "geolocation" }).then(({ state }) => {
				const permissionAllowed = localStorage.getItem(GEO_LOCATION_ALLOWED) || "no";

				if (permissionAllowed === "no" && state === "granted") {
					localStorage.setItem(GEO_LOCATION_ALLOWED, "yes");
					getCurrentGeoLocation();
				}
			});
		}
	}, [getCurrentGeoLocation, region]);

	const onGeoLocate = useCallback(
		({ coords: { latitude, longitude } }: GeolocateResultEvent) => {
			if (routeData) {
				resetAwsRouteStore();
				setShow(s => ({ ...s, routeBox: false }));

				setTimeout(() => {
					setViewpoint({ latitude, longitude });
					setCurrentLocation({ currentLocation: { latitude, longitude }, error: undefined });
				}, 0);
			} else {
				setViewpoint({ latitude, longitude });
				setCurrentLocation({ currentLocation: { latitude, longitude }, error: undefined });
			}
		},
		[resetAwsRouteStore, routeData, setCurrentLocation, setViewpoint]
	);

	const onGeoLocateError = useCallback(
		(e: GeolocateErrorEvent) => {
			setCurrentLocation({ currentLocation: undefined, error: { ...omit(["type", "target"], e) } });

			if (e.code === e.PERMISSION_DENIED) {
				localStorage.setItem(GEO_LOCATION_ALLOWED, "no");
				showToast({
					content: t("show_toast__lpd.text"),
					type: ToastType.ERROR
				});
			} else if (e.code === e.POSITION_UNAVAILABLE) {
				showToast({
					content: t("show_toast__lpu.text"),
					type: ToastType.ERROR
				});
			}
		},
		[setCurrentLocation, t]
	);

	const handleMapClick = ({ lngLat }: MapLayerMouseEvent) => {
		if (lngLat && !show.unauthGeofenceBox && !show.unauthTrackerBox) {
			const { lat: latitude, lng: longitude } = lngLat;

			if (!show.routeBox && !show.authGeofenceBox && !show.settings && !isEditingRoute) {
				marker && setMarker(undefined);
				selectedMarker && setSelectedMarker(undefined);
				setTimeout(() => setMarker({ latitude, longitude }), 0);
			}

			if (isEditingRoute) {
				if (trackerPoints) {
					trackerPoints.length < 25
						? setTrackerPoints([longitude, latitude])
						: showToast({ content: t("show_toast__route_waypoint_restriction.text"), type: ToastType.WARNING });
				} else {
					setTrackerPoints([longitude, latitude]);
				}
			}

			mapViewRef?.current?.flyTo({ center: lngLat });
		}
	};

	const onEnableTracking = () => {
		clearPoiList();
		resetAwsRouteStore();
		resetAwsGeofenceStore();
		resetAwsTrackingStore();
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

	const resetAppState = useCallback(() => {
		clearPoiList();
		resetAwsRouteStore();
		resetAwsGeofenceStore();
		resetAwsTrackingStore();
		setShow(s => ({ ...initShow, stylesCard: s.stylesCard, settings: s.settings }));
	}, [clearPoiList, resetAwsRouteStore, resetAwsGeofenceStore, resetAwsTrackingStore]);

	const handleCurrentLocationAndViewpoint = useCallback(
		(switchToGrab = true) => {
			if (switchToGrab) {
				/* When switching to Grab */
				if (currentLocationData?.currentLocation) {
					/* If current location data exists */
					const { latitude, longitude } = currentLocationData.currentLocation;
					const [westBound, southBound, eastBound, northBound] = MAX_BOUNDS.GRAB;
					const isWithinGrabBounds =
						latitude >= southBound && latitude <= northBound && longitude >= westBound && longitude <= eastBound;

					if (!isWithinGrabBounds) {
						/* If current location lies outside Grab MAX_BOUNDS */
						setIsCurrentLocationDisabled(true);
						setViewpoint({ latitude: AMAZON_HQ.SG.latitude, longitude: AMAZON_HQ.SG.longitude });
						setZoom(15);
						mapViewRef.current?.flyTo({
							center: [AMAZON_HQ.SG.longitude, AMAZON_HQ.SG.latitude]
						});
					}
				} else {
					setViewpoint({ latitude: AMAZON_HQ.SG.latitude, longitude: AMAZON_HQ.SG.longitude });
					setZoom(15);
					mapViewRef.current?.flyTo({
						center: [AMAZON_HQ.SG.longitude, AMAZON_HQ.SG.latitude]
					});
				}
			} else {
				/* When switching between other map providers or styles */
				if (currentLocationData?.currentLocation) {
					const { latitude, longitude } = currentLocationData.currentLocation;
					isCurrentLocationDisabled && setIsCurrentLocationDisabled(false);
					setViewpoint({ latitude, longitude });
					setZoom(15);
					mapViewRef.current?.flyTo({ center: [longitude, latitude] });
					setTimeout(() => {
						geolocateControlRef.current?.trigger();
					}, 3000);
				} else {
					setViewpoint({ latitude: AMAZON_HQ.US.latitude, longitude: AMAZON_HQ.US.longitude });
					setZoom(15);
					mapViewRef.current?.flyTo({
						center: [AMAZON_HQ.US.longitude, AMAZON_HQ.US.latitude]
					});
				}
			}
		},
		[currentLocationData, setViewpoint, setZoom, setIsCurrentLocationDisabled, isCurrentLocationDisabled]
	);

	const handleOpenDataMapChange = useCallback(
		(mapStyle?: OpenDataMapEnum) => {
			if (doNotAskOpenDataDisclaimerModal) setDoNotAskOpenDataDisclaimerModal(!doNotAskOpenDataDisclaimer);

			setShow(s => ({ ...s, openDataDisclaimerModal: false, gridLoader: true }));

			if (currentMapProvider === MapProviderEnum.GRAB && !isUserAwsAccountConnected && fastestRegion !== region) {
				switchToDefaultRegionStack();
				resetAwsStore();
				setIsCurrentLocationDisabled(false);
				!isDesktop && setBottomSheetOpen();
			}

			setMapProvider(MapProviderEnum.OPEN_DATA);
			setMapStyle(
				(typeof mapStyle === "string" ? mapStyle : undefined) ||
					(show.mapStyle ? show.mapStyle : OpenDataMapEnum.OPEN_DATA_STANDARD_LIGHT)
			);
			handleCurrentLocationAndViewpoint(false);
		},
		[
			doNotAskOpenDataDisclaimerModal,
			setDoNotAskOpenDataDisclaimerModal,
			doNotAskOpenDataDisclaimer,
			currentMapProvider,
			isUserAwsAccountConnected,
			fastestRegion,
			region,
			setMapProvider,
			setMapStyle,
			show.mapStyle,
			handleCurrentLocationAndViewpoint,
			switchToDefaultRegionStack,
			resetAwsStore,
			setIsCurrentLocationDisabled,
			isDesktop,
			setBottomSheetOpen
		]
	);

	const handleGrabMapChange = useCallback(
		(mapStyle?: GrabMapEnum) => {
			if (doNotAskGrabDisclaimerModal) setDoNotAskGrabDisclaimerModal(!doNotAskGrabDisclaimer);
			else setShow(s => ({ ...s, grabDisclaimerModal: false }));

			if (!isUserAwsAccountConnected && !isGrabAvailableInRegion) {
				switchToGrabMapRegionStack();
				resetAwsStore();
				!isDesktop && setBottomSheetOpen();
			}

			setMapProvider(MapProviderEnum.GRAB);
			setMapStyle(
				(typeof mapStyle === "string" ? mapStyle : undefined) ||
					(show.mapStyle ? show.mapStyle : GrabMapEnum.GRAB_STANDARD_LIGHT)
			);
			setShow(s => ({ ...s, gridLoader: true }));
			resetAppState();
			handleCurrentLocationAndViewpoint();
		},
		[
			doNotAskGrabDisclaimerModal,
			setDoNotAskGrabDisclaimerModal,
			doNotAskGrabDisclaimer,
			isUserAwsAccountConnected,
			isGrabAvailableInRegion,
			setMapProvider,
			setMapStyle,
			show.mapStyle,
			resetAppState,
			handleCurrentLocationAndViewpoint,
			switchToGrabMapRegionStack,
			resetAwsStore,
			isDesktop,
			setBottomSheetOpen
		]
	);

	const onMapProviderChange = useCallback(
		(mapProvider: MapProviderEnum, triggeredBy: TriggeredByEnum) => {
			setShow(s => ({ ...s, gridLoader: true }));

			if (mapProvider === MapProviderEnum.OPEN_DATA) {
				if (doNotAskOpenDataDisclaimerModal) {
					/* Switching from different map provider and style to OpenData map provider and style */
					setShow(s => ({ ...s, openDataDisclaimerModal: true }));
				} else handleOpenDataMapChange();
			} else if (mapProvider === MapProviderEnum.GRAB) {
				if (doNotAskGrabDisclaimerModal) {
					/* Switching from different map provider and style to Grab map provider and style */
					setShow(s => ({ ...s, grabDisclaimerModal: true }));
				} else handleGrabMapChange();
			} else {
				if (currentMapProvider === MapProviderEnum.GRAB) {
					/* Switching from Grab map provider to different map provider and style */
					if (!isUserAwsAccountConnected && fastestRegion !== region) {
						switchToDefaultRegionStack();
						resetAwsStore();
						setIsCurrentLocationDisabled(false);

						if (!isDesktop) {
							setTimeout(() => {
								setBottomSheetMinHeight(window.innerHeight * 0.4 - 10);
								setBottomSheetHeight(window.innerHeight * 0.4);
							}, 1000);

							setTimeout(() => {
								setBottomSheetMinHeight(BottomSheetHeights.explore.min);
								setBottomSheetHeight(window.innerHeight);
							}, 1200);
						}
					}

					setMapProvider(mapProvider);
					setMapStyle(mapProvider === MapProviderEnum.ESRI ? EsriMapEnum.ESRI_LIGHT : HereMapEnum.HERE_EXPLORE);
					handleCurrentLocationAndViewpoint(false);
				} else {
					/* Switching between Esri and HERE map provider and style */
					setMapProvider(mapProvider);
					setMapStyle(mapProvider === MapProviderEnum.ESRI ? EsriMapEnum.ESRI_LIGHT : HereMapEnum.HERE_EXPLORE);
				}

				resetAppState();
			}

			record([
				{ EventType: EventTypeEnum.MAP_PROVIDER_CHANGE, Attributes: { provider: String(mapProvider), triggeredBy } }
			]);
		},
		[
			doNotAskOpenDataDisclaimerModal,
			handleOpenDataMapChange,
			doNotAskGrabDisclaimerModal,
			handleGrabMapChange,
			currentMapProvider,
			resetAppState,
			isUserAwsAccountConnected,
			fastestRegion,
			region,
			setMapProvider,
			setMapStyle,
			handleCurrentLocationAndViewpoint,
			switchToDefaultRegionStack,
			resetAwsStore,
			setIsCurrentLocationDisabled,
			isDesktop,
			setBottomSheetMinHeight,
			setBottomSheetHeight
		]
	);

	/* Handle search query params for map provider */
	useEffect(() => {
		if (switchToMapProvider) {
			const { ESRI, HERE, GRAB, OPEN_DATA } = MapProviderEnum;

			if (![ESRI, HERE, GRAB, "GrabMaps", OPEN_DATA].includes(switchToMapProvider)) {
				/* Invalid search query param for map provider */
				onMapProviderChange(currentMapProvider, TriggeredByEnum.DEMO_PAGE);
			} else if (currentMapProvider !== switchToMapProvider) {
				/* If search query param exist, update map provider based on search query param */
				if (["Grab", "GrabMaps"].includes(switchToMapProvider)) {
					isGrabVisible ? onMapProviderChange(GRAB, TriggeredByEnum.DEMO_PAGE) : setMapProvider(currentMapProvider);
				} else {
					onMapProviderChange(switchToMapProvider as MapProviderEnum, TriggeredByEnum.DEMO_PAGE);
				}
			}
			switchToMapProvider = null;
		} else if (!location.search.includes(`${DATA_PROVIDER}=`)) {
			/* If search query param doesn't exist, update search query param based on current map provider */
			setMapProvider(currentMapProvider);
		}
	}, [currentMapProvider, isGrabVisible, setMapProvider, onMapProviderChange]);

	/* Handled stack region and cloudformation link */
	useEffect(() => {
		if (defaultRegion) {
			currentMapProvider === MapProviderEnum.GRAB
				? handleStackRegion({
						value: "ap-southeast-1",
						label: "regions__ap_southeast_1.text"
				  })
				: handleStackRegion(defaultRegion);
		}
	}, [defaultRegion, currentMapProvider, handleStackRegion]);

	const onMapStyleChange = useCallback(
		(mapStyle: EsriMapEnum | HereMapEnum | GrabMapEnum | OpenDataMapEnum) => {
			const splitArr = mapStyle.split(".");
			const mapProviderFromStyle = splitArr[splitArr.length - 2] as MapProviderEnum;
			setShow(s => ({ ...s, gridLoader: true }));

			if (
				(currentMapProvider === MapProviderEnum.ESRI && mapProviderFromStyle === MapProviderEnum.ESRI) ||
				(currentMapProvider === MapProviderEnum.HERE && mapProviderFromStyle === MapProviderEnum.HERE) ||
				(currentMapProvider === MapProviderEnum.GRAB && mapProviderFromStyle === MapProviderEnum.GRAB) ||
				(currentMapProvider === MapProviderEnum.OPEN_DATA && mapProviderFromStyle === MapProviderEnum.OPEN_DATA)
			) {
				/* No map provider switch required */
				setMapStyle(mapStyle);
			} else if (mapProviderFromStyle === MapProviderEnum.OPEN_DATA) {
				/* Switching to OpenData map provider from different map provider and style */
				if (doNotAskOpenDataDisclaimerModal) {
					setTimeout(
						() => setShow(s => ({ ...s, openDataDisclaimerModal: true, mapStyle: mapStyle as OpenDataMapEnum })),
						0
					);
				} else {
					handleOpenDataMapChange(mapStyle as OpenDataMapEnum);
				}
			} else {
				if (currentMapProvider === MapProviderEnum.GRAB) {
					/* Switching from Grab map provider to different map provider and style */
					if (!isUserAwsAccountConnected && fastestRegion !== region) {
						switchToDefaultRegionStack();
						resetAwsStore();
						setIsCurrentLocationDisabled(false);

						if (!isDesktop) {
							setTimeout(() => {
								setBottomSheetMinHeight(window.innerHeight * 0.4 - 10);
								setBottomSheetHeight(window.innerHeight * 0.4);
							}, 1000);

							setTimeout(() => {
								setBottomSheetMinHeight(BottomSheetHeights.explore.min);
								setBottomSheetHeight(window.innerHeight);
							}, 1200);
						}
					}

					setMapProvider(mapProviderFromStyle);
					setMapStyle(mapStyle);
					handleCurrentLocationAndViewpoint(false);
				} else if (mapProviderFromStyle === MapProviderEnum.GRAB) {
					/* Switching from different map provider and style to Grab map provider and style */
					if (doNotAskGrabDisclaimerModal) {
						setTimeout(
							() =>
								setShow(s => ({
									...s,
									grabDisclaimerModal: true,
									mapStyle: mapStyle as GrabMapEnum
								})),
							0
						);
					} else {
						show.unauthGeofenceBox || show.unauthTrackerBox
							? setShow(s => ({ ...s, unauthSimulationExitModal: true, mapStyle: mapStyle as GrabMapEnum }))
							: handleGrabMapChange(mapStyle as GrabMapEnum);
					}
				} else {
					/* Switching between Esri and HERE map provider and style */
					setMapProvider(mapProviderFromStyle);
					setMapStyle(mapStyle);
				}

				!show.unauthGeofenceBox && !show.unauthTrackerBox && resetAppState();
			}
		},
		[
			currentMapProvider,
			setMapStyle,
			doNotAskOpenDataDisclaimerModal,
			handleOpenDataMapChange,
			show.unauthGeofenceBox,
			show.unauthTrackerBox,
			resetAppState,
			isUserAwsAccountConnected,
			fastestRegion,
			region,
			setMapProvider,
			handleCurrentLocationAndViewpoint,
			switchToDefaultRegionStack,
			resetAwsStore,
			setIsCurrentLocationDisabled,
			isDesktop,
			setBottomSheetMinHeight,
			setBottomSheetHeight,
			doNotAskGrabDisclaimerModal,
			handleGrabMapChange
		]
	);

	const searchBoxEl = useCallback(
		(isSimpleSearch = false, bottomSheetRef?: React.MutableRefObject<RefHandles | null>) => (
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
						borderRadius: "0.62rem"
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
			getCurrentGeoLocation
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

	return !!credentials?.identityId ? (
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
				onIdle={() => show.gridLoader && setShow(s => ({ ...s, gridLoader: false }))}
				transformRequest={transformRequest}
				attributionControl={false}
			>
				<View className={show.gridLoader ? "loader-container" : ""}>
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
									clearCredsAndLocationClient={clearCredsAndLocationClient}
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
							SearchBoxEl={(ref?: React.MutableRefObject<RefHandles | null>) => searchBoxEl(true, ref)}
							MapButtons={(ref?: React.MutableRefObject<RefHandles | null>) => (
								<MapButtons
									renderedUpon={TriggeredByEnum.SETTINGS_MODAL}
									openStylesCard={show.stylesCard}
									setOpenStylesCard={b => setShow(s => ({ ...s, stylesCard: b }))}
									onCloseSidebar={() => setShow(s => ({ ...s, sidebar: false }))}
									onOpenSignInModal={() => setShow(s => ({ ...s, signInModal: true }))}
									isGrabVisible={isGrabVisible}
									showGrabDisclaimerModal={show.grabDisclaimerModal}
									showOpenDataDisclaimerModal={show.openDataDisclaimerModal}
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
							RouteBox={(ref?: React.MutableRefObject<RefHandles | null>) => (
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
							onOpenFeedbackModal={() => setShow(s => ({ ...s, openFeedbackModal: true }))}
							onOpenSignInModal={() => setShow(s => ({ ...s, signInModal: true }))}
							onShowSettings={() => {
								setShow(s => ({ ...s, settings: true }));
								setSettingsOptions(undefined);
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
							clearCredsAndLocationClient={clearCredsAndLocationClient}
							setShowAuthGeofenceBox={b => setShow(s => ({ ...s, authGeofenceBox: b }))}
							setShowRouteBox={b => setShow(s => ({ ...s, routeBox: b }))}
							isExpandRouteOptionsMobile={expandRouteOptionsMobile}
							setExpandRouteOptionsMobile={setExpandRouteOptionsMobile}
							setSearchBoxValue={setSearchBoxValue}
						/>
					)}
					<MapButtons
						renderedUpon={TriggeredByEnum.DEMO_PAGE}
						openStylesCard={show.stylesCard}
						setOpenStylesCard={b => setShow(s => ({ ...s, stylesCard: b }))}
						onCloseSidebar={() => setShow(s => ({ ...s, sidebar: false }))}
						onOpenSignInModal={() => setShow(s => ({ ...s, signInModal: true }))}
						isGrabVisible={isGrabVisible}
						showGrabDisclaimerModal={show.grabDisclaimerModal}
						showOpenDataDisclaimerModal={show.openDataDisclaimerModal}
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
						showGrabDisclaimerModal={show.grabDisclaimerModal}
						showOpenDataDisclaimerModal={show.openDataDisclaimerModal}
						onShowGridLoader={() => setShow(s => ({ ...s, gridLoader: true }))}
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
				open={show.openDataDisclaimerModal}
				onClose={() => {
					setShow(s => ({ ...s, openDataDisclaimerModal: false, mapStyle: undefined }));
					setMapProvider(currentMapProvider);
				}}
				onConfirm={() => setTimeout(() => handleOpenDataMapChange(), 0)}
				showDoNotAskAgainCheckbox
				onConfirmationCheckboxOnChange={setDoNotAskOpenDataDisclaimer}
			/>
			<GrabConfirmationModal
				open={show.grabDisclaimerModal}
				onClose={() => {
					setShow(s => ({ ...s, grabDisclaimerModal: false, mapStyle: undefined }));
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
					setShow(s => ({ ...s, unauthSimulationExitModal: false, unauthGeofenceBox: false, unauthTrackerBox: false }));
					setTimeout(() => {
						handleGrabMapChange(show.mapStyle as GrabMapEnum);
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
