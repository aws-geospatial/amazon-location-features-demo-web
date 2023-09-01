import i18n from "@demo/locales/i18n";
import { EsriMapEnum } from "@demo/types";
import { fireEvent, render, waitFor } from "@testing-library/react";
import { I18nextProvider } from "react-i18next";

import MapButtons from "./MapButtons";

describe("<MapButtons/>", () => {
	const props = {
		renderedUpon: "",
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
		isLoading: false,
		resetSearchAndFilters: jest.fn(),
		showOpenDataDisclaimerModal: false,
		isAuthTrackerDisclaimerModalOpen: false,
		onShowAuthTrackerDisclaimerModal: jest.fn(),
		isAuthTrackerBoxOpen: false
	};

	const renderComponent = () => {
		return render(
			<I18nextProvider i18n={i18n}>
				<MapButtons {...props} />
			</I18nextProvider>
		);
	};

	test("renders map buttons container", async () => {
		const { getByTestId } = renderComponent();
		await waitFor(() => {
			expect(getByTestId("map-buttons-container")).toBeInTheDocument();
		});
	});

	test("renders map styles button and opens the map styles card", async () => {
		props.openStylesCard = true;
		const { getByTestId } = renderComponent();
		await waitFor(() => {
			expect(getByTestId("map-styles-card")).toBeInTheDocument();
		});
	});

	test("renders geofence control button", async () => {
		const { getByTestId } = renderComponent();
		await waitFor(() => {
			expect(getByTestId("geofence-control-button")).toBeInTheDocument();
		});
	});

	test("searches for map styles", async () => {
		const { getByTestId, getByPlaceholderText } = renderComponent();
		fireEvent.click(getByTestId("map-styles-button"));

		await waitFor(() => {
			fireEvent.change(getByPlaceholderText("Search styles"), { target: { value: "satellite" } });
		});

		expect(props.setSearchValue).toHaveBeenCalledWith("satellite");
	});

	test("updates selected filters when a filter is clicked", async () => {
		props.openStylesCard = true;
		const { getByTestId, findByTestId } = renderComponent();

		fireEvent.click(getByTestId("map-styles-button"));

		findByTestId("map-styles-card");

		const filterButton = getByTestId("filter-icon-wrapper");
		fireEvent.click(filterButton);

		const filterCheckbox = getByTestId("filter-checkbox-Esri") as HTMLInputElement;
		fireEvent.click(filterCheckbox);

		props.setSelectedFilters({
			Providers: [filterCheckbox],
			Attribute: [],
			Type: []
		});
	});

	test("selects a map style", async () => {
		const { getByTestId, findByTestId } = renderComponent();
		fireEvent.click(getByTestId("map-styles-button"));

		findByTestId("map-styles-card");

		await waitFor(() => {
			fireEvent.click(getByTestId(`map-style-item-${EsriMapEnum.ESRI_STREET_MAP}`));
		});

		expect(props.handleMapStyleChange).toHaveBeenCalledWith(EsriMapEnum.ESRI_STREET_MAP);
	});
});
