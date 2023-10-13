import i18n from "@demo/locales/i18n";
import { act, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { I18nextProvider } from "react-i18next";

import SearchBox from "./SearchBox";

const mockProps = {
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	mapRef: { getCenter: () => ({ lat: 123, lng: 34 }) } as any,
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

const mockUseAmplifyMapData = {
	currentLocationData: {
		error: null
	},
	viewpoint: { longitude: -122.3408586, latitude: 47.6149975 },
	mapProvider: "Esri",
	mapUnit: "Imperial",
	isCurrentLocationDisabled: false
};

const mockUseAwsPlaceData = {
	clusters: [],
	suggestions: [{}],
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
	useAmplifyMap: () => mockUseAmplifyMapData,
	useAwsPlace: () => mockUseAwsPlaceData
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
			expect(mockUseAwsPlaceData.clearPoiList).toHaveBeenCalled();
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
			expect(mockUseAwsPlaceData.clearPoiList).toHaveBeenCalled();
			expect(mockUseAwsPlaceData.search).toHaveBeenCalled();
		});
	});
});
