import { View } from "@aws-amplify/ui-react";
import i18n from "@demo/locales/i18n";
import { faker } from "@faker-js/faker";
import { fireEvent, render, screen } from "@testing-library/react";
import { I18nextProvider } from "react-i18next";

import Popup from "./Popup";

vi.mock("react-map-gl/maplibre", async () => {
	const actual = await vi.importActual("react-map-gl/maplibre");
	// Mock Popup to prevent map-gl from trying to render in a JSDOM env
	// and to fix the explicit-any lint error.
	const PopupMock = (props: import("react-map-gl/maplibre").PopupProps) => {
		// eslint-disable-next-line @typescript-eslint/no-unused-vars
		const { longitude, latitude, closeButton, ...rest } = props;
		return <View {...rest} />;
	};
	return {
		...actual,
		Popup: PopupMock
	};
});
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

vi.mock("@demo/hooks", () => ({
	useMap: () => useMapReturnValue,
	usePlace: () => ({
		getPlaceData: vi.fn(),
		isFetchingPlaceData: false,
		clearPoiList: vi.fn()
	}),
	useRoute: () => ({
		getRoute: vi.fn(),
		setDirections: vi.fn(),
		isFetchingRoute: false
	}),
	useBottomSheet: () => ({
		setPOICard: vi.fn(),
		setBottomSheetMinHeight: vi.fn(),
		setBottomSheetHeight: vi.fn(),
		setUI: vi.fn()
	}),
	useDeviceMediaQuery: () => ({ isDesktop: true })
}));

describe("<Popup/>", () => {
	// Mock for navigator.clipboard.writeText
	Object.assign(navigator, { clipboard: { writeText: vi.fn() } });

	const renderComponent = () => {
		const renderedComponent = render(
			<I18nextProvider i18n={i18n}>
				<Popup
					placeId={faker.random.word()}
					position={[parseFloat(faker.address.longitude()), parseFloat(faker.address.latitude())]}
					label={`${faker.address.street()}, ${faker.address.city()}, ${faker.address.state()}, ${faker.address.zipCode()}`}
					active
					select={vi.fn()}
				/>
			</I18nextProvider>
		);

		return renderedComponent;
	};

	beforeEach(() => {
		vi.clearAllMocks();
	});

	afterAll(() => {
		vi.resetAllMocks();
	});

	it("should render successfully", async () => {
		renderComponent();
		expect(await screen.findByTestId("popup-container")).toBeInTheDocument();
		expect(await screen.findByTestId("copy-icon")).toBeInTheDocument();
		expect(await screen.findByTestId("directions-button")).toBeInTheDocument();
	});

	it("should call copy icon onClick function when copy icon is clicked", async () => {
		renderComponent();
		fireEvent.click(await screen.findByTestId("copy-icon"));
		expect(navigator.clipboard.writeText).toBeCalled();
	});
});
