import i18n from "@demo/locales/i18n";
import { faker } from "@faker-js/faker";
import { act, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { I18nextProvider } from "react-i18next";
import { MapRef } from "react-map-gl/maplibre";

import SearchBox from "./SearchBox";

const mockProps = {
	mapRef: {
		current: {
			getCenter: () => ({
				lng: Number(faker.address.longitude()),
				lat: Number(faker.address.latitude())
			})
		} as MapRef
	},
	value: "",
	setValue: jest.fn(),
	isSideMenuExpanded: false,
	onToggleSideMenu: jest.fn(),
	setShowRouteBox: jest.fn(),
	isRouteBoxOpen: false,
	isAuthGeofenceBoxOpen: false,
	isAuthTrackerBoxOpen: false,
	isSettingsOpen: false,
	isStylesCardOpen: false
};

const mockUseMapData = {
	currentLocationData: {
		error: null
	},
	viewpoint: { longitude: -122.3408586, latitude: 47.6149975 },
	mapProvider: "Esri",
	mapUnit: "Imperial",
	isCurrentLocationDisabled: false
};

const mockUsePlaceData = {
	clusters: [],
	suggestions: {
		list: [],
		renderMarkers: false
	},
	selectedMarker: null,
	marker: null,
	search: jest.fn(),
	isSearching: false,
	clearPoiList: jest.fn(),
	setSelectedMarker: jest.fn(),
	setHoveredMarker: jest.fn(),
	setSearchingState: jest.fn(),
	setIsSearching: jest.fn(),
	setSuggestions: jest.fn()
};

jest.mock("@demo/hooks", () => ({
	useMap: () => mockUseMapData,
	usePlace: () => mockUsePlaceData
}));

describe("<SearchBox />", () => {
	const renderComponent = () => {
		return render(
			<I18nextProvider i18n={i18n}>
				<SearchBox {...mockProps} />
			</I18nextProvider>
		);
	};

	beforeEach(() => {
		mockProps.isRouteBoxOpen = false;
	});

	it("should render successfully", () => {
		const { getByTestId } = renderComponent();
		waitFor(() => {
			expect(getByTestId("search-bar-container")).toBeInTheDocument();
		});
	});

	it("useEffect clears PoiList and resets value when conditions are met", () => {
		mockProps.isRouteBoxOpen = true;
		const {} = renderComponent();
		waitFor(() => {
			expect(mockUsePlaceData.clearPoiList).toHaveBeenCalled();
		});
	});

	it("should render the side bar", () => {
		const { queryByTestId, getByTestId } = renderComponent();
		waitFor(() => {
			expect(queryByTestId("side-bar")).not.toBeInTheDocument();
		});
		act(() => {
			fireEvent.click(getByTestId("hamburger-menu"));
		});
		waitFor(() => expect(screen.getByTestId("side-bar")).toBeInTheDocument());
	});

	it("onSubmit event is triggered when the form is submitted", () => {
		const { getByTestId } = renderComponent();
		act(() => {
			fireEvent.change(getByTestId("search-box-input"), { target: { value: "search query" } });
		});
		waitFor(() => {
			expect(mockUsePlaceData.clearPoiList).toHaveBeenCalled();
			expect(mockUsePlaceData.search).toHaveBeenCalled();
		});
	});
});
