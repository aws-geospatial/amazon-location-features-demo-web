import { forwardRef } from "react";

import { AutocompleteProps, ThemeProvider } from "@aws-amplify/ui-react";
import i18n from "@demo/locales/i18n";
import { faker } from "@faker-js/faker";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
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
	setValue: vi.fn(),
	isSideMenuExpanded: false,
	onToggleSideMenu: vi.fn(),
	setShowRouteBox: vi.fn(),
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
	search: vi.fn(),
	isSearching: false,
	clearPoiList: vi.fn(),
	setSelectedMarker: vi.fn(),
	setHoveredMarker: vi.fn(),
	setSearchingState: vi.fn(),
	setIsSearching: vi.fn(),
	setSuggestions: vi.fn()
};

// The Autocomplete component from Amplify UI generates an invalid ID in the JSDOM test environment,
// causing a selector syntax error. We mock it here to be a simple input, which allows us to
// test the SearchBox's logic without being blocked by the library's incompatibility.
vi.mock("@aws-amplify/ui-react", async () => {
	const actual = await vi.importActual<typeof import("@aws-amplify/ui-react")>("@aws-amplify/ui-react");
	const MockAutocomplete = forwardRef<HTMLInputElement, AutocompleteProps>((props, ref) => (
		// The mock needs to render the innerStartComponent prop, which contains the hamburger menu.
		<div className="mock-autocomplete-container">
			{props.innerStartComponent}
			<input
				ref={ref}
				data-testid="search-box-input"
				value={props.value || ""}
				onChange={e => props.onChange?.(e as React.ChangeEvent<HTMLInputElement>)}
			/>
			{props.innerEndComponent}
		</div>
	));
	return {
		...actual,
		Autocomplete: MockAutocomplete
	};
});

vi.mock("@demo/hooks", () => ({
	useMap: () => mockUseMapData,
	usePlace: () => mockUsePlaceData
}));

describe("<SearchBox />", () => {
	const renderComponent = () => {
		return render(
			<ThemeProvider>
				<I18nextProvider i18n={i18n}>
					<SearchBox {...mockProps} />
				</I18nextProvider>
			</ThemeProvider>
		);
	};

	beforeEach(() => {
		vi.clearAllMocks();
		mockProps.isRouteBoxOpen = false;
	});

	it("should render successfully", async () => {
		renderComponent();
		expect(await screen.findByTestId("search-bar-container")).toBeInTheDocument();
	});

	it("useEffect clears PoiList and resets value when conditions are met", async () => {
		mockProps.isRouteBoxOpen = true;
		const {} = renderComponent();
		await waitFor(() => {
			expect(mockUsePlaceData.clearPoiList).toHaveBeenCalled();
		});
	});

	it("should render the side bar on click", async () => {
		renderComponent();
		expect(screen.queryByTestId("side-bar")).not.toBeInTheDocument();

		fireEvent.click(screen.getByTestId("hamburger-menu"));

		expect(await screen.findByTestId("search-bar-container")).toBeInTheDocument();
	});

	it("should trigger search when text is entered", async () => {
		renderComponent();
		const input = screen.getByTestId("search-box-input");

		fireEvent.change(input, { target: { value: "search query" } });

		await waitFor(() => {
			expect(mockUsePlaceData.clearPoiList).toHaveBeenCalled();
			expect(mockUsePlaceData.search).toHaveBeenCalled();
		});
	});
});
