import i18n from "@demo/locales/i18n";
import { MapStyleEnum } from "@demo/types";
import { faker } from "@faker-js/faker";
import { act, fireEvent, render, waitFor } from "@testing-library/react";
import { I18nextProvider } from "react-i18next";

import MapButtons, { MapButtonsProps } from "./MapButtons";

Object.defineProperty(window, "location", {
	writable: true,
	value: { reload: jest.fn() }
});

const mockProps: MapButtonsProps = {
	renderedUpon: "",
	openStylesCard: false,
	setOpenStylesCard: jest.fn(),
	onCloseSidebar: jest.fn(),
	onOpenSignInModal: jest.fn(),
	onShowGridLoader: jest.fn(),
	isLoading: false,
	onlyMapStyles: false,
	isHandDevice: false,
	isAuthGeofenceBoxOpen: false,
	onSetShowAuthGeofenceBox: jest.fn(),
	isAuthTrackerBoxOpen: false,
	isSettingsModal: false,
	onSetShowAuthTrackerBox: jest.fn(),
	isUnauthGeofenceBoxOpen: false,
	isUnauthTrackerBoxOpen: false,
	onSetShowUnauthGeofenceBox: jest.fn(),
	onSetShowUnauthTrackerBox: jest.fn()
};

const mockUseAuthData = {
	credentials: {
		accessKeyId: faker.random.word(),
		sessionToken: faker.random.word(),
		secretAccessKey: faker.random.word(),
		identityId: faker.random.word(),
		authenticated: false,
		expiration: new Date()
	},
	isUserAwsAccountConnected: false
};

const mockUseMapData = {
	mapStyle: MapStyleEnum.STANDARD,
	setMapStyle: jest.fn(),
	mapPoliticalView: {
		alpha2: "",
		alpha3: "",
		desc: faker.random.word()
	},
	mapLanguage: { value: "en", label: "English" }
};

const mockUseGeofenceData = {
	isAddingGeofence: false,
	setIsAddingGeofence: jest.fn()
};

const mockUseUnauthSimulationData = {
	hideGeofenceTrackerShortcut: false
};

jest.mock("@demo/hooks", () => ({
	useAuth: () => mockUseAuthData,
	useMap: () => mockUseMapData,
	useGeofence: () => mockUseGeofenceData,
	useUnauthSimulation: () => mockUseUnauthSimulationData
}));

describe("<MapButtons/>", () => {
	const renderComponent = () => {
		return render(
			<I18nextProvider i18n={i18n}>
				<MapButtons {...mockProps} />
			</I18nextProvider>
		);
	};

	beforeEach(() => {
		mockProps.onlyMapStyles = false;
		mockUseAuthData.isUserAwsAccountConnected = false;
		mockUseAuthData.credentials.authenticated = false;
	});

	it("renders map style when onlyMapStyles prop set to true", () => {
		mockProps.onlyMapStyles = true;
		const { getByTestId } = renderComponent();
		expect(getByTestId("map-styles-wrapper")).toBeInTheDocument();
	});

	it("renders map buttons and executes correct code when map styles is clicked on", () => {
		const { getByTestId } = renderComponent();
		expect(getByTestId("map-buttons-container")).toBeInTheDocument();
		act(() => {
			fireEvent.click(getByTestId("map-styles-button"));
		});
		waitFor(() => {
			expect(mockProps.setOpenStylesCard).toHaveBeenCalled();
		});
	});

	it("should open map styles card when prop is true", () => {
		mockProps.openStylesCard = true;
		const { getByTestId } = renderComponent();
		waitFor(() => {
			expect(getByTestId("map-styles-card")).toBeInTheDocument();
			expect(getByTestId("map-styles-wrapper")).toBeInTheDocument();
		});
	});

	it("should allow to select map style", () => {
		mockProps.openStylesCard = true;
		const { getByTestId } = renderComponent();
		waitFor(() => {
			expect(getByTestId("map-styles-container")).toBeInTheDocument();
		});
		act(() => {
			fireEvent.click(getByTestId(`map-style-item-${MapStyleEnum.MONOCHROME}`));
		});
		waitFor(() => {
			expect(mockUseMapData.setMapStyle).toHaveBeenCalledWith(MapStyleEnum.MONOCHROME);
		});
	});

	it("renders geofence button and executes correctly when user AWS account connected and authenticated", () => {
		mockUseAuthData.isUserAwsAccountConnected = true;
		mockUseAuthData.credentials.authenticated = true;
		const { getByTestId } = renderComponent();
		expect(getByTestId("geofence-control-button")).toBeInTheDocument();
		act(() => {
			fireEvent.click(getByTestId("geofence-control-button"));
		});
		waitFor(() => {
			expect(mockProps.onCloseSidebar).toHaveBeenCalled();
			expect(mockProps.onSetShowAuthTrackerBox).toHaveBeenCalled();
			expect(mockProps.onSetShowAuthGeofenceBox).toHaveBeenCalled();
			expect(mockUseGeofenceData.setIsAddingGeofence).toHaveBeenCalled();
		});
	});

	it("renders geofence button and executes correctly when user AWS account connected and not authenticated", () => {
		const { getByTestId } = renderComponent();
		expect(getByTestId("geofence-control-button")).toBeInTheDocument();
		act(() => {
			fireEvent.click(getByTestId("geofence-control-button"));
		});
		waitFor(() => {
			expect(mockProps.onCloseSidebar).toHaveBeenCalled();
			expect(mockProps.onOpenSignInModal).toHaveBeenCalled();
		});
	});

	it("renders geofence button and executes correctly when user AWS account not connected and map is not Grab", () => {
		const { getByTestId } = renderComponent();
		expect(getByTestId("geofence-control-button")).toBeInTheDocument();
		act(() => {
			fireEvent.click(getByTestId("geofence-control-button"));
		});
		waitFor(() => {
			expect(mockProps.onCloseSidebar).toHaveBeenCalled();
			expect(mockProps.onSetShowUnauthTrackerBox).toHaveBeenCalled();
			expect(mockProps.onSetShowUnauthGeofenceBox).toHaveBeenCalled();
		});
	});

	it("renders tracker button and executes correctly when user AWS account connected and authenticated", () => {
		mockUseAuthData.isUserAwsAccountConnected = true;
		mockUseAuthData.credentials.authenticated = true;
		const { getByTestId } = renderComponent();
		expect(getByTestId("tracker-control-button")).toBeInTheDocument();
		act(() => {
			fireEvent.click(getByTestId("tracker-control-button"));
		});
		waitFor(() => {
			expect(mockProps.onCloseSidebar).toHaveBeenCalled();
			expect(mockUseGeofenceData.setIsAddingGeofence).toHaveBeenCalled();
			expect(mockProps.onSetShowAuthGeofenceBox).toHaveBeenCalled();
		});
	});

	it("renders tracker button and executes correctly when user AWS account not connected", () => {
		mockUseAuthData.isUserAwsAccountConnected = true;
		mockUseAuthData.credentials.authenticated = true;
		const { getByTestId } = renderComponent();
		expect(getByTestId("tracker-control-button")).toBeInTheDocument();
		act(() => {
			fireEvent.click(getByTestId("tracker-control-button"));
		});
		waitFor(() => {
			expect(mockProps.onCloseSidebar).toHaveBeenCalled();
			expect(mockProps.onSetShowUnauthGeofenceBox).toHaveBeenCalled();
			expect(mockProps.onSetShowUnauthTrackerBox).toHaveBeenCalled();
		});
	});
});
