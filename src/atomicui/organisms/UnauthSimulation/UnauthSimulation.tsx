import React, { Ref, useCallback, useEffect, useMemo, useRef, useState } from "react";

import { Button, Card, Flex, Text } from "@aws-amplify/ui-react";
import {
	IconBackArrow,
	IconClose,
	IconGeofence,
	IconGeofenceMarkerDisabled,
	IconNotificationBell,
	IconRadar,
	IconSegment,
	Simulation
} from "@demo/assets";
import { DropdownEl, Modal } from "@demo/atomicui/atoms";
import {
	ConfirmationModal,
	IconicInfoCard,
	NonStartUnauthSimulation,
	NotificationsBox,
	WebsocketBanner
} from "@demo/atomicui/molecules";
import { appConfig, busRoutesData } from "@demo/core";
import BottomSheetHeights from "@demo/core/constants/bottomSheetHeights";
import { useAwsGeofence, useBottomSheet, useDeviceMediaQuery } from "@demo/hooks";
import i18n from "@demo/locales/i18n";
import {
	MenuItemEnum,
	NotificationHistoryItemtype,
	SelectOption,
	TrackingHistoryItemtype,
	TrackingHistoryType,
	TrackingHistoryTypeEnum
} from "@demo/types";
import { ResponsiveUIEnum } from "@demo/types/Enums";
import { format, parseISO } from "date-fns";
import { LngLatBoundsLike } from "mapbox-gl";
import { useTranslation } from "react-i18next";
import { MapRef } from "react-map-gl";

import UnauthGeofencesSimulation from "./UnauthGeofencesSimulation";
import UnauthRouteSimulation from "./UnauthRouteSimulation";
import "./styles.scss";

const initialTrackingHistory: TrackingHistoryType = {
	bus_route_01: [],
	bus_route_02: [],
	bus_route_03: [],
	bus_route_04: [],
	bus_route_05: []
};
const busRoutesDropdown = [
	{ value: "bus_route_01", label: "Bus 01 Robson" },
	{ value: "bus_route_02", label: "Bus 02 Davie" },
	{ value: "bus_route_03", label: "Bus 03 Victoria" },
	{ value: "bus_route_04", label: "Bus 04 Knight" },
	{ value: "bus_route_05", label: "Bus 05 UBC" }
];

const {
	MAP_RESOURCES: {
		MAX_BOUNDS: { VANCOUVER }
	}
} = appConfig.default;
interface UnauthGeofenceBoxProps {
	mapRef: MapRef | null;
	from: MenuItemEnum;
	setShowUnauthGeofenceBox: (b: boolean) => void;
	setShowUnauthTrackerBox: (b: boolean) => void;
	setShowConnectAwsAccountModal: (b: boolean) => void;
	showStartUnauthSimulation: boolean;
	setShowStartUnauthSimulation: (b: boolean) => void;
	startSimulation: boolean;
	setStartSimulation: (b: boolean) => void;
	setShowUnauthSimulationBounds: (b: boolean) => void;
	clearCredsAndLocationClient?: () => void;
}

