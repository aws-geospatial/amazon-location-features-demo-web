/* Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved. */
/* SPDX-License-Identifier: MIT-0 */

import { useMemo } from "react";

import { AWSIoTProvider } from "@aws-amplify/pubsub";
import { showToast } from "@demo/core/Toast";
import { useAmplifyAuth } from "@demo/hooks";
import { ToastType } from "@demo/types";
import { Amplify, Hub, PubSub } from "aws-amplify";

Hub.listen("pubsub", ({ payload: { data } }) => console.info({ connectionState: data.connectionState }));

const useWebSocketService = () => {
	const { region, webSocketUrl, credentials } = useAmplifyAuth();
	const url = useMemo(
		() =>
			webSocketUrl?.startsWith("http://") || webSocketUrl?.startsWith("https://")
				? webSocketUrl.split("//")[1].replace("/", "")
				: webSocketUrl,
		[webSocketUrl]
	);

	return useMemo(() => {
		Amplify.addPluggable(
			new AWSIoTProvider({
				aws_pubsub_region: region,
				aws_pubsub_endpoint: `wss://${url}/mqtt`,
				clientId: credentials?.identityId
			})
		);

		// const subscription = PubSub.subscribe(`${credentials?.identityId}/tracker`).subscribe(data => {
		// 	console.info({ data });
		// 	if (data.value.source === "aws.geo") {
		// 		const msg = `${data.value.trackerEventType === "ENTER" ? "Entered" : "Exited"} ${
		// 			data.value.geofenceId
		// 		} geofence`;
		// 		showToast({ content: msg, type: ToastType.INFO });
		// 	}
		// });
		const subscription = PubSub.subscribe(`${credentials?.identityId}/tracker`, {
			provider: "AWSIoTProvider"
		}).subscribe({
			next: data => {
				console.info({ data });
				if (data.value.source === "aws.geo") {
					const msg = `${data.value.trackerEventType === "ENTER" ? "Entered" : "Exited"} ${
						data.value.geofenceId
					} geofence`;
					showToast({ content: msg, type: ToastType.INFO });
				}
			},
			error: error => console.error({ error }),
			complete: () => console.info("complete")
		});

		return subscription;
	}, [region, url, credentials?.identityId]);
};

export default useWebSocketService;
