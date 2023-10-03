import React from "react";

import { MenuItemEnum } from "@demo/types";
import { act, fireEvent, render, screen, waitFor } from "@testing-library/react";

import UnauthSimulation from "./UnauthSimulation";

jest.mock("@demo/hooks", () => ({
	useAwsGeofence: () => ({
		unauthNotifications: null,
		setUnauthNotifications: jest.fn()
	}),
	useWebSocketBanner: () => ({
		Connection: jest.fn(),
		isHidden: false
	})
}));

jest.mock("@demo/atomicui/molecules", () => ({
	NotificationsBox: () => null,
	ConfirmationModal: () => null,
	IconicInfoCard: () => null
}));

describe("UnauthSimulation", () => {
	const props = {
		mapRef: null,
		from: MenuItemEnum.TRACKER,
		setShowUnauthGeofenceBox: jest.fn(),
		setShowUnauthTrackerBox: jest.fn(),
		setShowConnectAwsAccountModal: jest.fn(),
		setShowUnauthSimulationBounds: jest.fn(),
		clearCredsAndLocationClient: jest.fn()
	};

	const renderComponent = () => {
		return render(<UnauthSimulation {...props} />);
	};
	it("renders the component without errors", () => {
		renderComponent();
		expect(screen.getByTestId("unauth-simulation-card")).toBeInTheDocument();
	});

	it("handles the simulation button is not clicked", () => {
		const { getByTestId } = renderComponent();
		const container = getByTestId("unauth-simulation-card");
		const cta = getByTestId("unauth-simulation-cta");
		expect(container).toBeInTheDocument();
		expect(cta).toBeInTheDocument();
		act(() => {
			fireEvent.click(cta);
		});
		waitFor(() => {
			expect(getByTestId("unauth-simulation-not-started")).toBeInTheDocument();
		});
	});
});
