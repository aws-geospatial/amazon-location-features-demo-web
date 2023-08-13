import React, { useEffect, useMemo, useState } from "react";

import { Flex, Text } from "@aws-amplify/ui-react";
import { IconClose } from "@demo/assets";
import { useWebSocketService } from "@demo/services";
import { NotificationHistoryItemtype } from "@demo/types";
import { t } from "i18next";
import "./styles.scss";

const WebsocketBanner = (
	updateTrackingHistory?: (n: NotificationHistoryItemtype) => void,
	startSocketConnection = true
) => {
	const [hideConnectionAlert, setHideConnectionAlert] = useState(false);
	const { subscription, connectionState } = useWebSocketService(
		(n: NotificationHistoryItemtype) => updateTrackingHistory && updateTrackingHistory(n),
		startSocketConnection
	);
	const isConnected = useMemo(() => connectionState === "Connected", [connectionState]);

	useEffect(() => {
		setHideConnectionAlert(false);
		let flushTimeoutId: NodeJS.Timeout;
		if (isConnected) {
			flushTimeoutId = setTimeout(() => {
				setHideConnectionAlert(true);
			}, 3000);
		} else {
			setHideConnectionAlert(false);
		}
		return () => {
			clearTimeout(flushTimeoutId);
		};
	}, [isConnected]);

	return useMemo(
		() => ({
			subscription,
			isHidden: hideConnectionAlert,
			isConnected,
			Connection: (
				<Flex
					className={`tracking-connection-alert slide-up ${
						hideConnectionAlert ? "hide" : isConnected ? "success" : "info"
					}`}
				>
					<Flex width="100%" justifyContent="space-between" alignItems="center">
						<Text className="notification-text">
							{isConnected
								? t("tracker_box__notification_service_status_1.text")
								: t("tracker_box__notification_service_status_2.text")}{" "}
						</Text>
						<IconClose className="close-icon" onClick={() => setHideConnectionAlert(true)} />
					</Flex>
				</Flex>
			)
		}),
		[hideConnectionAlert, isConnected, subscription]
	);
};

export default WebsocketBanner;
