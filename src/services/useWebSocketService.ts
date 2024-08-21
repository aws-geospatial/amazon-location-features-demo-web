/* Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved. */
/* SPDX-License-Identifier: MIT-0 */

import { useCallback, useEffect, useMemo, useRef, useState } from "react";

import { showToast } from "@demo/core/Toast";
import { useAuth, useGeofence } from "@demo/hooks";
import i18n from "@demo/locales/i18n";
import { EventTypeEnum, MqttConnectionState, NotificationHistoryItemtype, ToastType } from "@demo/types";
import { record } from "@demo/utils/analyticsUtils";
import { getDomainName } from "@demo/utils/getDomainName";
import { iot, mqtt } from "aws-iot-device-sdk-v2";
import { equals } from "ramda";

const authEvents: unknown[] = [];
const unauthEvents: unknown[] = [];
const { CLOSED, CONNECT, CONNECTION_FAILURE, CONNECTION_SUCCESS, DISCONNECT, ERROR, INTERRUPT, RESUME } =
	MqttConnectionState;

const useWebSocketService = (
	updateTrackingHistory?: (n: NotificationHistoryItemtype) => void,
	startSocketConnection = true
): { connectionState: MqttConnectionState } => {
	const [mqttClient, setMqttClient] = useState<mqtt.MqttClientConnection | null>(null);
	const [connectionState, setConnectionState] = useState<MqttConnectionState>(CLOSED);
	const timeoutId = useRef<NodeJS.Timeout | null>(null);
	const areEventListenersSet = useRef(false);
	const { region, webSocketUrl, credentials } = useAuth();
	const { setUnauthNotifications } = useGeofence();

	/* Terminate connection and subscription on unmount */
	useEffect(() => {
		if (timeoutId.current) clearTimeout(timeoutId.current);

		return () => {
			if (timeoutId.current) clearTimeout(timeoutId.current);

			timeoutId.current = setTimeout(async () => {
				if (mqttClient) {
					await mqttClient.unsubscribe(`${credentials!.identityId}/tracker`);
					await mqttClient.disconnect();
					mqttClient.removeAllListeners();
					setMqttClient(null);
					areEventListenersSet.current = false;
				}
			}, 1000);
		};
	}, [mqttClient, credentials]);

	/* Setup listeners */
	useEffect(() => {
		if (mqttClient && !areEventListenersSet.current) {
			areEventListenersSet.current = true;

			mqttClient.setMaxListeners(8);

			mqttClient.on(CLOSED, () => {
				console.info(CLOSED);
				setConnectionState(CLOSED);
			});

			mqttClient.on(CONNECT, () => {
				console.info(CONNECT);
				setConnectionState(CONNECT);
			});

			mqttClient.on(CONNECTION_FAILURE, error => {
				console.error(CONNECTION_FAILURE, error);
				setConnectionState(CONNECTION_FAILURE);
			});

			mqttClient.on(CONNECTION_SUCCESS, () => {
				console.info(CONNECTION_SUCCESS);
				setConnectionState(CONNECTION_SUCCESS);
			});

			mqttClient.on(DISCONNECT, () => {
				console.info(DISCONNECT);
				setConnectionState(DISCONNECT);
			});

			mqttClient.on(ERROR, error => {
				console.error(ERROR, { error });
				setConnectionState(ERROR);
			});

			mqttClient.on(INTERRUPT, () => {
				console.info(INTERRUPT);
				setConnectionState(INTERRUPT);
			});

			mqttClient.on(RESUME, () => {
				console.info(RESUME);
				setConnectionState(RESUME);
			});
		}
	}, [mqttClient, connectionState]);

	const config = useMemo(
		() =>
			iot.AwsIotMqttConnectionConfigBuilder.new_with_websockets()
				.with_clean_session(false)
				.with_client_id(credentials!.identityId)
				.with_endpoint(getDomainName(webSocketUrl!))
				.with_credentials(region!, credentials!.accessKeyId, credentials!.secretAccessKey, credentials!.sessionToken),
		[credentials, webSocketUrl, region]
	);

	const connectAndSubscribe = useCallback(async () => {
		if (!mqttClient) {
			const client = new mqtt.MqttClient().new_connection(config.build());
			setMqttClient(client);
			try {
				await client.connect();
				await client.subscribe(`${credentials!.identityId}/tracker`, mqtt.QoS.AtMostOnce, (_, payload) => {
					const data = JSON.parse(new TextDecoder("utf-8").decode(payload));
					const {
						eventTime = "",
						source = "",
						trackerEventType = "",
						geofenceId = "",
						geofenceCollection = "",
						stopName = "",
						coordinates = []
					} = data;

					if (source === "aws.geo") {
						if (stopName) {
							/* Unauth simulation events */
							const unauthEvent = { ...data };
							const busRouteId = geofenceId.split("-")[0];

							if (trackerEventType === "ENTER") {
								updateTrackingHistory &&
									updateTrackingHistory({
										busRouteId,
										geofenceCollection,
										stopName,
										coordinates: `${coordinates[1]}, ${coordinates[0]}`,
										createdAt: eventTime
									});
							}

							if (unauthEvents.length === 0 || !unauthEvents.some(equals(unauthEvent))) {
								setUnauthNotifications({
									busRouteId,
									geofenceCollection,
									stopName,
									coordinates: `${coordinates[1]}, ${coordinates[0]}`,
									createdAt: eventTime,
									eventType: trackerEventType === "ENTER" ? "Entered" : "Exited"
								});
								unauthEvents.push(unauthEvent);
							}

							showToast({
								content:
									i18n.dir() === "ltr"
										? `Bus ${busRouteId.split("_")[2]}: ${
												trackerEventType === "ENTER"
													? i18n.t("show_toast__entered.text")
													: i18n.t("show_toast__exited.text")
										  } ${stopName}`
										: `${stopName} ${
												trackerEventType === "ENTER"
													? i18n.t("show_toast__entered.text")
													: i18n.t("show_toast__exited.text")
										  } :${busRouteId.split("_")[2]} Bus`,
								type: ToastType.INFO,
								className: `${String(trackerEventType).toLowerCase()}-geofence`
							});
						} else {
							/* Auth simulation events */
							const authEvent = { ...data };

							if (authEvents.length === 0 || !authEvents.some(equals(authEvent))) {
								showToast({
									content:
										i18n.dir() === "ltr"
											? `${
													trackerEventType === "ENTER"
														? i18n.t("show_toast__entered.text")
														: i18n.t("show_toast__exited.text")
											  } ${geofenceId} ${i18n.t("geofence.text")}`
											: `${i18n.t("geofence.text")} ${geofenceId} ${
													trackerEventType === "ENTER"
														? i18n.t("show_toast__entered.text")
														: i18n.t("show_toast__exited.text")
											  }`,
									type: ToastType.INFO,
									containerId: "toast-container",
									className: `${String(trackerEventType).toLowerCase()}-geofence`
								});
								authEvents.push(authEvent);
							}
						}

						record(
							[
								{
									EventType: EventTypeEnum.GEO_EVENT_TRIGGERED,
									Attributes: {
										eventType: trackerEventType,
										geofenceId
									}
								}
							],
							["userAWSAccountConnectionStatus", "userAuthenticationStatus"]
						);
					}
				});
			} catch (error) {
				console.error("Error connecting and subscribing", { error });
			}
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [mqttClient, config, credentials]);

	/* Initiate connection and subscription accordingly */
	useEffect(() => {
		if (
			startSocketConnection &&
			!mqttClient &&
			[CLOSED, CONNECTION_FAILURE, DISCONNECT, ERROR, INTERRUPT].includes(connectionState)
		) {
			connectAndSubscribe();
		}
	}, [connectionState, connectAndSubscribe, mqttClient, startSocketConnection]);

	return useMemo(
		() => ({
			connectionState
		}),
		[connectionState]
	);
};

export default useWebSocketService;
