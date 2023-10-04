import i18n from "@demo/locales/i18n";
import { TrackerType } from "@demo/types";
import { faker } from "@faker-js/faker";
import { render } from "@testing-library/react";
import { I18nextProvider } from "react-i18next";

import AuthTrackerBox, { AuthTrackerBoxProps } from "./AuthTrackerBox";

Object.defineProperty(window, "location", {
	writable: true,
	value: { reload: jest.fn() }
});

const props: AuthTrackerBoxProps = {
	mapRef: {
		...jest.requireActual("react-map-gl").MapRef,
		getCenter: () => ({
			lng: Number(faker.address.longitude()),
			lat: Number(faker.address.latitude())
		}),
		fitBounds: () => {}
	},
	setShowAuthTrackerBox: jest.fn(),
	clearCredsAndLocationClient: jest.fn()
};

const mockGeofencesData = [
	{
		CreateTime: faker.date.past(),
		GeofenceId: "test_geofence_1",
		Geometry: {
			Circle: {
				Center: [Number(faker.address.longitude()), Number(faker.address.latitude())],
				Radius: 80
			}
		},
		Status: "ACTIVE",
		UpdateTime: faker.date.past()
	},
	{
		CreateTime: faker.date.past(),
		GeofenceId: "test_geofence_2",
		Geometry: {
			Circle: {
				Center: [Number(faker.address.longitude()), Number(faker.address.latitude())],
				Radius: 80
			}
		},
		Status: "ACTIVE",
		UpdateTime: faker.date.past()
	}
];

const mockUseAwsGeofenceData = {
	geofences: mockGeofencesData,
	getGeofencesList: jest.fn()
};

const mockUseAwsRouteData = {
	isFetchingRoute: false
};

const mockUseAwsTrackerData = {
	selectedTrackerType: TrackerType.CAR,
	setSelectedTrackerType: jest.fn(),
	isEditingRoute: false,
	setIsEditingRoute: jest.fn(),
	trackerPoints: undefined,
	setTrackerPoints: jest.fn()
};

jest.mock("@demo/hooks", () => ({
	useAwsGeofence: () => mockUseAwsGeofenceData,
	useAwsRoute: () => mockUseAwsRouteData,
	useAwsTracker: () => mockUseAwsTrackerData,
	useMediaQuery: () => true,
	useWebSocketBanner: () => ({
		Connection: jest.fn(),
		isHidden: false
	})
}));

jest.mock("./AuthTrackerSimulation", () => ({
	__esModule: true,
	default: () => <div data-testid="auth-tracker-simulation"></div>
}));

describe("<AuthTrackerBox />", () => {
	const renderComponent = () =>
		render(
			<I18nextProvider i18n={i18n}>
				<AuthTrackerBox {...props} />
			</I18nextProvider>
		);

	it("should render correctly", () => {
		const { getByTestId } = renderComponent();
		expect(getByTestId("auth-tracker-box-card")).toBeInTheDocument();
		expect(getByTestId("auth-tracker-simulation")).toBeInTheDocument();
	});
});
