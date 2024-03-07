import React from "react";

import { NotificationHistoryItemtype } from "@demo/types";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";

import "@testing-library/jest-dom/extend-expect";
import NotificationsBox from "./NotificationsBox";

describe("NotificationsBox", () => {
	const unauthNotifications: NotificationHistoryItemtype[] = [
		{
			busRouteId: "route_1",
			stopName: "Stop 1",
			createdAt: new Date().toISOString(),
			geofenceCollection: "geofence_1",
			coordinates: "coordinates_1"
		},
		{
			busRouteId: "route_2",
			stopName: "Stop 2",
			createdAt: new Date().toISOString(),
			geofenceCollection: "geofence_2",
			coordinates: "coordinates_2"
		}
	];

	it("renders NotificationsBox component with notifications", () => {
		const mockSetUnauthNotifications = jest.fn();

		render(
			<NotificationsBox
				selectedRoutesIds={["route_1", "route_2"]}
				unauthNotifications={unauthNotifications}
				setUnauthNotifications={mockSetUnauthNotifications}
			/>
		);

		waitFor(
			() => {
				expect(screen.getByTestId("notifications-text")).toBeInTheDocument();
				expect(screen.getByTestId("clear-notifications-text")).toBeInTheDocument();
				expect(screen.getByTestId("notification-card-0")).toBeInTheDocument();
				expect(screen.getByTestId("notification-card-1")).toBeInTheDocument();
			},
			{
				timeout: 10000,
				interval: 1000,
				onTimeout: e => {
					console.error({ e });
					return e;
				}
			}
		);
	});

	it("renders NotificationsBox component without notifications", () => {
		const mockSetUnauthNotifications = jest.fn();

		render(
			<NotificationsBox
				selectedRoutesIds={[]}
				unauthNotifications={[]}
				setUnauthNotifications={mockSetUnauthNotifications}
			/>
		);

		waitFor(
			() => {
				expect(screen.getByTestId("notifications-text")).toBeInTheDocument();
				expect(screen.getByTestId("clear-notifications-text")).toBeInTheDocument();
				expect(screen.getByTestId("no-notifications")).toBeInTheDocument();
			},
			{
				timeout: 10000,
				interval: 1000,
				onTimeout: e => {
					console.error({ e });
					return e;
				}
			}
		);
	});

	it("clears notifications when clear notifications text is clicked", () => {
		const mockSetUnauthNotifications = jest.fn();

		render(
			<NotificationsBox
				selectedRoutesIds={["route_1", "route_2"]}
				unauthNotifications={unauthNotifications}
				setUnauthNotifications={mockSetUnauthNotifications}
			/>
		);

		waitFor(
			() => {
				fireEvent.click(screen.getByTestId("clear-notifications-text"));
				expect(mockSetUnauthNotifications).toHaveBeenCalledWith(undefined);
			},
			{
				timeout: 10000,
				interval: 1000,
				onTimeout: e => {
					console.error({ e });
					return e;
				}
			}
		);
	});
});
