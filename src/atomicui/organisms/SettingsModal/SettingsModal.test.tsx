import { MapButtons } from "@demo/atomicui/molecules";
import i18n from "@demo/locales/i18n";
import { SettingOptionEnum } from "@demo/types";
import { RenderResult, act, fireEvent, render, screen } from "@testing-library/react";
import { I18nextProvider } from "react-i18next";

import SettingsModal from "./SettingsModal";

describe("<SettingsModal />", () => {
	let settingsModal: HTMLElement;

	const onClose = jest.fn();
	const resetAppState = jest.fn();
	const handleMapProviderChange = jest.fn();
	const handleCurrentLocationAndViewpoint = jest.fn();
	const resetSearchAndFilters = jest.fn();

	const props = {
		renderedUpon: "",
		openStylesCard: false,
		isGrabVisible: true,
		showGrabDisclaimerModal: false,
		searchValue: "",
		isLoading: false,
		onlyMapStyles: true,
		selectedFilters: {
			Providers: [],
			Attribute: [],
			Type: []
		},
		setOpenStylesCard: jest.fn(),
		onCloseSidebar: jest.fn(),
		onOpenConnectAwsAccountModal: jest.fn(),
		onOpenSignInModal: jest.fn(),
		onShowGeofenceBox: jest.fn(),
		onShowGridLoader: jest.fn(),
		handleMapStyleChange: jest.fn(),
		setSearchValue: jest.fn(),
		setSelectedFilters: jest.fn(),
		resetSearchAndFilters: jest.fn(),
		showOpenDataDisclaimerModal: false,
		isAuthTrackerDisclaimerModalOpen: false,
		onShowAuthTrackerDisclaimerModal: jest.fn(),
		isAuthTrackerBoxOpen: false
	};

	const renderComponent = async (): Promise<RenderResult> => {
		const renderedComponent = render(
			<I18nextProvider i18n={i18n}>
				<SettingsModal
					open
					onClose={onClose}
					resetAppState={resetAppState}
					isGrabVisible={false}
					handleMapProviderChange={handleMapProviderChange}
					handleCurrentLocationAndViewpoint={handleCurrentLocationAndViewpoint}
					resetSearchAndFilters={resetSearchAndFilters}
					mapButtons={<MapButtons {...props} />}
				/>
			</I18nextProvider>
		);
		settingsModal = await screen.findByTestId("settings-modal");

		return renderedComponent;
	};

	beforeEach(() => {
		jest.useFakeTimers();
		resetAppState.mockRestore();
	});

	afterEach(() => {
		jest.useRealTimers();
	});

	it("should render successfully", async () => {
		await renderComponent();
		expect(settingsModal).toBeInTheDocument();
	});

	it("should render the detail component according to the clicked/selected option item", async () => {
		await renderComponent();

		for (const optionId of [
			SettingOptionEnum.UNITS,
			SettingOptionEnum.DATA_PROVIDER,
			SettingOptionEnum.MAP_STYLE,
			SettingOptionEnum.ROUTE_OPTIONS,
			SettingOptionEnum.AWS_CLOUD_FORMATION
		]) {
			const optionItem = screen.getByTestId(`option-item-${optionId}`);
			act(() => optionItem.click());
			const detailsComponent = screen.getByTestId(`${optionId}-details-component`);
			expect(detailsComponent).toBeInTheDocument();
		}
	});

	it("should change map unit successfully", async () => {
		await renderComponent();

		const optionItem = screen.getByTestId(`option-item-${SettingOptionEnum.UNITS}`);
		act(() => optionItem.click());
		expect(screen.getByTestId(`${SettingOptionEnum.UNITS}-details-component`)).toHaveTextContent("Automatic");

		const unitImperialRadio = screen.getByTestId("unit-imperial-radio");
		fireEvent.click(unitImperialRadio);
		expect(resetAppState).toBeCalledTimes(1);
	});

	it("should change map data provider successfully", async () => {
		await renderComponent();

		const optionItem = screen.getByTestId(`option-item-${SettingOptionEnum.DATA_PROVIDER}`);
		act(() => optionItem.click());

		const dataProviderHereRadio = screen.getByTestId("data-provider-here-radio");
		fireEvent.click(dataProviderHereRadio);
		// expect(resetAppState).toBeCalledTimes(1);
		expect(handleMapProviderChange).toBeCalledTimes(1);
	});

	it("should select/unselect avoid-tolls and avoid-ferries", async () => {
		await renderComponent();

		const optionItem = screen.getByTestId(`option-item-${SettingOptionEnum.ROUTE_OPTIONS}`);
		act(() => optionItem.click());

		const avoidTolls = screen.getByTestId("avoid-tolls");

		act(() => avoidTolls.click());
		expect(avoidTolls).not.toBeChecked();
		act(() => avoidTolls.click());
		expect(avoidTolls).toBeChecked();

		const avoidFerries = screen.getByTestId("avoid-ferries");
		act(() => avoidFerries.click());
		expect(avoidFerries).not.toBeChecked();
		act(() => avoidFerries.click());
		expect(avoidFerries).toBeChecked();
	});
});
