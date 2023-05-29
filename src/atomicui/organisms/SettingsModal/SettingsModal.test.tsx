import { SettingOptionEnum } from "@demo/types";
import { faker } from "@faker-js/faker";
import { RenderResult, act, fireEvent, render, screen } from "@testing-library/react";

import SettingsModal from "./SettingsModal";

describe("<SettingsModal />", () => {
	let settingsModal: HTMLElement;

	const onClose = jest.fn();
	const resetAppState = jest.fn();

	const renderComponent = async (props?: {}): Promise<RenderResult> => {
		const renderedComponent = render(<SettingsModal open onClose={onClose} resetAppState={resetAppState} {...props} />);
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
		expect(resetAppState).toBeCalledTimes(1);
	});

	it("should change map style and add the selected in the map style item when the user clicks it", async () => {
		await renderComponent();

		const optionItem = screen.getByTestId(`option-item-${SettingOptionEnum.MAP_STYLE}`);
		act(() => optionItem.click());

		const dataProviderEsriRadio = screen.getAllByTestId("esri-map-style");
		const randomNumber1 = faker.datatype.number({ min: 0, max: dataProviderEsriRadio.length - 1 });
		await act(async () => dataProviderEsriRadio[randomNumber1].click());
		expect(dataProviderEsriRadio[randomNumber1]).toHaveClass("selected");

		const dataProviderHereRadio = screen.getAllByTestId("here-map-style");
		const randomNumber2 = faker.datatype.number({ min: 0, max: dataProviderHereRadio.length - 1 });
		await act(async () => dataProviderHereRadio[randomNumber2].click());
		expect(dataProviderHereRadio[randomNumber2]).toHaveClass("selected");
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
