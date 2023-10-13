import { TrackingHistoryTypeEnum } from "./Enums";

export type TrackingHistoryItemtype = {
	type: TrackingHistoryTypeEnum;
	title: string;
	description: string | null;
	subDescription: string;
};

export type TrackingHistoryType = {
	[busRouteId: string]: TrackingHistoryItemtype[];
};

export type NotificationHistoryItemtype = {
	busRouteId: string;
	geofenceCollection: string;
	stopName: string;
	coordinates: string;
	createdAt: string;
	eventType?: "Entered" | "Exited";
};