const UnauthGeofenceBox: React.FC<UnauthGeofenceBoxProps> = ({
	mapRef,
	from,
	setShowUnauthGeofenceBox,
	setShowUnauthTrackerBox,
	setShowConnectAwsAccountModal,
	showStartUnauthSimulation,
	setShowStartUnauthSimulation,
	startSimulation,
	setStartSimulation,
	setShowUnauthSimulationBounds,
	clearCredsAndLocationClient
}) => {
	const [trackingHistory, setTrackingHistory] = useState<TrackingHistoryType>(initialTrackingHistory);
	const [selectedRoutes, setSelectedRoutes] = useState<SelectOption[]>([busRoutesDropdown[0]]);
	const [busSelectedValue, setBusSelectedValue] = useState<SelectOption>(busRoutesDropdown[0]);
	const [isNotifications, setIsNotifications] = useState(false);
	const [confirmCloseSimulation, setConfirmCloseSimulation] = useState(false);
	const [isPlaying, setIsPlaying] = useState(true);
	const { unauthNotifications, setUnauthNotifications } = useAwsGeofence();
	const { Connection, isHidden } = WebsocketBanner(
		useCallback((n: NotificationHistoryItemtype) => {
			// Update tracking history with geofence notification, for geofence add "Bus stop number 1" to title and bus stop coords to description
			setTrackingHistory(prevState => {
				const count = prevState[n.busRouteId].filter(({ title }) => title.includes("Bus stop number")).length;
				const exists = prevState[n.busRouteId].find(({ description }) => description === n.coordinates);
				const title = exists ? exists.title : `Bus stop number ${count + 1}`;

				return {
					...prevState,
					[n.busRouteId]: [
						...prevState[n.busRouteId],
						{
							type: TrackingHistoryTypeEnum.BUS_STOP,
							title,
							description: n.coordinates,
							subDescription: n.createdAt
						}
					]
				};
			});
		}, []),
		startSimulation
	);
	const { ui, setUI, setBottomSheetHeight, setBottomSheetMinHeight, bottomSheetHeight } = useBottomSheet();
	const { t } = useTranslation();
	const currentLanguage = i18n.language;
	const unauthSimulationCtaText = t("unauth_simulation__cta.text");
	const trackingHistoryRef: Ref<HTMLDivElement> = useRef<HTMLDivElement>(null);
	const selectedRoutesIds = useMemo(() => selectedRoutes.map(route => route.value), [selectedRoutes]);
	const { isDesktop, isTablet } = useDeviceMediaQuery();
	const isNotDesktop = !isDesktop && ui;
	const nonStartRef = useRef<HTMLDivElement>(null);
	const cardRef = useRef<HTMLDivElement>(null);

	const isNonStartUnauthSimulation =
		(isNotDesktop &&
			[ResponsiveUIEnum.non_start_unauthorized_geofence, ResponsiveUIEnum.non_start_unauthorized_tracker].includes(
				ui
			)) ||
		!showStartUnauthSimulation;

	const isBeforeStartSimulation =
		isNotDesktop &&
		[ResponsiveUIEnum.before_start_unauthorized_geofence, ResponsiveUIEnum.before_start_unauthorized_tracker].includes(
			ui
		);

	useEffect(() => {
		startSimulation &&
			mapRef?.fitBounds(
				isDesktop
					? (VANCOUVER.DESKTOP as LngLatBoundsLike)
					: isTablet
					? (VANCOUVER.TABLET as LngLatBoundsLike)
					: (VANCOUVER.MOBILE as LngLatBoundsLike),
				{ linear: true }
			);
	}, [mapRef, startSimulation, isDesktop, isTablet]);

	useEffect(() => {
		if (
			isNonStartUnauthSimulation &&
			!isDesktop &&
			bottomSheetHeight !== (nonStartRef?.current?.clientHeight || 230) + 10
		) {
			setBottomSheetMinHeight(nonStartRef?.current?.clientHeight || 230);
			setBottomSheetHeight((nonStartRef?.current?.clientHeight || 230) + 10);
		}

		if (!isNonStartUnauthSimulation && !isBeforeStartSimulation && !isDesktop) {
			setBottomSheetMinHeight(BottomSheetHeights.explore.min);
			setBottomSheetHeight(window.innerHeight - 50);
		}
	}, [
		bottomSheetHeight,
		isBeforeStartSimulation,
		isDesktop,
		isNonStartUnauthSimulation,
		setBottomSheetHeight,
		setBottomSheetMinHeight
	]);

	const updateSelectedRoutes = useCallback(
		(selectedRoute: SelectOption) => {
			let routes = [...selectedRoutes];
			const exists = routes.some(route => route.value === selectedRoute.value);

			if (exists) {
				routes = routes.length === 1 ? routes : routes.filter(route => route.value !== selectedRoute.value);
			} else {
				routes.push(selectedRoute);
			}

			setSelectedRoutes(routes);
		},
		[selectedRoutes]
	);

	const handleClose = useCallback(
		() => (from === MenuItemEnum.GEOFENCE ? setShowUnauthGeofenceBox(false) : setShowUnauthTrackerBox(false)),
		[from, setShowUnauthGeofenceBox, setShowUnauthTrackerBox]
	);

	const handleCta = () => setShowStartUnauthSimulation(true);

	const handleEnableLive = () => {
		handleClose();
		setShowConnectAwsAccountModal(true);
	};

	const onCloseHandler = () => {
		clearCredsAndLocationClient && clearCredsAndLocationClient();
		setShowStartUnauthSimulation(false);
		handleClose();
		setUI(ResponsiveUIEnum.explore);
	};

	const StartSimulation = useCallback(() => {
		return (
			<Flex
				position="relative"
				height={`${
					!["en"].includes(currentLanguage) ? `${currentLanguage === "pt-BR" ? "51.5rem" : "50rem"}` : "46rem"
				}`}
			>
				<Flex className="start-simulation-container">
					<Flex justifyContent="center">
						<Simulation className="simulation-icon" />
					</Flex>
					<Flex className="text-container">
						<Flex direction="column" gap="0.5rem">
							<Text
								color={"var(--grey-color)"}
								fontSize="1.23rem"
								textAlign="center"
								variation="tertiary"
								fontFamily="AmazonEmber-Regular"
								lineHeight="1.75rem"
							>
								{t("simulation.text")}
							</Text>
							<Text
								fontSize="1.53rem"
								textAlign="center"
								variation="secondary"
								fontFamily="AmazonEmber-Bold"
								lineHeight="1.4rem"
							>
								{t("start_unauth_simulation__heading.text")}
							</Text>
							<Text
								color="var(--grey-color)"
								fontSize="1rem"
								textAlign="center"
								variation="tertiary"
								padding="0.4rem 1.1rem"
								lineHeight="1.35rem"
							>
								{t("start_unauth_simulation__desc.text")}
							</Text>
						</Flex>
						<Flex direction="column" gap={0}>
							<IconicInfoCard
								gap="0"
								textContainerMarginLeft="2rem"
								IconComponent={<IconRadar className="primary-icon" width={24} height={24} />}
								title={t("trackers.text")}
								description={t("start_unauth_simulation__info1_desc.text")}
								cardMargin={"0.923rem 0"}
							/>
							<IconicInfoCard
								gap="0"
								textContainerMarginLeft="2rem"
								IconComponent={<IconGeofence className="primary-icon geofence-icon" width={40} height={30} />}
								title={t("geofences.text")}
								description={t("start_unauth_simulation__info2_desc.text")}
								cardMargin={"0.923rem 0"}
							/>
							<IconicInfoCard
								gap="0"
								textContainerMarginLeft="2rem"
								IconComponent={<IconNotificationBell className="primary-icon" width={32} height={30} />}
								title={t("notifications.text")}
								description={t("start_unauth_simulation__info3_desc.text")}
								cardMargin={"0.923rem 0"}
							/>
						</Flex>
						<Button
							data-testid="start-simulation-btn"
							variation="primary"
							padding="0.923rem 0"
							onClick={() => {
								if (isDesktop) {
									setStartSimulation(true);
									setShowUnauthSimulationBounds(true);
								} else {
									setStartSimulation(true);
									setBottomSheetMinHeight(BottomSheetHeights.routes.max);
									setBottomSheetHeight(BottomSheetHeights.routes.max);
									setTimeout(() => {
										setBottomSheetMinHeight(BottomSheetHeights.routes.min);
									}, 300);
									from === MenuItemEnum.TRACKER
										? setUI(ResponsiveUIEnum.unauth_tracker)
										: setUI(ResponsiveUIEnum.unauth_geofence);
									setShowUnauthSimulationBounds(true);
								}
							}}
							fontFamily="AmazonEmber-Medium"
							fontSize="1.077rem"
							height="3.075rem"
							marginTop="0.923rem"
						>
							{t("start_unauth_simulation__start_simulation.text")}
						</Button>
					</Flex>
				</Flex>
			</Flex>
		);
	}, [
		currentLanguage,
		t,
		setStartSimulation,
		setBottomSheetMinHeight,
		setBottomSheetHeight,
		from,
		setUI,
		setShowUnauthSimulationBounds,
		isDesktop
	]);

	const renderGeofences = useMemo(
		() =>
			busRoutesData
				.filter(({ id }) => selectedRoutesIds.includes(id))
				.map(({ id, name, geofenceCollection }) => (
					<UnauthGeofencesSimulation key={id} id={id} name={name} geofenceCollection={geofenceCollection} />
				)),
		[selectedRoutesIds]
	);

	const renderRoutes = useMemo(
		() =>
			busRoutesData
				.filter(({ id }) => selectedRoutesIds.includes(id))
				.map(({ id, name, geofenceCollection, coordinates }) => (
					<UnauthRouteSimulation
						key={id}
						id={id}
						name={name}
						geofenceCollection={geofenceCollection}
						coordinates={coordinates}
						isPlaying={isPlaying}
						disabled={!selectedRoutesIds.includes(id)}
						updateTrackingHistory={(id: string, newTrackingHistory: TrackingHistoryItemtype) =>
							setTrackingHistory(prevState => ({
								...prevState,
								[id]: [...prevState[id], newTrackingHistory]
							}))
						}
					/>
				)),
		[isPlaying, selectedRoutesIds]
	);

	const onBackHandler = useCallback(() => {
		if (isNotifications) {
			setIsNotifications(false);
		} else {
			setConfirmCloseSimulation(true);
			from === MenuItemEnum.GEOFENCE
				? setUI(ResponsiveUIEnum.exit_unauthorized_geofence)
				: setUI(ResponsiveUIEnum.exit_unauthorized_tracker);
		}
	}, [from, isNotifications, setUI]);

	const BeforeStartSimulation = () => (
		<>
			<Flex justifyContent="flex-end" padding="0.77rem">
				<Flex className="card-close">
					<IconClose className="grey-icon" width={20} height={20} onClick={onCloseHandler} />
				</Flex>
			</Flex>
			<StartSimulation />
		</>
	);

	const ExitSimulation = () => (
		<Flex className="confirmation-modal-container">
			<ConfirmationModal
				open={confirmCloseSimulation}
				onClose={onCloseHandler}
				heading={t("start_unauth_simulation__exit_simulation.text") as string}
				description={
					<Text
						className="small-text"
						variation="tertiary"
						marginTop="1.23rem"
						textAlign="center"
						whiteSpace="pre-line"
					>
						{t("start_unauth_simulation__exit_simulation_desc.text")}
					</Text>
				}
				onConfirm={() => setConfirmCloseSimulation(false)}
				confirmationText={t("start_unauth_simulation__stay_in_simulation.text") as string}
				cancelationText={t("exit.text") as string}
			/>
		</Flex>
	);

	if (isNonStartUnauthSimulation)
		return (
			<NonStartUnauthSimulation
				from={from}
				handleClose={handleClose}
				handleCta={() => {
					setUI(
						from === MenuItemEnum.GEOFENCE
							? ResponsiveUIEnum.before_start_unauthorized_geofence
							: ResponsiveUIEnum.before_start_unauthorized_tracker
					);
					handleCta();
				}}
				handleEnableLive={handleEnableLive}
				unauthSimulationCtaText={unauthSimulationCtaText}
				startRef={nonStartRef}
			/>
		);

	return (
		<>
			{isBeforeStartSimulation ? (
				<Modal
					open
					onClose={() => {}}
					hideCloseIcon
					className={`unauthSimulation-card ${
						isTablet ? "unauth-non-start-simulation-card-tablet" : "unauth-non-start-simulation-card-mobile"
					}`}
					content={<BeforeStartSimulation />}
				/>
			) : (
				<Card
					className={`unauthSimulation-card ${!isDesktop ? "unauthSimulation-card-mobile" : ""}`}
					left={isDesktop ? "1.62rem" : "0"}
					overflow={startSimulation ? "initial" : "hidden"}
				>
					{!startSimulation &&
					ui &&
					![ResponsiveUIEnum.unauth_geofence, ResponsiveUIEnum.unauth_tracker].includes(ui) ? (
						<BeforeStartSimulation />
					) : (
						<Flex className="simulation-container" direction="column" gap="0">
							<Flex
								className={`simulation-header ${!isDesktop ? "simulation-header-mobile" : ""}`}
								justifyContent="space-between"
								direction={isDesktop ? "row" : "row-reverse"}
							>
								<Flex alignItems="center" padding="0.6rem 0 0.6rem 1.2rem">
									{isDesktop ? (
										<IconBackArrow
											data-testid="unauth-simulation-back-arrow"
											className="back-icon"
											cursor="pointer"
											width={20}
											height={20}
											onClick={onBackHandler}
										/>
									) : (
										<IconClose
											style={{ marginRight: "0.5rem" }}
											onClick={onBackHandler}
											className="back-icon"
											cursor="pointer"
											width={20}
											height={20}
										/>
									)}
									{isDesktop && (
										<Text className="medium" fontSize="1.08rem" textAlign="center" marginLeft="0.5rem">
											{t("start_unauth_simulation__t&g_simulation.text")}
										</Text>
									)}
								</Flex>
								<Flex
									padding="0.6rem"
									className={isNotifications ? "bell-icon-container bell-active" : "bell-icon-container"}
									onClick={() => setIsNotifications(n => !n)}
									position="relative"
								>
									<IconNotificationBell className="bell-icon" width={20} height={20} />
									{!isNotifications && !!unauthNotifications.length && <span className="notification-bubble" />}
								</Flex>
							</Flex>
							<Flex gap="0" direction="column" width="100%" marginTop={!isDesktop ? "21px" : "0"} ref={cardRef}>
								{Connection}
								{!isNotifications ? (
									<Flex
										padding="1.3rem"
										direction="column"
										gap="0"
										maxHeight={isHidden ? "82vh" : "79vh"}
										overflow={
											!trackingHistory[busSelectedValue.value].length ||
											(trackingHistoryRef?.current?.offsetHeight || 0) < 560
												? "visible"
												: "hidden"
										}
										ref={trackingHistoryRef}
									>
										<Text className="bold" fontSize="0.92rem">
											{t("start_unauth_simulation__routes_notifications.text")}
										</Text>
										<Flex className="routes-notification-container" marginTop="0.5rem">
											<DropdownEl
												defaultOption={selectedRoutes}
												options={busRoutesDropdown}
												onSelect={value => value && updateSelectedRoutes(value)}
												label={
													!!selectedRoutes.length
														? `${selectedRoutes.length} ${t("start_unauth_simulation__routes_active.text")}`
														: (t("start_unauth_simulation__select_route.text") as string)
												}
												arrowIconColor={"var(--tertiary-color)"}
												showSelected
												bordered
												isCheckbox
											/>
											<Button
												data-testid={isPlaying ? "pause-button" : "simulate-button"}
												variation="primary"
												onClick={() => setIsPlaying(!isPlaying)}
											>
												{isPlaying ? t("tracker_box__pause.text") : t("tracker_box__simulate.text")}
											</Button>
										</Flex>
										<Flex className="bus-container">
											<Text className="bold" fontSize="0.92rem">
												{t("start_unauth_simulation__tracking_history.text")}
											</Text>
											<DropdownEl
												defaultOption={busSelectedValue}
												options={busRoutesDropdown}
												onSelect={value => value && setBusSelectedValue(value)}
												label={
													!!busSelectedValue
														? `${busSelectedValue?.label}`
														: (t("start_unauth_simulation__select_bus.text") as string)
												}
												showSelected
												isRadioBox
											/>
										</Flex>
										{!trackingHistory[busSelectedValue.value].length && (
											<Flex className="no-tracking-history">
												{t("start_unauth_simulation__no_tracking_history.text")}
											</Flex>
										)}
										<Flex gap="0" className="tracking-history-container">
											<Flex direction="column" gap="0" paddingLeft="0.2rem" paddingBottom="0.4rem">
												{trackingHistory[busSelectedValue.value].map(
													({ title, description, subDescription, type }, idx) => (
														<Flex key={idx}>
															<Flex
																className="tracking-icon-container"
																gap="0"
																position="relative"
																top="1.8rem"
																left={type === TrackingHistoryTypeEnum.BUS_STOP ? "-0.2rem" : "0.2rem"}
																minHeight={type === TrackingHistoryTypeEnum.BUS_STOP ? "5rem" : "4.3rem"}
															>
																{type === TrackingHistoryTypeEnum.BUS_STOP ? (
																	<IconGeofenceMarkerDisabled className="geofence-icon" width={23} height={23} />
																) : (
																	<IconSegment width={14} height={14} />
																)}
																{idx !== trackingHistory[busSelectedValue.value].length - 1 && (
																	<Flex
																		direction="column"
																		gap={type === TrackingHistoryTypeEnum.BUS_STOP ? "0.5rem" : "0.4rem"}
																		margin="0.75rem 0"
																	>
																		<Flex className="bubble-icon" />
																		<Flex className="bubble-icon" />
																		<Flex className="bubble-icon" />
																	</Flex>
																)}
															</Flex>
															<IconicInfoCard
																title={title}
																description={description || ""}
																subDescription={format(parseISO(subDescription), "hh:mm aa")}
																textContainerMarginLeft={
																	type === TrackingHistoryTypeEnum.BUS_STOP ? "0.7rem" : "1.33rem"
																}
																cardMargin={"0"}
																cardAlignItems="center"
															/>
														</Flex>
													)
												)}
											</Flex>
										</Flex>
									</Flex>
								) : (
									<NotificationsBox
										maxHeight={isHidden ? 76.4 : 73.4}
										selectedRoutesIds={selectedRoutesIds}
										unauthNotifications={unauthNotifications}
										setUnauthNotifications={setUnauthNotifications}
									/>
								)}
							</Flex>
							{renderGeofences}
							{renderRoutes}
						</Flex>
					)}
				</Card>
			)}

			{isDesktop && <ExitSimulation />}
		</>
	);
};

export default UnauthGeofenceBox;
