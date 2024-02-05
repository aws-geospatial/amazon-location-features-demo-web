import { FC, lazy } from "react";

import { Flex, Text } from "@aws-amplify/ui-react";
import { IconBellSolid, IconGeofenceMarkerDisabled } from "@demo/assets";
import { NotificationHistoryItemtype } from "@demo/types";
import { format } from "date-fns";
import { useTranslation } from "react-i18next";
import "./styles.scss";

const IconicInfoCard = lazy(() =>
	import("@demo/atomicui/molecules/IconicInfoCard").then(module => ({ default: module.IconicInfoCard }))
);

interface NotificationsBoxProps {
	maxHeight?: number;
	selectedRoutesIds: string[];
	unauthNotifications: NotificationHistoryItemtype[];
	setUnauthNotifications: (n: NotificationHistoryItemtype | undefined) => void;
}

const NotificationsBox: FC<NotificationsBoxProps> = ({
	maxHeight = 30,
	selectedRoutesIds,
	unauthNotifications,
	setUnauthNotifications
}) => {
	const { t } = useTranslation();

	return (
		<Flex width="100%" className="notifications-box-container" direction="column" gap="0" paddingBottom="1.2rem">
			<Flex justifyContent="space-between" width="100%" padding="0.5rem 1.2rem">
				<Text
					className="medium"
					fontSize="0.95rem"
					textAlign="center"
					variation="secondary"
					data-testid="notifications-text"
				>
					{t("notifications_box__geofences_notifications.text")}
				</Text>
				<Text
					className={`medium clear-notifications ${!unauthNotifications.length ? "empty" : ""}`}
					fontSize="0.95rem"
					textAlign="center"
					variation="secondary"
					onClick={() => setUnauthNotifications(undefined)}
					data-testid="clear-notifications-text"
				>
					{t("notifications_box__clear_notifications.text")}
				</Text>
			</Flex>
			<Flex
				className={!!unauthNotifications.length ? "notification-list" : "notification-list empty"}
				direction="column"
				gap="0"
				height={`${maxHeight}vh`}
				data-testid="notifications-list"
			>
				{!!unauthNotifications.length ? (
					unauthNotifications?.map(({ busRouteId, stopName, createdAt, eventType }, idx) => {
						const title = `Bus ${busRouteId.split("_")[2]}: ${eventType} ${stopName}`;
						const isEnabled = selectedRoutesIds.includes(busRouteId);

						return (
							<Flex key={idx} direction="column" width="100%" gap="0" data-testid={`notification-card-${idx}`}>
								<IconicInfoCard
									IconComponent={
										<Flex>
											<IconGeofenceMarkerDisabled
												className={isEnabled ? "primary-active-icon" : "primary-icon"}
												width={24}
												height={24}
											/>
										</Flex>
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
					<Flex className="no-notifications" direction="column" gap="0" data-testid="no-notifications">
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
