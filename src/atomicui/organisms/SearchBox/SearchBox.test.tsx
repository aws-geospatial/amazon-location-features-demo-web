import { ComboBoxOption } from "@aws-amplify/ui-react";
import i18n from "@demo/locales/i18n";
import { AnalyticsEventActionsEnum, SuggestionType, TriggeredByEnum } from "@demo/types";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { I18nextProvider } from "react-i18next";
import { LngLat } from "react-map-gl";

import SearchBox from "./SearchBox";

const mockClearPoiList = jest.fn();

const mockSuggestions = [{}];
const mockSetIsSearching = jest.fn();

const useAmplifyMapReturnValue: {
	currentLocationData: {
		error: null | string;
	};
	viewpoint: { longitude: number; latitude: number };
	mapProvider: string;
	mapUnit: string;
	isCurrentLocationDisabled: boolean;
} = {
	currentLocationData: {
		error: null
	},
	viewpoint: { longitude: -122.3408586, latitude: 47.6149975 },
	mapProvider: "Esri",
	mapUnit: "Imperial",
	isCurrentLocationDisabled: false
};
const mockSearch = jest.fn();
const mockSetSelectedMarker = jest.fn();

jest.mock("@demo/hooks", () => ({
	useAmplifyMap: () => useAmplifyMapReturnValue,
	useAwsPlace: () => ({
		clearPoiList: mockClearPoiList,
		setIsSearching: mockSetIsSearching,
		suggestions: mockSuggestions,
		search: mockSearch,
		setSelectedMarker: mockSetSelectedMarker,
		setHoveredMarker: jest.fn(),
		isSearching: false,
		marker: null,
		selectedMarker: null,
		clusters: []
	})
}));

describe("<SearchBox />", () => {
	let searchBarContainer: HTMLElement;
	let value = "";
	const timeoutIdRef = {
		current: {}
	};
	const props = {
		// eslint-disable-next-line @typescript-eslint/no-explicit-any
		mapRef: { getCenter: () => ({ lat: 123, lng: 34 }) } as any,
		isSideMenuExpanded: false,
		onToggleSideMenu: jest.fn(),
		setShowRouteBox: jest.fn(),
		isRouteBoxOpen: false,
		isAuthGeofenceBoxOpen: false,
		isAuthTrackerBoxOpen: false,
		isSettingsOpen: false,
		isStylesCardOpen: false
	};

	const handleSearch = async (value: string, exact = false, action: string) => {
		const { lng: longitude, lat: latitude } = props.mapRef?.getCenter() as LngLat;
		const vp = { longitude, latitude };

		if (timeoutIdRef.current) {
			clearTimeout((timeoutIdRef.current = 0));
		}

		mockSetIsSearching(true);
		timeoutIdRef.current = setTimeout(async () => {
			await mockSearch(
				value,
				{ longitude: vp.longitude, latitude: vp.latitude },
				exact,
				undefined,
				TriggeredByEnum.PLACES_SEARCH,
				action
			);
			mockSetIsSearching(false);
		}, 200);
	};

	const selectSuggestion = async ({ text, label, placeid }: ComboBoxOption) => {
		if (!placeid) {
			await handleSearch(text || label, true, AnalyticsEventActionsEnum.SUGGESTION_SELECTED);
		} else {
			const selectedMarker = mockSuggestions?.find(
				(i: SuggestionType) => i.PlaceId === placeid || i.Place?.Label === placeid
			);

			await mockSetSelectedMarker(selectedMarker);
		}
	};

	const renderComponent = () => {
		return render(
			<I18nextProvider i18n={i18n}>
				<SearchBox {...props} />
			</I18nextProvider>
		);
	};

	it("useEffect clears PoiList and resets value when conditions are met", () => {
		if (!value) {
			expect(mockClearPoiList).toHaveBeenCalled();
		}

		if (
			props.isRouteBoxOpen ||
			props.isAuthGeofenceBoxOpen ||
			props.isAuthTrackerBoxOpen ||
			props.isSettingsOpen ||
			props.isStylesCardOpen
		) {
			value = "";
			expect(mockClearPoiList).toHaveBeenCalled();
		}
	});

	beforeEach(async () => {
		renderComponent();

		// await because the `SearchBox` component has side-effects in react-tooltip, thus we need to wait for them to be completed
		searchBarContainer = await screen.findByTestId("search-bar-container");
	});

	it("should render successfully", () => {
		expect(searchBarContainer).toBeInTheDocument();
	});

	it("should render the side bar", () => {
		const sideMenu = screen.queryByTestId("side-bar");
		expect(sideMenu).not.toBeInTheDocument();

		const hamburgerMenu = screen.getByTestId("hamburger-menu");
		fireEvent.click(hamburgerMenu);

		waitFor(() => expect(screen.getByTestId("side-bar")).toBeInTheDocument());
	});

	it("onSubmit event is triggered when the form is submitted", () => {
		const { container } = renderComponent();
		const searchBar = container.querySelector("#search-bar") as HTMLInputElement;

		fireEvent.change(searchBar, { target: { value: "search query" } });
		fireEvent.submit(searchBar);
	});

	it("search bar is focused", () => {
		const { container } = renderComponent();
		const searchBar = container.querySelector("#search-bar") as HTMLInputElement;

		fireEvent.focus(searchBar, { target: { isFocused: true } });
	});

	it("search bar is blurred", () => {
		const { container } = renderComponent();
		const searchBar = container.querySelector("#search-bar") as HTMLInputElement;

		fireEvent.focus(searchBar, { target: { isFocused: false } });
	});

	it("search bar is cleared", () => {
		const { container, getByTestId } = renderComponent();
		const searchBar = container.querySelector("#search-bar") as HTMLInputElement;

		fireEvent.change(searchBar, { target: { value: "rest" } });
		fireEvent.submit(searchBar);

		const cleanSearch = getByTestId("clean-search");
		fireEvent.click(cleanSearch);
	});

	it("on suggestion select", () => {
		const { container, getByTestId } = renderComponent();
		const searchBar = container.querySelector("#search-bar") as HTMLInputElement;

		fireEvent.change(searchBar, { target: { value: "rest" } });

		waitFor(() => expect(getByTestId("suggestion-0")).toBeInTheDocument());
		waitFor(() => selectSuggestion({ id: "0", text: "rest", label: "rest" }));
	});

	it("on suggestion select with placeid", () => {
		const { container, getByTestId } = renderComponent();
		const searchBar = container.querySelector("#search-bar") as HTMLInputElement;

		fireEvent.change(searchBar, { target: { value: "rest" } });

		waitFor(() => expect(getByTestId("suggestion-0")).toBeInTheDocument());
		waitFor(() =>
			selectSuggestion({
				id: "0",
				text: "rest",
				label: "rest",
				placeid: "placeid"
			})
		);
	});

	it("should render route card", () => {
		const { getByTestId } = renderComponent();

		waitFor(() => expect(getByTestId("directions-button")).toBeInTheDocument());
		waitFor(() => fireEvent.click(getByTestId("directions-button")));
		waitFor(() => expect(getByTestId("route-card")).toBeInTheDocument());
	});
});
