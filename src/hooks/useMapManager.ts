import { useCallback, useEffect, useMemo, useState } from "react";

import { showToast } from "@demo/core/Toast";
import { appConfig, regionsData } from "@demo/core/constants";

import BottomSheetHeights from "@demo/core/constants/bottomSheetHeights";
import {
	EsriMapEnum,
	EventTypeEnum,
	GrabMapEnum,
	HereMapEnum,
	MapProviderEnum,
	OpenDataMapEnum,
	ToastType,
	TriggeredByEnum
} from "@demo/types/Enums";
import { record } from "@demo/utils/analyticsUtils";
import { getCurrentLocation } from "@demo/utils/getCurrentLocation";
import { omit } from "ramda";
import { useTranslation } from "react-i18next";
import {
	GeolocateControlRef,
	GeolocateErrorEvent,
	GeolocateResultEvent,
	MapLayerMouseEvent,
	MapRef
} from "react-map-gl";

import useAmplifyAuth from "./useAmplifyAuth";
import useAmplifyMap from "./useAmplifyMap";
import useAws from "./useAws";
import useAwsGeofence from "./useAwsGeofence";
import useAwsPlace from "./useAwsPlace";
import useAwsRoute from "./useAwsRoute";
import useAwsTracker from "./useAwsTracker";
import useBottomSheet from "./useBottomSheet";
import useDeviceMediaQuery from "./useDeviceMediaQuery";
import usePersistedData from "./usePersistedData";

const {
	POOLS,
	PERSIST_STORAGE_KEYS: { FASTEST_REGION, GEO_LOCATION_ALLOWED },
	MAP_RESOURCES: { MAX_BOUNDS, AMAZON_HQ, GRAB_SUPPORTED_AWS_REGIONS },
	GET_PARAMS: { DATA_PROVIDER }
} = appConfig;
const searchParams = new URLSearchParams(window.location.search);
let switchToMapProvider = searchParams.get(DATA_PROVIDER);

type UseMapManagerProps = {
	mapViewRef: React.MutableRefObject<MapRef | null>;
	geolocateControlRef: React.MutableRefObject<GeolocateControlRef | null>;
	isUnauthGeofenceBoxOpen: boolean;
	isUnauthTrackerBoxOpen: boolean;
	isAuthGeofenceBoxOpen: boolean;
	isSettingsOpen: boolean;
	isRouteBoxOpen: boolean;
	closeRouteBox: () => void;
	resetAppStateCb: () => void;
	setUnauthSimulationExitModal: (b: boolean) => void;
};

