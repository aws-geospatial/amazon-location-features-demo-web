import { View } from "@aws-amplify/ui-react";
import { faker } from "@faker-js/faker";
import { RenderResult, act, fireEvent, render, screen } from "@testing-library/react";

import { MapProviderEnum } from "types";

import * as geoCalculationUtils from "utils/geoCalculation";

import Popup from "./Popup";

/* @ts-expect-error: error */
const PopupMock = ({ closeButton: _, ...props }) => <View {...props} />;

jest.mock("react-map-gl", () => ({
	...jest.requireActual("react-map-gl"),
	Popup: PopupMock
}));

const useAmplifyMapReturnValue: {
	currentLocationData: {
		error: null | string;
	};
	mapProvider: string;
} = {
	currentLocationData: {
		error: null
	},
	mapProvider: "Esri"
};

jest.mock("hooks", () => ({
	useAmplifyMap: () => useAmplifyMapReturnValue,
	useAwsPlace: () => ({}),
	useAwsRoute: () => ({
		getRoute: () => {}
	})
}));

describe("<Popup/>", () => {
	let popupContainer: HTMLElement;
	let permissionDeniedErrorContainer: HTMLElement | null;
	let esriLimitationMessageContainer: HTMLElement | null;
	let hereMessageContainer: HTMLElement | null;
	let routeInfoContainer: HTMLElement | null;
	let directionsButton: HTMLElement | null;
	let copyIcon: HTMLElement | null;

	const renderComponent = async (): Promise<RenderResult> => {
		const renderedComponent = render(
			<Popup
				active
				info={{
					PlaceId: faker.random.word(),
					Text: faker.random.words(3),
					Distance: 11,
					Relevance: 11,
					Hash: faker.random.word(),
					Place: {
						Label: faker.random.words(3),
						Geometry: { Point: [0, 0] }
					}
				}}
				select={jest.fn()}
			/>
		);

		popupContainer = await screen.findByTestId("popup-container");
		permissionDeniedErrorContainer = screen.queryByTestId("permission-denied-error-container");
		esriLimitationMessageContainer = screen.queryByTestId("esri-limitation-message-container");
		hereMessageContainer = screen.queryByTestId("here-message-container");
		routeInfoContainer = screen.queryByTestId("route-info-container");
		copyIcon = screen.queryByTestId("copy-icon");
		directionsButton = screen.queryByTestId("directions-button");

		return renderedComponent;
	};

	afterAll(() => {
		jest.resetAllMocks();
	});

	it("should render successfully (popupContainer and copyIcon)", async () => {
		await renderComponent();
		expect(popupContainer).toBeInTheDocument();
		expect(copyIcon).toBeInTheDocument();
		expect(directionsButton).toBeInTheDocument();
	});

	it("should call copy icon onClick function when copy icon is clicked", async () => {
		await renderComponent();
		act(() => fireEvent.click(copyIcon!));
		expect(navigator.clipboard.writeText).toBeCalled();
	});

	it("should render Route Info message per case", async () => {
		let renderedComponent = await renderComponent();
		expect(esriLimitationMessageContainer).toBeInTheDocument();
		renderedComponent.unmount();

		jest.spyOn(geoCalculationUtils, "calculateGeodesicDistance").mockReturnValue(123);
		renderedComponent = await renderComponent();
		expect(routeInfoContainer).toBeInTheDocument();
		renderedComponent.unmount();

		useAmplifyMapReturnValue["mapProvider"] = MapProviderEnum.HERE;
		renderedComponent = await renderComponent();
		expect(hereMessageContainer).toBeInTheDocument();
		renderedComponent.unmount();

		useAmplifyMapReturnValue["currentLocationData"]["error"] = "something";
		renderedComponent = await renderComponent();
		expect(permissionDeniedErrorContainer).toBeInTheDocument();
		renderedComponent.unmount();
	});
});
