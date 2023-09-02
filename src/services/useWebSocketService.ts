/* eslint-disable @typescript-eslint/no-explicit-any */
/* Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved. */
/* SPDX-License-Identifier: MIT-0 */

import { useCallback, useEffect, useMemo, useState } from "react";

import { HubPayload } from "@aws-amplify/core";
import { AWSIoTProvider } from "@aws-amplify/pubsub";
import { showToast } from "@demo/core/Toast";
import { useAmplifyAuth, useAwsGeofence } from "@demo/hooks";
import i18n from "@demo/locales/i18n";
import { EventTypeEnum, NotificationHistoryItemtype, ToastType } from "@demo/types";
import { record } from "@demo/utils/analyticsUtils";
import { getDomainName } from "@demo/utils/getDomainName";
import { Amplify, Hub, PubSub } from "aws-amplify";

const RETRY_INTERVAL = 100;

const useWebSocketService = (
	updateTrackingHistory?: (n: NotificationHistoryItemtype) => void,
	startSocketConnection = true
): { subscription: ZenObservable.Subscription | null; connectionState: string | null } => {
	const [connectionState, setConnectionState] = useState<string>("Disconnected");
	const [subscription, setSubscription] = useState<ZenObservable.Subscription | null>(null);
	const { region, webSocketUrl, credentials } = useAmplifyAuth();
	const { setUnauthNotifications } = useAwsGeofence();

	const url = getDomainName(webSocketUrl || "");

	useEffect(() => {
		Hub.listen("pubsub", ({ payload: { data } }: { payload: HubPayload }) => {
			if (connectionState !== data.connectionState) {
				setConnectionState(data.connectionState);
			}
		});
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, []);

	const connect = useCallback(() => {
		if (!region) {
			return;
		}

		Amplify.addPluggable(
			new AWSIoTProvider({
				aws_pubsub_region: region,
				aws_pubsub_endpoint: `wss://${url}/mqtt`,
				clientId: credentials?.identityId
			})
		);
		setSubscription(
			PubSub.subscribe(`${credentials?.identityId}/tracker`, {
				provider: "AWSIoTProvider"
			}).subscribe({
				next: data => {
					const {
						value: {
							eventTime = "",
							source = "",
							trackerEventType = "",
							geofenceId = "",
							geofenceCollection = "",
							stopName = "",
							coordinates = []
						}
					} = data;

					if (source === "aws.geo") {
						if (stopName) {
							const busRouteId = geofenceId.split("-")[0];

							if (trackerEventType === "ENTER") {
								setUnauthNotifications({
									busRouteId,
									geofenceCollection,
									stopName,
									coordinates: `${coordinates[1]}, ${coordinates[0]}`,
									createdAt: eventTime
								});
								updateTrackingHistory &&
									updateTrackingHistory({
										busRouteId,
										geofenceCollection,
										stopName,
										coordinates: `${coordinates[1]}, ${coordinates[0]}`,
										createdAt: eventTime
									});
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
								containerId: "unauth-simulation-toast-container",
								className: `${String(trackerEventType).toLowerCase()}-geofence`
							});
						} else {
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
				},
				error: () => {
					setTimeout(connect, RETRY_INTERVAL);
				},
				complete: () => console.info("complete")
			})
		);
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [credentials?.identityId, region, url]);

	useEffect(() => {
		if (
			["Disconnected", "ConnectionDisrupted", "ConnectedPendingDisconnect"].includes(connectionState) &&
			startSocketConnection
		) {
			connect();
		}
	}, [connect, connectionState, startSocketConnection]);

	return useMemo(
		() => ({
			subscription,
			connectionState
		}),
		[subscription, connectionState]
	);
};

export default useWebSocketService;
