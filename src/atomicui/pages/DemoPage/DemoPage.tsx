/* Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved. */
/* SPDX-License-Identifier: MIT-0 */

import React, { useCallback, useEffect, useMemo, useRef } from "react";

import { Flex, Text, View } from "@aws-amplify/ui-react";
import { IconLocateMe, LogoDark, LogoLight } from "@demo/assets";
import {
	ConnectAwsAccountModal,
	GrabConfirmationModal,
	ConfirmationModal as InformationModal,
	MapButtons,
	SignInModal,
	WelcomeModal
} from "@demo/atomicui/molecules";
import {
	AboutModal,
	GeofenceBox,
	RouteBox,
	SearchBox,
	SettingsModal,
	Sidebar,
	TrackingBox
} from "@demo/atomicui/organisms";
import { showToast } from "@demo/core";
import { appConfig } from "@demo/core/constants";
import {
	useAmplifyAuth,
	useAmplifyMap,
	useAws,
	useAwsGeofence,
	useAwsIot,
	useAwsPlace,
	useAwsRoute,
	useAwsTracker,
	useMediaQuery,
	usePersistedData
} from "@demo/hooks";
import { GrabMapEnum, MapProviderEnum, ToastType } from "@demo/types";
import { errorHandler } from "@demo/utils/errorHandler";
import { getCurrentLocation } from "@demo/utils/getCurrentLocation";
import { Signer } from "aws-amplify";
import { differenceInMilliseconds } from "date-fns";
import { LngLatBoundsLike } from "mapbox-gl";
import { omit } from "ramda";
import {
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

const {
	PERSIST_STORAGE_KEYS: { SHOULD_CLEAR_CREDENTIALS, GEO_LOCATION_ALLOWED },
	ROUTES: { DEMO },
	MAP_RESOURCES: { MAX_BOUNDS },
	LINKS: { AMAZON_LOCATION_TERMS_AND_CONDITIONS }
} = appConfig;
const initShow = {
	loader: true,
	sidebar: false,
	routeBox: false,
	signInModal: false,
	connectAwsAccount: false,
	geofenceBox: false,
	trackingBox: false,
	settings: false,
	stylesCard: false,
	trackingDisclaimerModal: false,
	about: false,
	grabDisclaimerModal: false,
	mapStyle: undefined
};
let interval: NodeJS.Timer | undefined;
let timeout: NodeJS.Timer | undefined;

const DemoPage: React.FC = () => {
	const [show, setShow] = React.useState<{
		loader: boolean;
		sidebar: boolean;
		routeBox: boolean;
		signInModal: boolean;
		connectAwsAccount: boolean;
		geofenceBox: boolean;
		trackingBox: boolean;
		settings: boolean;
		stylesCard: boolean;
		trackingDisclaimerModal: boolean;
		about: boolean;
		grabDisclaimerModal: boolean;
		mapStyle?: GrabMapEnum;
	}>(initShow);
	const [height, setHeight] = React.useState(window.innerHeight);
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
		switchToAsiaRegionStack
	} = useAmplifyAuth();
	const { locationClient, createLocationClient, iotClient, createIotClient, resetStore: resetAwsStore } = useAws();
	const { attachPolicy } = useAwsIot();
	const { mapProvider: currentMapProvider, setMapProvider, setMapStyle } = useAmplifyMap();
	const {
		mapStyle: currentMapStyle,
		currentLocationData,
		setCurrentLocation,
		isAutomaticMapUnit,
		setAutomaticMapUnit
	} = useAmplifyMap();
	const {
		setViewpoint,
		setMarker,
		marker,
		selectedMarker,
		suggestions,
		viewpoint,
		bound,
		clearPoiList,
		zoom,
		setZoom,
		setSelectedMarker
	} = useAwsPlace();
	const { routeData, directions, resetStore: resetAwsRouteStore, setRouteData } = useAwsRoute();
	const { resetStore: resetAwsGeofenceStore } = useAwsGeofence();
	const { isEditingRoute, trackerPoints, setTrackerPoints, resetStore: resetAwsTrackingStore } = useAwsTracker();
	const { showWelcomeModal, setShowWelcomeModal } = usePersistedData();
	const isDesktop = useMediaQuery("(min-width: 1024px)");
	const shouldClearCredentials = localStorage.getItem(SHOULD_CLEAR_CREDENTIALS) === "true";

	useEffect(() => {
		if (isAutomaticMapUnit) {
			setAutomaticMapUnit();
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [isAutomaticMapUnit]);

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
		if (credentials && !locationClient) {
			createLocationClient(credentials, region);
		}

		if (credentials && !iotClient) {
			createIotClient(credentials, region);
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
			setTimeout(() => clearCredsAndLocationClient(), 0);
		}

		/* After logout */
		if (sign_out === "true") {
			window.history.replaceState(undefined, "", DEMO);
			!!credentials?.authenticated && !authTokens && _onLogout();
		}
	}, [setAuthTokens, clearCredsAndLocationClient, credentials, authTokens, _onLogout]);

	const _attachPolicy = useCallback(async () => {
		if (!!credentials?.authenticated && !!authTokens) {
			await attachPolicy(credentials.identityId);
		}
	}, [credentials, authTokens, attachPolicy]);

	/* Attach IoT policy to authenticated user to ensure successful websocket connection */
	useEffect(() => {
		_attachPolicy();
	}, [_attachPolicy]);

	const onResize = useCallback(() => setHeight(window.innerHeight), []);

	useEffect(() => {
		addEventListener("resize", onResize);

		return () => {
			removeEventListener("resize", onResize);
		};
	}, [onResize]);

	useEffect(() => {
		if (selectedMarker) {
			const { longitude: lng, latitude: lat } = viewpoint;
			mapViewRef?.current?.setCenter({ lat, lng });
		}
	}, [selectedMarker, viewpoint]);

	useEffect(() => {
		if (suggestions && bound) {
			mapViewRef.current?.fitBounds(bound as [number, number, number, number]);
		} else if (show.routeBox && routeData?.Summary.RouteBBox) {
			const boundingBox = routeData.Summary.RouteBBox;
			isDesktop
				? mapViewRef.current?.fitBounds(
						[
							[boundingBox[0], boundingBox[1]],
							[boundingBox[2], boundingBox[3]]
						],
						{
							padding: {
								top: 200,
								bottom: 200,
								left: 450,
								right: 200
							},
							speed: 5,
							linear: false
						}
				  )
				: mapViewRef.current?.fitBounds(
						[
							[boundingBox[0], boundingBox[1]],
							[boundingBox[2], boundingBox[3]]
						],
						{
							padding: {
								top: 235,
								bottom: 30,
								left: 60,
								right: 70
							},
							speed: 5,
							linear: false
						}
				  );
		}
	}, [suggestions, bound, show.routeBox, routeData, isDesktop]);

	useEffect(() => {
		if (directions) setShow(s => ({ ...s, routeBox: true }));
	}, [directions, show]);

	const onLoad = useCallback(() => {
		clearPoiList();
		geolocateControlRef.current?.trigger();
		routeData && setRouteData(routeData);
	}, [clearPoiList, routeData, setRouteData]);

	const getCurrentGeoLocation = useCallback(() => getCurrentLocation(setCurrentLocation), [setCurrentLocation]);

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

	const onGeoLocate = ({ coords: { latitude, longitude } }: GeolocateResultEvent) => {
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
	};

	const onGeoLocateError = (e: GeolocateErrorEvent) => {
		setCurrentLocation({ currentLocation: undefined, error: { ...omit(["type", "target"], e) } });

		if (e.code === e.PERMISSION_DENIED) {
			localStorage.setItem(GEO_LOCATION_ALLOWED, "no");
			showToast({
				content: "Location permission denied, please enable browser location and refresh the page",
				type: ToastType.ERROR
			});
		} else if (e.code === e.POSITION_UNAVAILABLE) {
			showToast({
				content: "Location permission unavailable, please try again",
				type: ToastType.ERROR
			});
		}
	};

	const handleMapClick = ({ lngLat }: MapLayerMouseEvent) => {
		if (lngLat) {
			const { lat: latitude, lng: longitude } = lngLat;

			if (!show.routeBox && !show.geofenceBox && !show.settings && !isEditingRoute) {
				marker && setMarker(undefined);
				selectedMarker && setSelectedMarker(undefined);
				setTimeout(() => setMarker({ latitude, longitude }), 0);
			}

			if (isEditingRoute) {
				if (trackerPoints) {
					trackerPoints.length < 25
						? setTrackerPoints([longitude, latitude])
						: showToast({ content: "Cannot set more than 25 points", type: ToastType.WARNING });
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
		setShow(s => ({ ...s, trackingDisclaimerModal: false, trackingBox: true }));
	};

	const locationError = useMemo(() => !!currentLocationData?.error, [currentLocationData]);

	const resetAppState = useCallback(() => {
		clearPoiList();
		resetAwsRouteStore();
		resetAwsGeofenceStore();
		resetAwsTrackingStore();
		setShow(s => ({ ...initShow, stylesCard: s.stylesCard, settings: s.settings }));
	}, [clearPoiList, resetAwsRouteStore, resetAwsGeofenceStore, resetAwsTrackingStore]);

	const transformRequest = useCallback(
		(url: string, resourceType: string) => {
			let newUrl = url;

			if (resourceType === "Style" && !newUrl.includes("://")) {
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

	const onHandleGrabMapChange = useCallback(() => {
		setShow(s => ({ ...s, grabDisclaimerModal: false }));
		switchToAsiaRegionStack();
		resetAwsStore();
		setMapProvider(MapProviderEnum.GRAB);
		setMapStyle(show.mapStyle ? show.mapStyle : GrabMapEnum.GRAB_STANDARD_LIGHT);
		resetAppState();
	}, [switchToAsiaRegionStack, resetAwsStore, setMapProvider, setMapStyle, show, resetAppState]);

	return credentials ? (
		<View style={{ height }}>
			<Map
				style={{ width: "100%", height: "100%" }}
				ref={mapViewRef}
				cursor={isEditingRoute ? "crosshair" : ""}
				maxTileCacheSize={100}
				zoom={zoom}
				initialViewState={
					currentLocationData?.currentLocation
						? { ...currentLocationData.currentLocation, zoom }
						: { ...viewpoint, zoom }
				}
				mapStyle={currentMapStyle}
				onClick={handleMapClick}
				onLoad={onLoad}
				onZoom={({ viewState }) => setZoom(viewState.zoom)}
				minZoom={2}
				maxBounds={
					currentMapProvider === MapProviderEnum.GRAB
						? (MAX_BOUNDS.GRAB as LngLatBoundsLike)
						: (MAX_BOUNDS.DEFAULT as LngLatBoundsLike)
				}
				onError={error => errorHandler(error.error)}
				onIdle={() => show.loader && setShow(s => ({ ...s, loader: false }))}
				transformRequest={transformRequest}
			>
				<View className={show.loader ? "loader-container" : ""}>
					{show.sidebar && (
						<Sidebar
							onCloseSidebar={() => setShow(s => ({ ...s, sidebar: false }))}
							onOpenConnectAwsAccountModal={() => setShow(s => ({ ...s, connectAwsAccount: true }))}
							onOpenSignInModal={() => setShow(s => ({ ...s, signInModal: true }))}
							onShowGeofenceBox={() => setShow(s => ({ ...s, geofenceBox: true }))}
							onShowTrackingBox={() => setShow(s => ({ ...s, trackingBox: true }))}
							onShowSettings={() => setShow(s => ({ ...s, settings: true }))}
							onShowTrackingDisclaimerModal={() => setShow(s => ({ ...s, trackingDisclaimerModal: true }))}
							onShowAboutModal={() => setShow(s => ({ ...s, about: true }))}
						/>
					)}
					{show.routeBox ? (
						<RouteBox
							mapRef={mapViewRef?.current}
							setShowRouteBox={b => setShow(s => ({ ...s, routeBox: b }))}
							isSideMenuExpanded={show.sidebar}
						/>
					) : show.geofenceBox ? (
						<GeofenceBox
							mapRef={mapViewRef?.current}
							setShowGeofenceBox={b => setShow(s => ({ ...s, geofenceBox: b }))}
						/>
					) : show.trackingBox ? (
						<TrackingBox
							mapRef={mapViewRef?.current}
							setShowTrackingBox={b => setShow(s => ({ ...s, trackingBox: b }))}
						/>
					) : (
						<SearchBox
							mapRef={mapViewRef?.current}
							isSideMenuExpanded={show.sidebar}
							onToggleSideMenu={() => setShow(s => ({ ...s, sidebar: !s.sidebar }))}
							setShowRouteBox={b => setShow(s => ({ ...s, routeBox: b }))}
							isRouteBoxOpen={show.routeBox}
							isGeofenceBoxOpen={show.geofenceBox}
							isTrackingBoxOpen={show.trackingBox}
							isSettingsOpen={show.settings}
							isStylesCardOpen={show.stylesCard}
						/>
					)}
					<MapButtons
						openStylesCard={show.stylesCard}
						setOpenStylesCard={b => setShow(s => ({ ...s, stylesCard: b }))}
						onCloseSidebar={() => setShow(s => ({ ...s, sidebar: false }))}
						onOpenConnectAwsAccountModal={() => setShow(s => ({ ...s, connectAwsAccount: true }))}
						onOpenSignInModal={() => setShow(s => ({ ...s, signInModal: true }))}
						onShowGeofenceBox={() => setShow(s => ({ ...s, geofenceBox: true }))}
						resetAppState={resetAppState}
						showGrabDisclaimerModal={show.grabDisclaimerModal}
						onShowGrabDisclaimerModal={(mapStyle?: GrabMapEnum) =>
							setShow(s => ({ ...s, grabDisclaimerModal: true, mapStyle }))
						}
					/>
					{locationError ? (
						<Flex className="location-disabled" onClick={getCurrentGeoLocation}>
							<IconLocateMe />
						</Flex>
					) : (
						<GeolocateControl
							style={{
								width: "2.46rem",
								height: "2.46rem",
								position: "absolute",
								top: "-9.5rem",
								right: "0.75rem",
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
					)}
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
				</View>
			</Map>
			<WelcomeModal open={showWelcomeModal} onClose={() => setShowWelcomeModal(false)} />
			<SignInModal open={show.signInModal} onClose={() => setShow(s => ({ ...s, signInModal: false }))} />
			<ConnectAwsAccountModal
				open={show.connectAwsAccount}
				onClose={() => setShow(s => ({ ...s, connectAwsAccount: false }))}
			/>
			<SettingsModal
				open={show.settings}
				onClose={() => setShow(s => ({ ...s, settings: false }))}
				resetAppState={resetAppState}
				onShowGrabDisclaimerModal={(mapStyle?: GrabMapEnum) =>
					setTimeout(() => setShow(s => ({ ...s, grabDisclaimerModal: true, mapStyle })), 0)
				}
			/>
			<AboutModal open={show.about} onClose={() => setShow(s => ({ ...s, about: false }))} />
			<InformationModal
				open={show.trackingDisclaimerModal}
				onClose={() => setShow(s => ({ ...s, trackingDisclaimerModal: false }))}
				heading="Enable Tracker"
				description={
					<Text
						className="regular-text"
						variation="tertiary"
						marginTop="1.23rem"
						textAlign="center"
						whiteSpace="pre-line"
					>
						You can use any data provider except Esri for your asset management or tracking use cases. If you want to
						use Esri for your asset management or tracking user case, please read{" "}
						<a
							style={{ cursor: "pointer", color: "var(--primary-color)" }}
							href={AMAZON_LOCATION_TERMS_AND_CONDITIONS}
							target="_blank"
							rel="noreferrer"
						>
							terms and conditions.
						</a>
					</Text>
				}
				onConfirm={onEnableTracking}
				hideCancelButton
			/>
			<GrabConfirmationModal
				open={show.grabDisclaimerModal}
				onClose={() => setShow(s => ({ ...s, grabDisclaimerModal: false, mapStyle: undefined }))}
				onConfirm={onHandleGrabMapChange}
			/>
			<Flex className="logo-stroke-container">
				{currentMapStyle.toLowerCase().includes("dark") ? <LogoDark /> : <LogoLight />}
			</Flex>
		</View>
	) : null;
};

export default DemoPage;
