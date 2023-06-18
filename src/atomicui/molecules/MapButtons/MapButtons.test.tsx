import { EsriMapEnum } from "@demo/types";
import { act, fireEvent, render, screen } from "@testing-library/react";

import MapButtons from "./MapButtons";

describe("<MapButtons/>", () => {
	const props = {
		openStylesCard: false,
		setOpenStylesCard: jest.fn(),
		onCloseSidebar: jest.fn(),
		onOpenConnectAwsAccountModal: jest.fn(),
		onOpenSignInModal: jest.fn(),
		onShowGeofenceBox: jest.fn(),
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
		isLoading: false
	};

	const renderComponent = async () => {
		render(<MapButtons {...props} />);
	};

	test("renders map buttons container", async () => {
		await act(async () => {
			await renderComponent();
		});
		expect(screen.getByTestId("map-buttons-container")).toBeInTheDocument();
	});

	test("renders map styles button and opens the map styles card", async () => {
		props.openStylesCard = true;
		await act(async () => {
			await renderComponent();
		});

		expect(screen.getByTestId("map-styles-card")).toBeInTheDocument();
	});

	test("renders geofence control button", async () => {
		await act(async () => {
			await renderComponent();
		});
		expect(screen.getByTestId("geofence-control-button")).toBeInTheDocument();
	});

	test("searches for map styles", async () => {
		await act(async () => {
			await renderComponent();
		});
		fireEvent.click(screen.getByTestId("map-styles-button"));

		await act(async () => {
			fireEvent.change(screen.getByPlaceholderText("Search styles"), { target: { value: "satellite" } });
		});

		expect(props.setSearchValue).toHaveBeenCalledWith("satellite");
	});

	test("updates selected filters when a filter is clicked", async () => {
		props.openStylesCard = true;
		await act(async () => {
			await renderComponent();
		});

		fireEvent.click(screen.getByTestId("map-styles-button"));

		await screen.findByTestId("map-styles-card");

		const filterButton = screen.getByTestId("filter-icon-wrapper");
		fireEvent.click(filterButton);

		const filterCheckbox = screen.getByTestId("filter-checkbox-Esri") as HTMLInputElement;
		fireEvent.click(filterCheckbox);

		props.setSelectedFilters({
			Providers: [filterCheckbox],
			Attribute: [],
			Type: []
		});
	});

	test("selects a map style", async () => {
		await act(async () => {
			await renderComponent();
		});
		fireEvent.click(screen.getByTestId("map-styles-button"));

		await screen.findByTestId("map-styles-card");

		await act(async () => {
			fireEvent.click(screen.getByTestId(`map-style-item-${EsriMapEnum.ESRI_STREET_MAP}`));
		});

		expect(props.handleMapStyleChange).toHaveBeenCalledWith(EsriMapEnum.ESRI_STREET_MAP);
	});
});
