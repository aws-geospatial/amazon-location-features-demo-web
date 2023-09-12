import { View } from "@aws-amplify/ui-react";
// import { MapProviderEnum } from "@demo/types";
// import * as geoCalculationUtils from "@demo/utils/geoCalculation";
import i18n from "@demo/locales/i18n";
import { faker } from "@faker-js/faker";
import { act, fireEvent, render } from "@testing-library/react";
import { I18nextProvider } from "react-i18next";

import Popup from "./Popup";

/* @ts-expect-error: error */
// eslint-disable-next-line @typescript-eslint/no-unused-vars
const PopupMock = ({ closeButton: _, ...props }) => <View {...props} />;

jest.mock("react-map-gl", () => ({
	...jest.requireActual("react-map-gl"),
	Popup: PopupMock
}));

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

jest.mock("hooks", () => ({
	useAmplifyMap: () => useAmplifyMapReturnValue,
	useAwsPlace: () => ({}),
	useAwsRoute: () => ({
		getRoute: () => {}
	}),
	useMediaQuery: () => true
}));

describe("<Popup/>", () => {
	let popupContainer: HTMLElement;
	let directionsButton: HTMLElement | null;
	let copyIcon: HTMLElement | null;

	const renderComponent = () => {
		const renderedComponent = render(
			<I18nextProvider i18n={i18n}>
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
					setInfo={jest.fn()}
				/>
			</I18nextProvider>
		);
		const { queryByTestId } = renderedComponent;

		popupContainer = queryByTestId("popup-container") as HTMLElement;
		copyIcon = queryByTestId("copy-icon");
		directionsButton = queryByTestId("directions-button");

		return renderedComponent;
	};

	afterAll(() => {
		jest.resetAllMocks();
	});

	it("should render successfully (popupContainer and copyIcon)", () => {
		renderComponent();
		expect(popupContainer).toBeInTheDocument();
		expect(copyIcon).toBeInTheDocument();
		expect(directionsButton).toBeInTheDocument();
	});

	it("should call copy icon onClick function when copy icon is clicked", async () => {
		renderComponent();
		await act(async () => {
			fireEvent.click(copyIcon!);
		});
		expect(navigator.clipboard.writeText).toBeCalled();
	});
});
