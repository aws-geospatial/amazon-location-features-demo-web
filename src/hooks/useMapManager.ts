import { MutableRefObject, useCallback, useEffect, useMemo, useState } from "react";

import { showToast } from "@demo/core/Toast";
import { appConfig, regionsData } from "@demo/core/constants";
import { MapStyleEnum, ToastType } from "@demo/types/Enums";
import { getStyleWithPreferredLanguage, normalizeLng } from "@demo/utils";
import { getCurrentLocation } from "@demo/utils/getCurrentLocation";
import type { GeolocateControl as GeolocateControlRef } from "maplibre-gl";
import { omit } from "ramda";
import { useTranslation } from "react-i18next";
import { GeolocateErrorEvent, GeolocateResultEvent, MapLayerMouseEvent, MapRef, MapStyle } from "react-map-gl/maplibre";

import useAuth from "./useAuth";
import useGeofence from "./useGeofence";
import useMap from "./useMap";
import usePlace from "./usePlace";
import useRoute from "./useRoute";
import useTracker from "./useTracker";

const {
	API_KEYS,
	PERSIST_STORAGE_KEYS: { FASTEST_REGION, GEO_LOCATION_ALLOWED },
	MAP_RESOURCES: { AMAZON_HQ }
} = appConfig;
const fallbackRegion = Object.keys(API_KEYS)[0];

interface UseMapManagerProps {
	mapRef: MutableRefObject<MapRef | null>;
	geolocateControlRef: MutableRefObject<GeolocateControlRef | null>;
	isUnauthGeofenceBoxOpen: boolean;
	isUnauthTrackerBoxOpen: boolean;
	isAuthGeofenceBoxOpen: boolean;
	isSettingsOpen: boolean;
	isRouteBoxOpen: boolean;
	closeRouteBox: () => void;
	resetAppStateCb: () => void;
}

