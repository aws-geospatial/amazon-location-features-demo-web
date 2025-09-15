import i18n from "@demo/locales/i18n";
import { fireEvent, render, waitFor } from "@testing-library/react";
import type { GeolocateControl as GeolocateControlRef } from "maplibre-gl";
import { I18nextProvider } from "react-i18next";
import { MapRef } from "react-map-gl/maplibre";

import UnauthSimulation, { UnauthSimulationProps } from "./UnauthSimulation";

const mockProps: UnauthSimulationProps = {
	mapRef: {
		current: {
			fitBounds: () => {}
		} as unknown as MapRef
	},
	geolocateControlRef: { current: { trigger: vi.fn() } as unknown as GeolocateControlRef },
	setShowUnauthSimulation: vi.fn(),
	startSimulation: false,
	setStartSimulation: vi.fn(),
	setShowUnauthSimulationBounds: vi.fn(),
	isNotifications: false,
	setIsNotifications: vi.fn(),
	confirmCloseSimulation: false,
	setConfirmCloseSimulation: vi.fn()
};

vi.mock("@demo/hooks", () => ({
	useGeofence: () => ({
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
		setUnauthNotifications: vi.fn(),
		getGeofencesList: vi.fn(),
		evaluateGeofence: vi.fn()
	}),
	useUnauthSimulation: () => ({
		setHideGeofenceTrackerShortcut: vi.fn()
	}),
	useWebSocketBanner: () => ({
		Connection: <div data-testid="websocket-banner"></div>,
		isHidden: false
	})
}));

vi.mock("@demo/atomicui/molecules", () => ({
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
