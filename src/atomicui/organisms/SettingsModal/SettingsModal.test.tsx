import { SettingOptionEnum } from "@demo/types";
import { faker } from "@faker-js/faker";
import { RenderResult, act, fireEvent, render, screen } from "@testing-library/react";

import SettingsModal from "./SettingsModal";

describe("<SettingsModal />", () => {
	let settingsModal: HTMLElement;

	const onClose = jest.fn();
	const resetAppState = jest.fn();
	const handleMapProviderChange = jest.fn();
	const handleMapStyleChange = jest.fn();
	const handleCurrentLocationAndViewpoint = jest.fn();
	const resetSearchAndFilters = jest.fn();

	const renderComponent = async (): Promise<RenderResult> => {
		const renderedComponent = render(
			<SettingsModal
				open
				onClose={onClose}
				resetAppState={resetAppState}
				isGrabVisible={false}
				handleMapProviderChange={handleMapProviderChange}
				handleMapStyleChange={handleMapStyleChange}
				handleCurrentLocationAndViewpoint={handleCurrentLocationAndViewpoint}
				resetSearchAndFilters={resetSearchAndFilters}
				mapButtons={<div>Map Buttons</div>}
			/>
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
