import { MapButtons } from "@demo/atomicui/molecules";
import i18n from "@demo/locales/i18n";
import { SettingOptionEnum } from "@demo/types";
import { RenderResult, act, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { I18nextProvider } from "react-i18next";

import SettingsModal from "./SettingsModal";

Object.defineProperty(window, "location", {
	writable: true,
	value: { reload: jest.fn() }
});

const mockProps = {
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
	onlyMapStyles: true,
	resetSearchAndFilters: jest.fn(),
	showOpenDataDisclaimerModal: false,
	isAuthGeofenceBoxOpen: false,
	onSetShowAuthGeofenceBox: jest.fn(),
	isAuthTrackerDisclaimerModalOpen: false,
	isAuthTrackerBoxOpen: false,
	onShowAuthTrackerDisclaimerModal: jest.fn(),
	onSetShowAuthTrackerBox: jest.fn(),
	onShowUnauthSimulationDisclaimerModal: jest.fn(),
	isUnauthGeofenceBoxOpen: false,
	isUnauthTrackerBoxOpen: false,
	onSetShowUnauthGeofenceBox: jest.fn(),
	onSetShowUnauthTrackerBox: jest.fn()
};

describe("<SettingsModal />", () => {
	let settingsModal: HTMLElement;

	const onClose = jest.fn();
	const resetAppState = jest.fn();
	const handleMapProviderChange = jest.fn();
	const handleCurrentLocationAndViewpoint = jest.fn();
	const resetSearchAndFilters = jest.fn();

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
					mapButtons={<MapButtons {...mockProps} />}
				/>
			</I18nextProvider>
		);
		settingsModal = await screen.findByTestId("settings-modal");

		return renderedComponent;
	};

	beforeEach(() => {
		// jest.useFakeTimers();
		resetAppState.mockRestore();
	});

	afterEach(() => {
		// jest.useRealTimers();
	});

	it("should render successfully", async () => {
		await renderComponent();
		expect(settingsModal).toBeInTheDocument();
	});

	it("should render the detail component according to the clicked/selected option item", async () => {
		const { getByTestId } = await renderComponent();

		for (const optionId of [
			SettingOptionEnum.UNITS,
			SettingOptionEnum.DATA_PROVIDER,
			SettingOptionEnum.MAP_STYLE,
			SettingOptionEnum.ROUTE_OPTIONS,
			SettingOptionEnum.AWS_CLOUD_FORMATION
		]) {
			waitFor(
				() => {
					fireEvent.click(getByTestId(`option-item-${optionId}`));
					expect(getByTestId(`${optionId}-details-component`)).toBeInTheDocument();
				},
				{
					timeout: 10000,
					interval: 1000,
					onTimeout: e => {
						console.error({ e });
						return e;
					}
				}
			);
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
