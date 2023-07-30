import { Ref, useCallback, useEffect, useMemo, useRef, useState } from "react";

import { Button, Card, Flex, Text } from "@aws-amplify/ui-react";
import {
	IconBackArrow,
	IconBell,
	IconClose,
	IconGeofence,
	IconGeofenceColor,
	IconGeofenceMarkerDisabled,
	IconRadar,
	IconSegment,
	IconTrackers,
	Simulation
} from "@demo/assets";
import { DropdownEl } from "@demo/atomicui/atoms";
import { ConfirmationModal, IconicInfoCard, NotificationsBox, WebsocketBanner } from "@demo/atomicui/molecules";
import { appConfig, busRoutesData } from "@demo/core";
import { useAmplifyMap } from "@demo/hooks";
import {
	MenuItemEnum,
	NotificationHistoryItemtype,
	SelectOption,
	TrackingHistoryItemtype,
	TrackingHistoryType,
	TrackingHistoryTypeEnum
} from "@demo/types";
import { PubSub } from "aws-amplify";
import { format, parseISO } from "date-fns";
import { useTranslation } from "react-i18next";
import { MapRef } from "react-map-gl";

import UnauthGeofencesSimulation from "./UnauthGeofencesSimulation";
import UnauthRouteSimulation from "./UnauthRouteSimulation";
import "./styles.scss";

const {
	MAP_RESOURCES: {
		AMAZON_HQ: { US }
	}
} = appConfig.default;
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

interface UnauthGeofenceBoxProps {
	mapRef: MapRef | null;
	from: MenuItemEnum;
	setShowUnauthGeofenceBox: (b: boolean) => void;
	setShowUnauthTrackerBox: (b: boolean) => void;
	setShowConnectAwsAccountModal: (b: boolean) => void;
}

