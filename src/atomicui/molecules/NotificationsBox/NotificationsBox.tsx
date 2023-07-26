import React from "react";

import { Flex, Text } from "@aws-amplify/ui-react";
import { IconBellSolid, IconGeofenceMarkerDisabled } from "@demo/assets";
import { IconicInfoCard } from "@demo/atomicui/molecules";
import { useAwsGeofence } from "@demo/hooks";
import { format } from "date-fns";
import { useTranslation } from "react-i18next";
import "./styles.scss";

interface NotificationsBoxProps {
	maxHeight?: number;
	selectedRoutesIds: string[];
}

const NotificationsBox: React.FC<NotificationsBoxProps> = ({ maxHeight = 30, selectedRoutesIds }) => {
	const { unauthNotifications, setUnauthNotifications } = useAwsGeofence();
	const { t } = useTranslation();

	return (
		<Flex width="100%" className="notifications-box-container" direction="column" gap="0" paddingBottom="1.2rem">
			<Flex justifyContent="space-between" width="100%" padding="0.5rem 1.2rem">
				<Text className="medium" fontSize="0.95rem" textAlign="center" variation="secondary">
					{t("notifications_box__geofences_notifications.text")}
				</Text>
				<Text
					className={`medium clear-notifications ${!unauthNotifications.length ? "empty" : ""}`}
					fontSize="0.95rem"
					textAlign="center"
					variation="secondary"
					onClick={() => setUnauthNotifications(undefined)}
				>
					{t("notifications_box__clear_notifications.text")}
				</Text>
			</Flex>
			<Flex
				className={!!unauthNotifications.length ? "notification-list" : "notification-list empty"}
				direction="column"
				gap="0"
				height={`${maxHeight}vh`}
			>
				{!!unauthNotifications.length ? (
					unauthNotifications?.map(({ busRouteId, stopName, createdAt }, idx) => {
						const title = `Bus ${busRouteId.split("_")[2]}: Approaching ${stopName}`;
						const isEnabled = selectedRoutesIds.includes(busRouteId);

						return (
							<Flex key={idx} direction="column" width="100%" gap="0">
								<IconicInfoCard
									IconComponent={
										<IconGeofenceMarkerDisabled
											className={isEnabled ? "primary-active-icon" : "primary-icon"}
											width={24}
										/>
									}
									title={title}
									description={`${format(new Date(createdAt), "p")}`.toLowerCase()}
									textContainerMarginLeft="0"
									cardMargin="0.7rem 0"
									cardAlignItems="center"
								/>
								<Flex className="divider" />
							</Flex>
						);
					})
				) : (
					<Flex className="no-notifications" direction="column" gap="0">
						<IconBellSolid width={36} height={36} />
						<Text className="regular" fontSize="0.95rem" textAlign="center" variation="secondary" marginTop="1.2rem">
							{t("notifications_box__no_new_notifications.text")}
						</Text>
					</Flex>
				)}
			</Flex>
		</Flex>
	);
};

export default NotificationsBox;
