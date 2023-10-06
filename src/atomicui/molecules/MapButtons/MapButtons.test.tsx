import i18n from "@demo/locales/i18n";
import { EsriMapEnum, MapProviderEnum } from "@demo/types";
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
	isGrabVisible: true,
	showGrabDisclaimerModal: false,
	onShowGridLoader: jest.fn(),
	handleMapStyleChange: jest.fn(),
	searchValue: "",
	setSearchValue: jest.fn(),
	selectedFilters: {
		Providers: [],
		Attribute: [],
		Type: []
	},
	setSelectedFilters: jest.fn(),
	isLoading: false,
	onlyMapStyles: false,
	resetSearchAndFilters: jest.fn(),
	showOpenDataDisclaimerModal: false,
	isHandDevice: false,
	handleMapProviderChange: jest.fn(),
	isAuthGeofenceBoxOpen: false,
	onSetShowAuthGeofenceBox: jest.fn(),
	isAuthTrackerDisclaimerModalOpen: false,
	isAuthTrackerBoxOpen: false,
	isSettingsModal: false,
	onShowAuthTrackerDisclaimerModal: jest.fn(),
	onSetShowAuthTrackerBox: jest.fn(),
	onShowUnauthSimulationDisclaimerModal: jest.fn(),
	isUnauthGeofenceBoxOpen: false,
	isUnauthTrackerBoxOpen: false,
	onSetShowUnauthGeofenceBox: jest.fn(),
	onSetShowUnauthTrackerBox: jest.fn()
};

const mockUseAmplifyAuthData = {
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

const mockUseAmplifyMapData = {
	mapProvider: MapProviderEnum.ESRI,
	mapStyle: EsriMapEnum.ESRI_STREET_MAP
};

const mockUseAwsGeofenceData = {
	isAddingGeofence: false,
	setIsAddingGeofence: jest.fn()
};

jest.mock("@demo/hooks", () => ({
	useAmplifyAuth: () => mockUseAmplifyAuthData,
	useAmplifyMap: () => mockUseAmplifyMapData,
	useAwsGeofence: () => mockUseAwsGeofenceData
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
		mockUseAmplifyAuthData.isUserAwsAccountConnected = false;
		mockUseAmplifyAuthData.credentials.authenticated = false;
		mockUseAmplifyMapData.mapProvider = MapProviderEnum.ESRI;
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
			expect(mockProps.setSearchValue).toHaveBeenCalled();
			expect(mockProps.resetSearchAndFilters).toHaveBeenCalled();
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
			fireEvent.click(getByTestId(`map-style-item-${EsriMapEnum.ESRI_STREET_MAP}`));
		});
		waitFor(() => {
			expect(mockProps.handleMapStyleChange).toHaveBeenCalledWith(EsriMapEnum.ESRI_STREET_MAP);
		});
	});

	it("should allow to use search", () => {
		mockProps.openStylesCard = true;
		const { getByTestId } = renderComponent();
		expect(getByTestId("map-styles-search-field")).toBeInTheDocument();
		act(() => {
			fireEvent.change(getByTestId("map-styles-search-field"), { target: { value: "test" } });
		});
		waitFor(() => {
			expect(mockProps.setSearchValue).toHaveBeenCalledWith("test");
		});
	});

	it("should allow to use filters", () => {
		mockProps.openStylesCard = true;
		const { getByTestId } = renderComponent();
		act(() => {
			fireEvent.click(getByTestId("filter-icon-wrapper"));
		});
		waitFor(() => {
			expect(getByTestId("filter-title-Provider")).toBeInTheDocument();
			expect(getByTestId("filter-checkbox-Esri")).toBeInTheDocument();
			expect(getByTestId("filter-checkbox-HERE")).toBeInTheDocument();
			expect(getByTestId("filter-checkbox-Grab")).toBeInTheDocument();
			expect(getByTestId("filter-checkbox-OpenData")).toBeInTheDocument();

			expect(getByTestId("filter-title-Attribute")).toBeInTheDocument();
			expect(getByTestId("filter-checkbox-Light")).toBeInTheDocument();
			expect(getByTestId("filter-checkbox-Dark")).toBeInTheDocument();
			expect(getByTestId("filter-checkbox-Satellite")).toBeInTheDocument();
			expect(getByTestId("filter-checkbox-3D")).toBeInTheDocument();
			expect(getByTestId("filter-checkbox-Truck")).toBeInTheDocument();

			expect(getByTestId("filter-title-Type")).toBeInTheDocument();
			expect(getByTestId("filter-checkbox-Vector")).toBeInTheDocument();
			expect(getByTestId("filter-checkbox-Raster")).toBeInTheDocument();
		});
		act(() => {
			fireEvent.change(getByTestId("filter-checkbox-OpenData"));
		});
		waitFor(() => {
			expect(mockProps.setSelectedFilters).toHaveBeenCalled();
		});
	});

	it("should reset filters when click on", () => {});

	it("renders geofence button and executes correctly when user AWS account connected and authenticated", () => {
		mockUseAmplifyAuthData.isUserAwsAccountConnected = true;
		mockUseAmplifyAuthData.credentials.authenticated = true;
		const { getByTestId } = renderComponent();
		expect(getByTestId("geofence-control-button")).toBeInTheDocument();
		act(() => {
			fireEvent.click(getByTestId("geofence-control-button"));
		});
		waitFor(() => {
			expect(mockProps.onCloseSidebar).toHaveBeenCalled();
			expect(mockProps.onSetShowAuthTrackerBox).toHaveBeenCalled();
			expect(mockProps.onSetShowAuthGeofenceBox).toHaveBeenCalled();
			expect(mockUseAwsGeofenceData.setIsAddingGeofence).toHaveBeenCalled();
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

	it("renders geofence button and executes correctly when user AWS account not connected and map is Grab", () => {
		mockUseAmplifyMapData.mapProvider = MapProviderEnum.GRAB;
		const { getByTestId } = renderComponent();
		expect(getByTestId("geofence-control-button")).toBeInTheDocument();
		act(() => {
			fireEvent.click(getByTestId("geofence-control-button"));
		});
		waitFor(() => {
			expect(mockProps.onCloseSidebar).toHaveBeenCalled();
			expect(mockProps.onShowUnauthSimulationDisclaimerModal).toHaveBeenCalled();
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

	it("renders tracker button and executes correctly when user AWS account connected and authenticated and map is Esri", () => {
		mockUseAmplifyAuthData.isUserAwsAccountConnected = true;
		mockUseAmplifyAuthData.credentials.authenticated = true;
		const { getByTestId } = renderComponent();
		expect(getByTestId("tracker-control-button")).toBeInTheDocument();
		act(() => {
			fireEvent.click(getByTestId("tracker-control-button"));
		});
		waitFor(() => {
			expect(mockProps.onCloseSidebar).toHaveBeenCalled();
			expect(mockUseAwsGeofenceData.setIsAddingGeofence).toHaveBeenCalled();
			expect(mockProps.onSetShowAuthGeofenceBox).toHaveBeenCalled();
			expect(mockProps.onShowAuthTrackerDisclaimerModal).toHaveBeenCalled();
		});
	});

	it("renders tracker button and executes correctly when user AWS account not connected", () => {
		mockUseAmplifyAuthData.isUserAwsAccountConnected = true;
		mockUseAmplifyAuthData.credentials.authenticated = true;
		mockUseAmplifyMapData.mapProvider = MapProviderEnum.GRAB;
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
