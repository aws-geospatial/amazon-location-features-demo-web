import React from "react";

import { MenuItemEnum } from "@demo/types";
import { act, fireEvent, render, screen, waitFor } from "@testing-library/react";

import UnauthSimulation, { UnauthSimulationProps } from "./UnauthSimulation";

const mockProps: UnauthSimulationProps = {
	mapRef: null,
	from: MenuItemEnum.TRACKER,
	setShowUnauthGeofenceBox: jest.fn(),
	setShowUnauthTrackerBox: jest.fn(),
	setShowConnectAwsAccountModal: jest.fn(),
	showStartUnauthSimulation: false,
	setShowStartUnauthSimulation: jest.fn(),
	startSimulation: false,
	setStartSimulation: jest.fn(),
	setShowUnauthSimulationBounds: jest.fn(),
	clearCredsAndLocationClient: jest.fn(),
	isNotifications: false,
	setIsNotifications: jest.fn(),
	confirmCloseSimulation: false,
	setConfirmCloseSimulation: jest.fn()
};

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
	const renderComponent = () => {
		return render(<UnauthSimulation {...mockProps} />);
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