const UnauthGeofenceBox: React.FC<UnauthGeofenceBoxProps> = ({
	mapRef,
	from,
	setShowUnauthGeofenceBox,
	setShowUnauthTrackerBox,
	setShowConnectAwsAccountModal
}) => {
	const [showStartUnauthSimulation, setShowStartUnauthSimulation] = useState(false);
	const [startSimulation, setStartSimulation] = useState(false);
	const [trackingHistory, setTrackingHistory] = useState<TrackingHistoryType>(initialTrackingHistory);
	const [selectedRoutes, setSelectedRoutes] = useState<SelectOption[]>([busRoutesDropdown[0]]);
	const [busSelectedValue, setBusSelectedValue] = useState<SelectOption>(busRoutesDropdown[0]);
	const [isNotifications, setIsNotifications] = useState(false);
	const [confirmCloseSimulation, setConfirmCloseSimulation] = useState(false);
	const [isPlaying, setIsPlaying] = useState(false);
	const { currentLocationData } = useAmplifyMap();
	const { subscription, Connection, isHidden } = WebsocketBanner(
		useCallback((n: NotificationHistoryItemtype) => {
			// Update tracking history with geofence notification, for geofence add "Bus stop number 1" to title and bus stop coords to description
			setTrackingHistory(prevState => {
				const count = prevState[n.busRouteId].filter(({ title }) => title.includes("Bus stop number")).length;
				const exists = prevState[n.busRouteId].find(({ description }) => description === n.coordinates);
				const title = `Bus stop number ${count + 1}`;

				return !exists
					? {
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
					  }
					: { ...prevState };
			});
		}, [])
	);
	const { t } = useTranslation();
	const trackingHistoryRef: Ref<HTMLDivElement> = useRef<HTMLDivElement>(null);
	const selectedRoutesIds = useMemo(() => selectedRoutes.map(route => route.value), [selectedRoutes]);

	useEffect(() => {
		mapRef?.zoomTo(2);

		return () => {
			currentLocationData?.currentLocation
				? mapRef?.flyTo({
						center: [currentLocationData.currentLocation.longitude, currentLocationData.currentLocation.latitude],
						zoom: 15
				  })
				: mapRef?.flyTo({
						center: [US.longitude, US.latitude],
						zoom: 15
				  });
		};
	}, [mapRef, currentLocationData]);

	const updateSelectedRoutes = useCallback(
		(selectedRoute: SelectOption) => {
			let routes = [...selectedRoutes];
			const exists = routes.some(route => route.value === selectedRoute.value);

			if (exists) {
				routes = routes.length === 1 ? routes : routes.filter(route => route.value !== selectedRoute.value);
			} else {
				routes.push(selectedRoute);
				setIsPlaying(false);
			}

			setSelectedRoutes(routes);
		},
		[selectedRoutes]
	);

	const handleClose = () =>
		from === MenuItemEnum.GEOFENCE ? setShowUnauthGeofenceBox(false) : setShowUnauthTrackerBox(false);

	const handleCta = () => setShowStartUnauthSimulation(true);

	const handleEnableLive = () => {
		handleClose();
		setShowConnectAwsAccountModal(true);
	};

	const onCloseHandler = () => {
		subscription?.unsubscribe();
		PubSub.removePluggable("AWSIoTProvider");
		setShowStartUnauthSimulation(false);
		handleClose();
		window.location.reload();
	};

	const StartSimulation = useCallback(() => {
		return (
			<Flex position="relative" height="47rem">
				<Flex className="start-simulation-container">
					<Flex justifyContent="center">
						<Simulation className="simulation-icon" />
					</Flex>
					<Flex className="text-container">
						<Flex direction="column">
							<Text color={"var(--grey-color)"} fontSize="1.08rem" textAlign="center" variation="tertiary">
								{t("simulation.text")}
							</Text>
							<Text fontSize="1.8rem" textAlign="center" variation="secondary" fontFamily="AmazonEmber-Medium">
								{t("start_unauth_simulation__heading.text")}
							</Text>
							<Text color="var(--grey-color)" fontSize="1rem" textAlign="center" variation="tertiary">
								{t("start_unauth_simulation__desc.text")}
							</Text>
						</Flex>
						<IconicInfoCard
							IconComponent={<IconRadar className="primary-icon" width={24} height={24} />}
							title={t("trackers.text")}
							description={t("start_unauth_simulation__info1_desc.text")}
						/>
						<IconicInfoCard
							IconComponent={<IconGeofence className="primary-icon geofence-icon" width={40} height={26} />}
							title={t("geofences.text")}
							description={t("start_unauth_simulation__info2_desc.text")}
						/>
						<IconicInfoCard
							IconComponent={<IconBell className="primary-icon" width={30} height={25} />}
							title={t("notifications.text")}
							description={t("start_unauth_simulation__info3_desc.text")}
						/>
						<Button variation="primary" padding="0.8rem 0" onClick={() => setStartSimulation(true)}>
							{t("start_unauth_simulation__start_simulation.text")}
						</Button>
					</Flex>
				</Flex>
			</Flex>
		);
	}, [t]);

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
			busRoutesData.map(({ id, name, geofenceCollection, coordinates }) => (
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

	return (
		<>
			{!showStartUnauthSimulation ? (
				<Card data-testid="unauth-simulation-card" className="unauth-simulation-card" left={21}>
					<Flex
						data-testid="unauth-simulation-card-header-close"
						className="unauth-simulation-card-header"
						onClick={handleClose}
					>
						<IconClose />
					</Flex>
					<Flex className="unauth-simulation-card-body">
						{from === MenuItemEnum.GEOFENCE ? <IconGeofenceColor /> : <IconTrackers />}
						<Text className="bold medium-text" marginTop="1.5rem">
							{from === MenuItemEnum.GEOFENCE ? t("geofences.text") : t("trackers.text")}
						</Text>
						<Text className="small-text" color="var(--grey-color)" textAlign="center" marginTop="0.8rem">
							{from === MenuItemEnum.GEOFENCE
								? t("unauth_simulation__geofence_box_info.text")
								: t("unauth_simulation__tracker_box_info.text")}
						</Text>
						<Button
							data-testid="unauth-simulation-cta"
							variation="primary"
							marginTop="1.5rem"
							isFullWidth
							onClick={handleCta}
						>
							{t("unauth_simulation__cta.text")}
						</Button>
					</Flex>
					<Flex className="unauth-simulation-card-footer">
						<Text
							data-testid="unauth-simulation-enable-live"
							className="small-text"
							color="var(--primary-color)"
							style={{ cursor: "pointer" }}
							onClick={handleEnableLive}
						>{`${t("unauth_simulation__enable_live.text")} ${
							from === MenuItemEnum.GEOFENCE ? t("geofences.text") : t("trackers.text")
						}`}</Text>
						<Text fontSize="0.77rem" marginTop="0.08rem" color="var(--grey-color)">
							{t("unauth_simulation__disclaimer.text")}
						</Text>
					</Flex>
				</Card>
			) : (
				<>
					<Card className="unauthSimulation-card" left="1.62rem" overflow={startSimulation ? "inherit" : "hidden"}>
						{!startSimulation ? (
							<>
								<Flex justifyContent="flex-end" padding="0.77rem">
									<Flex className="card-close">
										<IconClose className="close-icon" width={20} height={20} onClick={onCloseHandler} />
									</Flex>
								</Flex>
								<StartSimulation />
							</>
						) : (
							<Flex className="simulation-container" direction="column" gap="0">
								<Flex className="simulation-header" justifyContent="space-between">
									<Flex alignItems="center" padding="0.6rem 0 0.6rem 1.2rem">
										<IconBackArrow
											className="back-icon"
											cursor="pointer"
											width={20}
											height={20}
											onClick={() => {
												if (isNotifications) {
													setIsNotifications(false);
												} else {
													setConfirmCloseSimulation(true);
												}
											}}
										/>
										<Text className="medium" fontSize="1.08rem" textAlign="center" marginLeft="0.5rem">
											{t("start_unauth_simulation__t&g_simulation.text")}
										</Text>
									</Flex>
									<Flex
										padding="0.6rem"
										className={isNotifications ? "bell-icon-container bell-active" : "bell-icon-container"}
										onClick={() => setIsNotifications(n => !n)}
										position="relative"
									>
										<IconBell className="bell-icon" width={20} height={20} />
										{!isNotifications && <span className="notification-bubble" />}
									</Flex>
								</Flex>
								<Flex gap="0" direction="column" width="100%">
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
												<Button variation="primary" onClick={() => setIsPlaying(!isPlaying)}>
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
											<Flex gap="0" overflow="scroll">
												<Flex direction="column" gap="0" marginTop="2rem">
													{trackingHistory[busSelectedValue.value].map(({ type }, idx) => (
														<Flex key={idx} className="tracking-icon-container" gap="0">
															{type === TrackingHistoryTypeEnum.BUS_STOP ? (
																<IconGeofenceMarkerDisabled className="geofence-icon" width={22} height={22} />
															) : (
																<IconSegment width={15} height={15} />
															)}
															{idx !== trackingHistory[busSelectedValue.value].length - 1 && (
																<Flex direction="column" gap="0.5rem" margin="0.7rem 0">
																	<Flex className="bubble-icon" />
																	<Flex className="bubble-icon" />
																	<Flex className="bubble-icon" />
																</Flex>
															)}
														</Flex>
													))}
												</Flex>
												<Flex direction="column" gap="0" paddingLeft="1.5rem">
													{trackingHistory[busSelectedValue.value].map(
														({ title, description, subDescription }, idx) => (
															<IconicInfoCard
																key={idx}
																title={title}
																description={description || ""}
																subDescription={format(parseISO(subDescription), "hh:mm aa")}
																textContainerMarginLeft="0"
																cardMargin="0.6rem 0"
																cardAlignItems="center"
															/>
														)
													)}
												</Flex>
											</Flex>
										</Flex>
									) : (
										<NotificationsBox maxHeight={isHidden ? 76.4 : 73.4} selectedRoutesIds={selectedRoutesIds} />
									)}
								</Flex>
								{renderGeofences}
								{renderRoutes}
							</Flex>
						)}
					</Card>
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
				</>
			)}
		</>
	);
};

export default UnauthGeofenceBox;
