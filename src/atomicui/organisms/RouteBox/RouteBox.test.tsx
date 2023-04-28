/* eslint-disable @typescript-eslint/no-explicit-any */
import { View } from "@aws-amplify/ui-react";
import { faker } from "@faker-js/faker";
import { RenderResult, act, fireEvent, render, screen } from "@testing-library/react";

import RouteBox from "./RouteBox";

const useAmplifyMap = () => ({});
jest.mock("hooks/useAmplifyMap", () => useAmplifyMap);

const useAwsPlaceReturnValue = {
	getPlaceDataByCoordinates: () => ({
		Results: [
			{
				Place: {
					Label: faker.random.words(3),
					Geometry: { Point: [Number(faker.address.longitude()), Number(faker.address.latitude())] }
				}
			}
		]
	}),
	search: (...args: any[]) => {
		const cb = args[3];

		cb([
			{
				PlaceId: faker.random.word(),
				Text: faker.random.word(),
				Distance: faker.datatype.number({ min: 1, max: 39 }),
				Relevance: faker.datatype.number(),
				Hash: faker.random.word(),
				Place: {
					Label: faker.random.words(3),
					Geometry: { Point: [Number(faker.address.longitude()), Number(faker.address.latitude())] }
				}
			}
		]);
	},
	getPlaceData: () => ({
		Place: {
			Geometry: { Point: [Number(faker.address.longitude()), Number(faker.address.latitude())] },
			AddressNumber: faker.random.word(),
			Country: faker.random.word(),
			Interpolated: faker.datatype.boolean(),
			Label: faker.random.word(),
			Municipality: faker.random.word(),
			Neighborhood: faker.random.word(),
			PostalCode: faker.random.word(),
			Region: faker.random.word(),
			Street: faker.random.word(),
			SubRegion: faker.random.word(),
			TimeZone: {
				Name: faker.random.word(),
				Offset: faker.datatype.number()
			},
			UnitNumber: faker.random.word(),
			UnitType: faker.random.word()
		}
	})
};
const useAwsPlace = () => useAwsPlaceReturnValue;
jest.mock("hooks/useAwsPlace", () => useAwsPlace);

const useAwsRouteServiceReturnValue = {
	calculateRoute: () => ({
		Legs: [
			{
				Distance: faker.datatype.number({ min: 1, max: 39 }),
				DurationSeconds: faker.datatype.number(),
				EndPosition: [Number(faker.address.longitude()), Number(faker.address.latitude())],
				StartPosition: [Number(faker.address.longitude()), Number(faker.address.latitude())],
				Steps: [
					{
						Distance: faker.datatype.number({ min: 1, max: 39 }),
						DurationSeconds: faker.datatype.number(),
						GeometryOffset: faker.datatype.number(),
						EndPosition: [Number(faker.address.longitude()), Number(faker.address.latitude())],
						StartPosition: [Number(faker.address.longitude()), Number(faker.address.latitude())]
					}
				],
				Geometry: {
					LineString: [...Array(faker.datatype.number({ min: 3, max: 12 }))].map(() => [
						Number(faker.address.longitude()),
						Number(faker.address.latitude())
					])
				}
			}
		],
		Summary: {
			DataSource: faker.datatype.string(),
			Distance: faker.datatype.number({ min: 1, max: 39 }),
			DurationSeconds: faker.datatype.number(),
			DistanceUnit: "Kilometers",
			RouteBBox: [...Array(4)].map(() => faker.datatype.number())
		}
	})
};
const servicesObj = { useAwsRouteService: () => useAwsRouteServiceReturnValue };
jest.mock("services", () => servicesObj);

const MarkerMock = ({ ...props }) => <View {...props} />;
jest.mock("react-map-gl", () => ({
	...jest.requireActual("react-map-gl"),
	Marker: MarkerMock,
	Source: MarkerMock,
	Layer: MarkerMock
}));