const useMapManager = ({
	mapViewRef,
	geolocateControlRef,
	isUnauthGeofenceBoxOpen,
	isUnauthTrackerBoxOpen,
	isAuthGeofenceBoxOpen,
	isSettingsOpen,
	isRouteBoxOpen,
	closeRouteBox,
	resetAppStateCb,
	setUnauthSimulationExitModal
}: UseMapManagerProps) => {
	const [gridLoader, setGridLoader] = useState(true);
	const [tempMapStyle, setTempMapStyle] = useState<GrabMapEnum | OpenDataMapEnum | undefined>(undefined);
	const [grabDisclaimerModal, setGrabDisclaimerModal] = useState(false);
	const [doNotAskGrabDisclaimer, setDoNotAskGrabDisclaimer] = useState(false);
	const [openDataDisclaimerModal, setOpenDataDisclaimerModal] = useState(false);
	const [doNotAskOpenDataDisclaimer, setDoNotAskOpenDataDisclaimer] = useState(false);
	const {
		region,
		switchToGrabMapRegionStack,
		isUserAwsAccountConnected,
		switchToDefaultRegionStack,
		handleStackRegion
	} = useAmplifyAuth();
	const {
		mapProvider: currentMapProvider,
		currentLocationData,
		setMapProvider,
		setMapStyle,
		isCurrentLocationDisabled,
		setIsCurrentLocationDisabled,
		setCurrentLocation,
		setViewpoint,
		autoMapUnit,
		setAutomaticMapUnit
	} = useAmplifyMap();
	const { setMarker, marker, selectedMarker, clearPoiList, setZoom, setSelectedMarker } = useAwsPlace();
	const {
		doNotAskGrabDisclaimerModal,
		setDoNotAskGrabDisclaimerModal,
		doNotAskOpenDataDisclaimerModal,
		setDoNotAskOpenDataDisclaimerModal
	} = usePersistedData();
	const { resetStore: resetAwsStore } = useAws();
	const { routeData, setRouteData, resetStore: resetAwsRouteStore } = useAwsRoute();
	const { resetStore: resetAwsGeofenceStore } = useAwsGeofence();
	const { isEditingRoute, trackerPoints, setTrackerPoints, resetStore: resetAwsTrackingStore } = useAwsTracker();
	const { t } = useTranslation();
	const { isDesktop } = useDeviceMediaQuery();
	const { setBottomSheetOpen, setBottomSheetHeight, setBottomSheetMinHeight } = useBottomSheet();
	const fallbackRegion = Object.values(POOLS)[0];
	const fastestRegion = localStorage.getItem(FASTEST_REGION) ?? fallbackRegion;
	const defaultRegion = regionsData.find(option => option.value === fastestRegion) as { value: string; label: string };
	const isGrabAvailableInRegion = useMemo(() => !!region && GRAB_SUPPORTED_AWS_REGIONS.includes(region), [region]);
	const isGrabVisible = useMemo(
		() =>
			!isUnauthGeofenceBoxOpen &&
			!isUnauthTrackerBoxOpen &&
			(!isUserAwsAccountConnected || (isUserAwsAccountConnected && isGrabAvailableInRegion)),
		[isUnauthGeofenceBoxOpen, isUnauthTrackerBoxOpen, isUserAwsAccountConnected, isGrabAvailableInRegion]
	);

	useEffect(() => {
		autoMapUnit.selected && setAutomaticMapUnit();
	}, [autoMapUnit.selected, setAutomaticMapUnit]);

	const onLoad = useCallback(() => {
		clearPoiList();
		!isCurrentLocationDisabled && geolocateControlRef.current?.trigger();
		routeData && setRouteData(routeData);
	}, [clearPoiList, geolocateControlRef, isCurrentLocationDisabled, routeData, setRouteData]);

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
		mapViewRef,
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
				closeRouteBox();

				setTimeout(() => {
					setViewpoint({ latitude, longitude });
					setCurrentLocation({ currentLocation: { latitude, longitude }, error: undefined });
				}, 0);
			} else {
				setViewpoint({ latitude, longitude });
				setCurrentLocation({ currentLocation: { latitude, longitude }, error: undefined });
			}
		},
		[closeRouteBox, resetAwsRouteStore, routeData, setCurrentLocation, setViewpoint]
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

	const handleMapClick = useCallback(
		({ lngLat }: MapLayerMouseEvent) => {
			if (lngLat && !isUnauthGeofenceBoxOpen && !isUnauthTrackerBoxOpen) {
				const { lat: latitude, lng: longitude } = lngLat;

				if (!isRouteBoxOpen && !isAuthGeofenceBoxOpen && !isSettingsOpen && !isEditingRoute) {
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
		},
		[
			isAuthGeofenceBoxOpen,
			isEditingRoute,
			isRouteBoxOpen,
			isSettingsOpen,
			isUnauthGeofenceBoxOpen,
			isUnauthTrackerBoxOpen,
			mapViewRef,
			marker,
			selectedMarker,
			setMarker,
			setSelectedMarker,
			setTrackerPoints,
			t,
			trackerPoints
		]
	);

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
		[
			currentLocationData,
			setViewpoint,
			setZoom,
			setIsCurrentLocationDisabled,
			isCurrentLocationDisabled,
			mapViewRef,
			geolocateControlRef
		]
	);

	const handleOpenDataMapChange = useCallback(
		(mapStyle?: OpenDataMapEnum) => {
			doNotAskOpenDataDisclaimerModal && setDoNotAskOpenDataDisclaimerModal(!doNotAskOpenDataDisclaimer);
			setOpenDataDisclaimerModal(false);
			setGridLoader(true);

			if (currentMapProvider === MapProviderEnum.GRAB && !isUserAwsAccountConnected && fastestRegion !== region) {
				switchToDefaultRegionStack();
				resetAwsStore();
				setIsCurrentLocationDisabled(false);
				!isDesktop && setBottomSheetOpen();
			}

			setMapProvider(MapProviderEnum.OPEN_DATA);
			setMapStyle(
				(typeof mapStyle === "string" ? mapStyle : undefined) ||
					(tempMapStyle ? tempMapStyle : OpenDataMapEnum.OPEN_DATA_STANDARD_LIGHT)
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
			tempMapStyle,
			handleCurrentLocationAndViewpoint,
			switchToDefaultRegionStack,
			resetAwsStore,
			setIsCurrentLocationDisabled,
			isDesktop,
			setBottomSheetOpen
		]
	);

	const resetAppState = useCallback(() => {
		clearPoiList();
		resetAwsRouteStore();
		resetAwsGeofenceStore();
		resetAwsTrackingStore();
		resetAppStateCb();
	}, [clearPoiList, resetAwsRouteStore, resetAwsGeofenceStore, resetAwsTrackingStore, resetAppStateCb]);

	const handleGrabMapChange = useCallback(
		(mapStyle?: GrabMapEnum) => {
			doNotAskGrabDisclaimerModal && setDoNotAskGrabDisclaimerModal(!doNotAskGrabDisclaimer);
			setGrabDisclaimerModal(false);
			setGridLoader(true);

			if (!isUserAwsAccountConnected && !isGrabAvailableInRegion) {
				switchToGrabMapRegionStack();
				resetAwsStore();
				!isDesktop && setBottomSheetOpen();
			}

			setMapProvider(MapProviderEnum.GRAB);
			setMapStyle(
				(typeof mapStyle === "string" ? mapStyle : undefined) ||
					(tempMapStyle ? tempMapStyle : GrabMapEnum.GRAB_STANDARD_LIGHT)
			);
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
			tempMapStyle,
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
			setGridLoader(true);

			if (mapProvider === MapProviderEnum.OPEN_DATA) {
				if (doNotAskOpenDataDisclaimerModal) {
					/* Switching from different map provider and style to OpenData map provider and style */
					setOpenDataDisclaimerModal(true);
				} else handleOpenDataMapChange();
			} else if (mapProvider === MapProviderEnum.GRAB) {
				if (doNotAskGrabDisclaimerModal) {
					/* Switching from different map provider and style to Grab map provider and style */
					setGrabDisclaimerModal(true);
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
			setGridLoader(true);

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
					setTimeout(() => {
						setOpenDataDisclaimerModal(true);
						setTempMapStyle(mapStyle as OpenDataMapEnum);
					}, 0);
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
						setTimeout(() => {
							setGrabDisclaimerModal(true);
							setTempMapStyle(mapStyle as GrabMapEnum);
						}, 0);
					} else {
						if (isUnauthGeofenceBoxOpen || isUnauthTrackerBoxOpen) {
							setUnauthSimulationExitModal(true);
							setTempMapStyle(mapStyle as GrabMapEnum);
						} else {
							handleGrabMapChange(mapStyle as GrabMapEnum);
						}
					}
				} else {
					/* Switching between Esri and HERE map provider and style */
					setMapProvider(mapProviderFromStyle);
					setMapStyle(mapStyle);
				}

				!isUnauthGeofenceBoxOpen && !isUnauthTrackerBoxOpen && resetAppState();
			}
		},
		[
			currentMapProvider,
			setMapStyle,
			doNotAskOpenDataDisclaimerModal,
			handleOpenDataMapChange,
			isUnauthGeofenceBoxOpen,
			isUnauthTrackerBoxOpen,
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
			setUnauthSimulationExitModal,
			handleGrabMapChange
		]
	);

	return {
		gridLoader,
		setGridLoader,
		tempMapStyle,
		setTempMapStyle,
		grabDisclaimerModal,
		setGrabDisclaimerModal,
		doNotAskGrabDisclaimer,
		setDoNotAskGrabDisclaimer,
		openDataDisclaimerModal,
		setOpenDataDisclaimerModal,
		doNotAskOpenDataDisclaimer,
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
	};
};

export default useMapManager;
