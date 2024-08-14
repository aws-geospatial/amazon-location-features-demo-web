import React, { useEffect, useMemo, useState } from "react";

import { Flex, Text } from "@aws-amplify/ui-react";
import { IconClose } from "@demo/assets/svgs";
import { useWebSocketService } from "@demo/services";
import { MqttConnectionState, NotificationHistoryItemtype } from "@demo/types";
import { t } from "i18next";
import "./styles.scss";

const { CONNECTION_SUCCESS, RESUME } = MqttConnectionState;

const useWebSocketBanner = (
	updateTrackingHistory?: (n: NotificationHistoryItemtype) => void,
	startSocketConnection = true
) => {
	const [hideConnectionAlert, setHideConnectionAlert] = useState(false);
	const { connectionState } = useWebSocketService(
		(n: NotificationHistoryItemtype) => updateTrackingHistory && updateTrackingHistory(n),
		startSocketConnection
	);
	const isConnected = useMemo(() => [CONNECTION_SUCCESS, RESUME].includes(connectionState), [connectionState]);

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
			isHidden: hideConnectionAlert,
			isConnected,
			Connection: (
				<Flex
					data-testid="websocket-banner"
					className={`tracking-connection-alert slide-up ${
						hideConnectionAlert ? "hide" : isConnected ? "success" : "info"
					}`}
				>
					<Flex width="100%" justifyContent="space-between" alignItems="center" marginLeft="1.3rem">
						<Text data-testid="websocket-banner-text" className="notification-text">
							{isConnected
								? t("tracker_box__notification_service_status_1.text")
								: t("tracker_box__notification_service_status_2.text")}{" "}
						</Text>
						<IconClose className="close-icon" onClick={() => setHideConnectionAlert(true)} />
					</Flex>
				</Flex>
			)
		}),
		[hideConnectionAlert, isConnected]
	);
};

export default useWebSocketBanner;
