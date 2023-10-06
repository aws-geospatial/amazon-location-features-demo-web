import i18n from "@demo/locales/i18n";
import { faker } from "@faker-js/faker";
import { act, fireEvent, render, waitFor } from "@testing-library/react";
import { ListGeofenceResponseEntry } from "aws-sdk/clients/location";
import { I18nextProvider } from "react-i18next";

import AuthGeofenceBox, { AuthGeofenceBoxProps } from "./AuthGeofenceBox";

const mockProps: AuthGeofenceBoxProps = {
	mapRef: {
		...jest.requireActual("react-map-gl").MapRef,
		getCenter: () => ({
			lng: Number(faker.address.longitude()),
			lat: Number(faker.address.latitude())
		})
	},
	setShowAuthGeofenceBox: jest.fn(),
	isEditingAuthRoute: false,
	setIsEditingAuthRoute: jest.fn(),
	triggerOnClose: false,
	triggerOnReset: false,
	setTriggerOnClose: jest.fn(),
	setTriggerOnReset: jest.fn()
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

const mockUseAwsGeofenceData: {
	getGeofencesList: () => {};
	isFetchingGeofences: boolean;
	geofences?: Array<ListGeofenceResponseEntry>;
	createGeofence: () => {};
	deleteGeofence: () => {};
	isAddingGeofence: boolean;
	setIsAddingGeofence: () => {};
} = {
	getGeofencesList: jest.fn(),
	isFetchingGeofences: false,
	geofences: undefined,
	createGeofence: jest.fn(),
	deleteGeofence: jest.fn(),
	isAddingGeofence: false,
	setIsAddingGeofence: jest.fn()
};

const mockUseAwsPlaceData = {
	getPlaceData: jest.fn(),
	search: jest.fn()
};

jest.mock("@demo/hooks", () => ({
	useAmplifyMap: () => ({
		mapUnit: "METRIC",
		mapProvider: "SomeProvider"
	}),
	useAwsGeofence: () => mockUseAwsGeofenceData,
	useAwsPlace: () => mockUseAwsPlaceData,
	useMediaQuery: () => true
}));

describe("<AuthGeofenceBox />", () => {
	const renderComponent = () =>
		render(
			<I18nextProvider i18n={i18n}>
				<AuthGeofenceBox {...mockProps} />
			</I18nextProvider>
		);

	beforeEach(() => {
		mockUseAwsGeofenceData.isFetchingGeofences = false;
		mockUseAwsGeofenceData.geofences = undefined;
		mockUseAwsGeofenceData.isAddingGeofence = false;
	});

	it("renders the component correctly", () => {
		const { getByTestId } = renderComponent();
		expect(getByTestId("auth-geofence-box-card")).toBeInTheDocument();
	});

	it("should show the loader when fetching geofences", () => {
		mockUseAwsGeofenceData.isFetchingGeofences = true;
		const { getByTestId } = renderComponent();
		expect(getByTestId("geofences-list-container")).toBeInTheDocument();
		expect(getByTestId("auth-geofence-box-loader")).toBeInTheDocument();
		expect(mockUseAwsGeofenceData.getGeofencesList).toHaveBeenCalled();
	});

	it("should render the geofences list", () => {
		mockUseAwsGeofenceData.geofences = [...mockGeofencesData];
		const { getByTestId } = renderComponent();
		expect(getByTestId("geofences-list-container")).toBeInTheDocument();
		expect(getByTestId("test_geofence_1")).toBeInTheDocument();
		expect(getByTestId("test_geofence_2")).toBeInTheDocument();
	});

	it("should render the empty list message when geofences not present", () => {
		const { getByTestId } = renderComponent();
		expect(getByTestId("geofences-list-container")).toBeInTheDocument();
		expect(getByTestId("auth-geofence-box-empty-list")).toBeInTheDocument();
	});

	it("should fire appropriate function when clicked on add geofence", () => {
		const { getByTestId } = renderComponent();
		expect(getByTestId("auth-geofence-box-add-button")).toBeInTheDocument();
		act(() => {
			fireEvent.click(getByTestId("auth-geofence-box-add-button"));
		});
		expect(mockUseAwsGeofenceData.setIsAddingGeofence).toHaveBeenCalled();
	});

	it("should render add geofence and allow to use search", () => {
		mockUseAwsGeofenceData.isAddingGeofence = true;
		const { getByTestId } = renderComponent();
		expect(getByTestId("auth-geofence-add-container")).toBeInTheDocument();
		expect(getByTestId("auth-geofence-box-search-input")).toBeInTheDocument();
		act(() => {
			fireEvent.change(getByTestId("auth-geofence-box-search-input"), { target: { value: "test" } });
		});
		waitFor(() => {
			expect(getByTestId("auth-geofence-box-search-input")).toHaveValue("test");
			expect(mockUseAwsPlaceData.search).toHaveBeenCalled();
		});
	});

	it("should allow to select geofence and edit it", () => {
		mockUseAwsGeofenceData.geofences = [...mockGeofencesData];
		const { getByTestId } = renderComponent();
		expect(getByTestId("geofences-list-container")).toBeInTheDocument();
		expect(getByTestId("test_geofence_1")).toBeInTheDocument();
		fireEvent.click(getByTestId("test_geofence_1"));
		mockUseAwsGeofenceData.isAddingGeofence = true;
		waitFor(() => {
			expect(getByTestId("auth-geofence-box-name-field")).toHaveValue("test_geofence_1");
			expect(getByTestId("geofence-radius-slider")).toBeInTheDocument();
		});
	});
});
