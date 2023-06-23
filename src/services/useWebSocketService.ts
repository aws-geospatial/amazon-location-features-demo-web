/* Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved. */
/* SPDX-License-Identifier: MIT-0 */

import { useCallback, useEffect, useMemo, useState } from "react";

import { AWSIoTProvider } from "@aws-amplify/pubsub";
import { showToast } from "@demo/core/Toast";
import { useAmplifyAuth } from "@demo/hooks";
import { ToastType } from "@demo/types";
import { Amplify, Hub, PubSub } from "aws-amplify";

const RETRY_INTERVAL = 100;

const useWebSocketService = (): { subscription: ZenObservable.Subscription | null; connectionState: string } => {
	const [connectionState, setConnectionState] = useState("Disconnected");
	const [subscription, setSubscription] = useState<ZenObservable.Subscription | null>(null);

	const { region, webSocketUrl, credentials } = useAmplifyAuth();
	const url = useMemo(() => webSocketUrl?.split("//")[1]?.replace("/", "") || webSocketUrl, [webSocketUrl]);

	useEffect(() => {
		Hub.listen("pubsub", ({ payload: { data } }) => {
			if (connectionState !== data.connectionState) {
				setConnectionState(data.connectionState);
			}
		});
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, []);

	const connect = useCallback(() => {
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
					if (data.value.source === "aws.geo") {
						showToast({
							content: `${data.value.trackerEventType === "ENTER" ? "Entered" : "Exited"} ${
								data.value.geofenceId
							} geofence`,
							type: ToastType.INFO
						});
					}
				},
				error: () => {
					setTimeout(connect, RETRY_INTERVAL);
				},
				complete: () => console.info("complete")
			})
		);
	}, [region, url, credentials?.identityId]);

	useEffect(() => {
		if (["Disconnected", "ConnectionDisrupted"].includes(connectionState)) {
			connect();
		}
	}, [connect, connectionState]);

	return { subscription, connectionState };
};

export default useWebSocketService;