describe("<RouteBox />", () => {
	let routeCard: HTMLElement;
	let fromInput: HTMLElement;
	let toInput: HTMLElement;
	let fromSuggestions: HTMLElement | null;
	let toSuggestions: HTMLElement | null;
	let swapIconContainer: HTMLElement;
	let travelModeCarIconContainer: HTMLElement;
	let travelModeWalkingIconContainer: HTMLElement;
	let travelModeTruckIconContainer: HTMLElement;

	const selectLocation = async (fromOrTo: "from" | "to" | "both") => {
		if (["from", "both"].includes(fromOrTo)) {
			await act(async () => {
				fireEvent.change(fromInput, { target: { value: faker.random.word() } });
				fireEvent.focus(fromInput);
			});
			fromSuggestions = screen.queryByTestId("from-suggestions");

			await act(async () => fromSuggestions?.click());
		}

		if (["to", "both"].includes(fromOrTo)) {
			await act(async () => {
				fireEvent.change(toInput, { target: { value: faker.random.word() } });
				fireEvent.focus(toInput);
			});
			toSuggestions = screen.queryByTestId("to-suggestions");

			await act(async () => toSuggestions?.click());
		}
	};

	const renderComponent = async (props?: {}): Promise<RenderResult> => {
		const renderedComponent = render(
			<RouteBox
				mapRef={
					{
						getCenter: () => ({
							lng: Number(faker.address.longitude()),
							lat: Number(faker.address.latitude()),
							wrap: jest.fn(),
							toArray: jest.fn(),
							toString: jest.fn(),
							distanceTo: jest.fn(),
							toBounds: jest.fn()
						}),
						getStyle: () => ({ layers: [] } as any)
					} as any
				}
				setShowRouteBox={jest.fn()}
				isSideMenuExpanded={false}
				{...props}
			/>
		);

		routeCard = await screen.findByTestId("route-card");
		fromInput = screen.getByTestId("from-input");
		toInput = screen.getByTestId("to-input");
		fromSuggestions = screen.queryByTestId("from-suggestions");
		toSuggestions = screen.queryByTestId("to-suggestions");
		swapIconContainer = screen.getByTestId("swap-icon-container");
		travelModeCarIconContainer = screen.getByTestId("travel-mode-car-icon-container");
		travelModeWalkingIconContainer = screen.getByTestId("travel-mode-walking-icon-container");
		travelModeTruckIconContainer = screen.getByTestId("travel-mode-truck-icon-container");

		return renderedComponent;
	};

	afterAll(() => {
		jest.resetAllMocks();
	});

	it("should render successfully", async () => {
		await renderComponent();
		expect(routeCard).toBeInTheDocument();
	});

	it("should load relevant suggestions when the from/to input is focused", async () => {
		await renderComponent();

		await act(async () => {
			fireEvent.change(fromInput, { target: { value: faker.random.word() } });
			fireEvent.focus(fromInput);
		});
		fromSuggestions = screen.queryByTestId("from-suggestions");
		expect(fromSuggestions).toBeInTheDocument();

		await act(async () => {
			fireEvent.change(toInput, { target: { value: faker.random.word() } });
			fireEvent.focus(toInput);
		});
		toSuggestions = screen.queryByTestId("to-suggestions");
		expect(toSuggestions).toBeInTheDocument();
	});

	it("should route should render when both from and to locations are selected", async () => {
		await renderComponent();

		let startRouteLayer = screen.queryByTestId("start-route-layer");
		let endRouteLayer = screen.queryByTestId("end-route-layer");

		expect(startRouteLayer).not.toBeInTheDocument();
		expect(endRouteLayer).not.toBeInTheDocument();

		await selectLocation("both");

		startRouteLayer = screen.queryByTestId("start-route-layer");
		endRouteLayer = screen.queryByTestId("end-route-layer");

		expect(startRouteLayer).toBeInTheDocument();
		expect(endRouteLayer).toBeInTheDocument();
	});

	it("should switch to and from input values when the swap icon is clicked", async () => {
		await renderComponent();
		await selectLocation("both");

		// @ts-expect-error: ignoring error on `fromInput.value`
		const fromValue = fromInput.value;
		// @ts-expect-error: ignoring error on `fromInput.value`
		const toValue = toInput.value;

		await act(async () => swapIconContainer?.click());

		// the values should swap
		expect(fromInput).toHaveValue(toValue);
		expect(toInput).toHaveValue(fromValue);
	});

	it("should show route data when different travel modes are selected i.e. Car, Walking, Truck", async () => {
		await renderComponent();
		await selectLocation("both");

		for (const travelModeIconContainer of [
			travelModeCarIconContainer,
			travelModeWalkingIconContainer,
			travelModeTruckIconContainer
		]) {
			await act(async () => travelModeIconContainer.click());
			const routeDataContainer = screen.queryByTestId("route-data-container");
			const stepsContainer = screen.queryByTestId("steps-container");
			expect(routeDataContainer).toBeInTheDocument();
			expect(stepsContainer).toBeInTheDocument();
		}
	});
});