const useMapManager = ({
	mapRef,
	geolocateControlRef,
	isUnauthGeofenceBoxOpen,
	isUnauthTrackerBoxOpen,
	isAuthGeofenceBoxOpen,
	isSettingsOpen,
	isRouteBoxOpen,
	closeRouteBox,
	resetAppStateCb
}: UseMapManagerProps) => {
	const [mapStyleWithLanguageUrl, setMapStyleWithLanguageUrl] = useState<MapStyle>();
	const [gridLoader, setGridLoader] = useState(true);
	const { handleStackRegion, stackRegion, baseValues, apiKey } = useAuth();
	const {
		currentLocationData,
		setCurrentLocation,
		setViewpoint,
		mapStyle,
		mapColorScheme,
		mapPoliticalView,
		mapLanguage
	} = useMap();
	const { setMarker, marker, selectedMarker, clearPoiList, setZoom, setSelectedMarker } = usePlace();
	const { routeData, setRouteData, resetStore: resetRouteStore } = useRoute();
	const { resetStore: resetGeofenceStore } = useGeofence();
	const { isEditingRoute, trackerPoints, setTrackerPoints, resetStore: resetTrackerStore } = useTracker();
	const { t } = useTranslation();
	const fastestRegion = localStorage.getItem(FASTEST_REGION) ?? fallbackRegion;
	const defaultRegion = regionsData.find(option => option.value === fastestRegion) as { value: string; label: string };
	const apiKeyRegion = useMemo(
		() => (baseValues && baseValues.region in API_KEYS ? baseValues.region : Object.keys(API_KEYS)[0]),
		[baseValues]
	);

	const isColorSchemeDisabled = useMemo(
		() => [MapStyleEnum.HYBRID, MapStyleEnum.SATELLITE].includes(mapStyle),
		[mapStyle]
	);

	const mapStyleUrl = useMemo(
		() =>
			`https://maps.geo.${apiKeyRegion}.amazonaws.com/v2/styles/${mapStyle}/descriptor?key=${apiKey}${
				!isColorSchemeDisabled ? `&color-scheme=${mapColorScheme}` : ""
			}${!!mapPoliticalView?.alpha3 ? `&political-view=${mapPoliticalView.alpha3}` : ""}`,
		[apiKey, apiKeyRegion, isColorSchemeDisabled, mapColorScheme, mapPoliticalView, mapStyle]
	);

	useEffect(() => {
		(async () => {
			const styleWithLanguage = await getStyleWithPreferredLanguage(mapStyleUrl, mapLanguage.value);
			setMapStyleWithLanguageUrl(styleWithLanguage);
		})();
	}, [mapStyleUrl, mapLanguage]);

	const onLoad = useCallback(() => {
		clearPoiList();
		geolocateControlRef.current?.trigger();
		routeData && setRouteData(routeData);
	}, [clearPoiList, geolocateControlRef, routeData, setRouteData]);

	const getCurrentGeoLocation = useCallback(() => {
		getCurrentLocation(setCurrentLocation, setViewpoint);
	}, [setCurrentLocation, setViewpoint]);

	useEffect(() => {
		if ("permissions" in navigator) {
			navigator.permissions.query({ name: "geolocation" }).then(({ state }) => {
				const permissionAllowed = localStorage.getItem(GEO_LOCATION_ALLOWED) || "no";

				if (permissionAllowed === "no" && state === "granted") {
					localStorage.setItem(GEO_LOCATION_ALLOWED, "yes");
					getCurrentGeoLocation();
				}
			});
		}
	}, [getCurrentGeoLocation]);

	const onGeoLocate = useCallback(
		({ coords: { latitude, longitude } }: GeolocateResultEvent) => {
			if (routeData) {
				resetRouteStore();
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
		[closeRouteBox, resetRouteStore, routeData, setCurrentLocation, setViewpoint]
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
			const { lng, lat: latitude } = lngLat;
			const longitude = normalizeLng(lng);

			if (!isUnauthGeofenceBoxOpen && !isUnauthTrackerBoxOpen) {
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

				mapRef?.current?.flyTo({ center: lngLat });
			}
		},
		[
			isAuthGeofenceBoxOpen,
			isEditingRoute,
			isRouteBoxOpen,
			isSettingsOpen,
			isUnauthGeofenceBoxOpen,
			isUnauthTrackerBoxOpen,
			mapRef,
			marker,
			selectedMarker,
			setMarker,
			setSelectedMarker,
			setTrackerPoints,
			t,
			trackerPoints
		]
	);

	const handleCurrentLocationAndViewpoint = useCallback(() => {
		if (currentLocationData?.currentLocation) {
			const { latitude, longitude } = currentLocationData.currentLocation;
			setViewpoint({ latitude, longitude });
			setZoom(15);
			mapRef.current?.flyTo({ center: [longitude, latitude] });
			setTimeout(() => {
				geolocateControlRef.current?.trigger();
			}, 3000);
		} else {
			setViewpoint({ latitude: AMAZON_HQ.US.latitude, longitude: AMAZON_HQ.US.longitude });
			setZoom(15);
			mapRef.current?.flyTo({
				center: [AMAZON_HQ.US.longitude, AMAZON_HQ.US.latitude]
			});
		}
	}, [currentLocationData, geolocateControlRef, mapRef, setViewpoint, setZoom]);

	const resetAppState = useCallback(() => {
		clearPoiList();
		resetRouteStore();
		resetGeofenceStore();
		resetTrackerStore();
		resetAppStateCb();
	}, [clearPoiList, resetRouteStore, resetGeofenceStore, resetTrackerStore, resetAppStateCb]);

	/* Handled stack region and cloudformation link */
	useEffect(() => {
		defaultRegion.value !== stackRegion?.value && handleStackRegion(defaultRegion);
	}, [defaultRegion, handleStackRegion, stackRegion?.value]);

	return {
		mapStyleWithLanguageUrl,
		gridLoader,
		setGridLoader,
		onLoad,
		getCurrentGeoLocation,
		onGeoLocate,
		onGeoLocateError,
		handleMapClick,
		handleCurrentLocationAndViewpoint,
		resetAppState
	};
};

export default useMapManager;
