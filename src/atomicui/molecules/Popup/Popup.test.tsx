import { View } from "@aws-amplify/ui-react";
import i18n from "@demo/locales/i18n";
import { faker } from "@faker-js/faker";
import { act, fireEvent, render } from "@testing-library/react";
import { I18nextProvider } from "react-i18next";

import Popup from "./Popup";

/* @ts-expect-error: error */
// eslint-disable-next-line @typescript-eslint/no-unused-vars
const PopupMock = ({ closeButton: _, ...props }) => <View {...props} />;

jest.mock("react-map-gl/maplibre", () => ({
	...jest.requireActual("react-map-gl/maplibre"),
	Popup: PopupMock
}));

const useMapReturnValue: {
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
	mapProvider: "Here",
	mapUnit: "Imperial",
	isCurrentLocationDisabled: false
};

jest.mock("hooks", () => ({
	useMap: () => useMapReturnValue,
	usePlace: () => ({
		getPlaceData: jest.fn(),
		isFetchingPlaceData: false,
		clearPoiList: jest.fn()
	}),
	useRoute: () => ({
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
					placeId={faker.random.word()}
					position={[parseFloat(faker.address.longitude()), parseFloat(faker.address.latitude())]}
					label={`${faker.address.street()}, ${faker.address.city()}, ${faker.address.state()}, ${faker.address.zipCode()}`}
					active
					select={jest.fn()}
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
