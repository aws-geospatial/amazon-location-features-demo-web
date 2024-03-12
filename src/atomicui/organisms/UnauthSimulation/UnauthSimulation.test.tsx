import i18n from "@demo/locales/i18n";
import { MenuItemEnum } from "@demo/types";
import { fireEvent, render, waitFor } from "@testing-library/react";
import { I18nextProvider } from "react-i18next";

import UnauthSimulation, { UnauthSimulationProps } from "./UnauthSimulation";

const mockProps: UnauthSimulationProps = {
	mapRef: null,
	from: MenuItemEnum.TRACKER,
	setShowUnauthGeofenceBox: jest.fn(),
	setShowUnauthTrackerBox: jest.fn(),
	setShowConnectAwsAccountModal: jest.fn(),
	showStartUnauthSimulation: true,
	setShowStartUnauthSimulation: jest.fn(),
	startSimulation: false,
	setStartSimulation: jest.fn(),
	setShowUnauthSimulationBounds: jest.fn(),
	clearCredsAndLocationClient: jest.fn(),
	isNotifications: false,
	setIsNotifications: jest.fn(),
	confirmCloseSimulation: false,
	setConfirmCloseSimulation: jest.fn(),
	geolocateControlRef: { current: { trigger: jest.fn() } }
};

jest.mock("@demo/hooks", () => ({
	useAwsGeofence: () => ({
		unauthNotifications: [
			{
				busRouteId: "bus_route_1",
				geofenceCollection: "bus_route_1",
				stopName: "bus_route_stop_1",
				coordinates: "-122.11, 144.11",
				createdAt: "2021-08-11T18:00:00.000Z"
			},
			{
				busRouteId: "bus_route_1",
				geofenceCollection: "bus_route_1",
				stopName: "bus_route_stop_1",
				coordinates: "-122.11, 144.11",
				createdAt: "2021-08-11T18:00:01.000Z"
			}
		],
		setUnauthNotifications: jest.fn(),
		getGeofencesList: jest.fn(),
		evaluateGeofence: jest.fn()
	}),
	useUnauthSimulation: () => ({
		setHideGeofenceTrackerShortcut: jest.fn()
	}),
	useWebSocketBanner: () => ({
		Connection: <div data-testid="websocket-banner"></div>,
		isHidden: false
	})
}));

jest.mock("@demo/atomicui/molecules", () => ({
	ConfirmationModal: () => null,
	IconicInfoCard: () => null,
	NonStartUnauthSimulation: () => null,
	NotificationsBox: () => null
}));

describe("<UnauthSimulation />", () => {
	const renderComponent = () => {
		return render(
			<I18nextProvider i18n={i18n}>
				<UnauthSimulation {...mockProps} />
			</I18nextProvider>
		);
	};

	beforeEach(() => {
		mockProps.startSimulation = false;
	});

	it("should render correctly", async () => {
		const { getByTestId } = renderComponent();
		waitFor(
			() => {
				expect(getByTestId("unauthSimulation-card")).toBeInTheDocument();
				expect(getByTestId("before-start-simulation")).toBeInTheDocument();
				expect(getByTestId("start-simulation")).toBeInTheDocument();
				expect(getByTestId("start-simulation")).toBeInTheDocument();
				fireEvent.click(getByTestId("start-simulation"));
				expect(mockProps.setStartSimulation).toHaveBeCalled();
				expect(mockProps.setShowUnauthSimulationBounds).toHaveBeCalled();
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

	it("should render correctly when startSimulation is true", () => {
		mockProps.startSimulation = true;
		const { getByTestId } = renderComponent();

		waitFor(
			() => {
				expect(getByTestId("simulation-container")).toBeInTheDocument();
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
