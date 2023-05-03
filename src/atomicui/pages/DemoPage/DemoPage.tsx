/* Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved. */
/* SPDX-License-Identifier: MIT-0 */

import React, { useCallback, useEffect, useMemo, useRef } from "react";

import { Flex, Text, View } from "@aws-amplify/ui-react";
import { IconLocateMe, LogoStroke } from "@demo/assets";
import {
	ConnectAwsAccountModal,
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
import appConfig from "@demo/core/constants/appConfig";
import {
	useAmplifyAuth,
	useAmplifyMap,
	useAws,
	useAwsGeofence,
	useAwsIot,
	useAwsPlace,
	useAwsRoute,
	useAwsTracker,
	usePersistedData
} from "@demo/hooks";
import { ToastType } from "@demo/types";
import { errorHandler } from "@demo/utils/errorHandler";
import { getCurrentLocation } from "@demo/utils/getCurrentLocation";
import { Signer } from "aws-amplify";
import { differenceInMilliseconds } from "date-fns";
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
import { useLocation } from "react-router-dom";

import "./styles.scss";

const {
	PERSIST_STORAGE_KEYS: { GEO_LOCATION_ALLOWED },
	AMAZON_LOCATION_TERMS_AND_CONDITIONS,
	ROUTES: { DEMO }
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
	about: false
};

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
	}>(initShow);
	const [height, setHeight] = React.useState(window.innerHeight);
	const mapViewRef = useRef<MapRef | null>(null);
	const geolocateControlRef = useRef<GeolocateControlRef | null>(null);
	const { credentials, getCurrentUserCredentials, clearCredentials, region, authTokens, setAuthTokens, onLogout } =
		useAmplifyAuth();
	const { locationClient, createLocationClient, iotClient, createIotClient, resetStore: resetAwsStore } = useAws();
	const { attachPolicy } = useAwsIot();
	const { mapStyle, currentLocationData, setCurrentLocation } = useAmplifyMap();
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
	const location = useLocation();

	const clearCredsAndLocationClient = useCallback(() => {
		clearCredentials();
		resetAwsStore();
	}, [clearCredentials, resetAwsStore]);

	if (!!credentials && !credentials?.identityId) {
		clearCredsAndLocationClient();
	}

	/* Fetch credentials when the app loads and set refresh timeout for when they expire */
	useEffect(() => {
		if (!credentials) {
			getCurrentUserCredentials();
		} else {
			setTimeout(() => {
				clearCredsAndLocationClient();
			}, differenceInMilliseconds(new Date(credentials.expiration || 0), new Date()));
		}
	}, [credentials, getCurrentUserCredentials, clearCredsAndLocationClient]);

	/* Instantiate location and iot client from aws-sdk whenever the credentials change */
	useEffect(() => {
		if (credentials && !locationClient) {
			createLocationClient(credentials, region);
		}

		if (credentials && !iotClient) {
			createIotClient(credentials, region);
		}
	}, [credentials, locationClient, createLocationClient, region, iotClient, createIotClient]);

	/* Clear old credentials to fetch new auth credentials when user signs in and save authTokens */
	useEffect(() => {
		const { hash } = location;
		const hashArr = hash.slice(1).split("&");

		if (hashArr.length > 1 && ["id_token", "access_token"].includes(hashArr[0].split("=")[0])) {
			setAuthTokens({
				id_token: hashArr[0].split("=")[1],
				access_token: hashArr[1].split("=")[1],
				expires_in: hashArr[2].split("=")[1],
				token_type: hashArr[3].split("=")[1],
				state: hashArr[4].split("=")[1]
			});
			location.hash = "";
			setTimeout(() => clearCredsAndLocationClient(), 0);
		}
	}, [location, setAuthTokens, clearCredsAndLocationClient]);

	const _attachPolicy = useCallback(async () => {
		if (!!credentials?.authenticated && !!authTokens) {
			await attachPolicy(credentials.identityId);
		}
	}, [credentials, authTokens, attachPolicy]);

	/* Attach policy to authenticated user to ensure successful websocket connection */
	useEffect(() => {
		_attachPolicy();
	}, [_attachPolicy]);

	const _onLogout = useCallback(async () => {
		await onLogout();
		clearCredentials();
		resetAwsStore();
	}, [onLogout, clearCredentials, resetAwsStore]);

	/* Sign user out when sign_out queary params received */
	useEffect(() => {
		const { search } = location;

		if (search && search === "?sign_out=true" && !!credentials?.authenticated) {
			window.history.replaceState(undefined, "", DEMO);
			_onLogout();
		}
	}, [location, credentials, _onLogout]);

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
			mapViewRef.current?.fitBounds(
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
			);
		}
	}, [suggestions, bound, show.routeBox, routeData]);

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

	const resetAppState = () => {
		clearPoiList();
		resetAwsRouteStore();
		resetAwsGeofenceStore();
		resetAwsTrackingStore();
		setShow(s => ({ ...initShow, stylesCard: s.stylesCard, settings: s.settings }));
	};

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

	return credentials ? (
		<>
			<Map
				style={{ width: "100%", height: height }}
				ref={mapViewRef}
				cursor={isEditingRoute ? "crosshair" : ""}
				maxTileCacheSize={100}
				zoom={zoom}
				initialViewState={
					currentLocationData?.currentLocation
						? { ...currentLocationData.currentLocation, zoom }
						: { ...viewpoint, zoom }
				}
				mapStyle={mapStyle}
				onClick={handleMapClick}
				onLoad={onLoad}
				onZoom={({ viewState }) => setZoom(viewState.zoom)}
				minZoom={2}
				maxBounds={[-210, -80, 290, 85]}
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
			<Flex className="logo-stroke-container">
				<img src={LogoStroke} />
			</Flex>
		</>
	) : null;
};

export default DemoPage;
