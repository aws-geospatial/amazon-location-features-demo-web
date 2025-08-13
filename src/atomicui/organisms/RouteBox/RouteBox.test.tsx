/* eslint-disable @typescript-eslint/no-explicit-any */
import { View } from "@aws-amplify/ui-react";
import i18n from "@demo/locales/i18n";
import { faker } from "@faker-js/faker";
import { RenderResult, act, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { I18nextProvider } from "react-i18next";
import { MapRef } from "react-map-gl/maplibre";

import RouteBox from "./RouteBox";

const usePlaceReturnValue = {
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
const usePlace = () => usePlaceReturnValue;
const useRouteServiceReturnValue = {
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
const servicesObj = { useRouteService: () => useRouteServiceReturnValue };
const MarkerMock = ({ ...props }) => <View {...props} />;

vi.mock("hooks/useMap", () => () => ({}));
vi.mock("hooks/usePlace", () => usePlace);
vi.mock("services", () => servicesObj);
vi.mock("react-map-gl/maplibre", async () => {
	const actual: any = await vi.importActual("react-map-gl/maplibre");
	const MarkerMock = ({ ...props }: any) => <View {...props} />;
	return {
		...actual,
		Marker: MarkerMock,
		Source: MarkerMock,
		Layer: MarkerMock
	};
});

describe("<RouteBox />", () => {
	let routeCard: HTMLElement;
	let fromInput: HTMLElement;
	let toInput: HTMLElement;
	let swapIconContainer: HTMLElement;
	let travelModeCarIconContainer: HTMLElement;
	let travelModeWalkingIconContainer: HTMLElement;
	let travelModeTruckIconContainer: HTMLElement;

	const renderComponent = async (props?: {}): Promise<RenderResult> => {
		const renderedComponent = render(
			<I18nextProvider i18n={i18n}>
				<RouteBox
					mapRef={{
						current: {
							getCenter: () => ({
								lng: Number(faker.address.longitude()),
								lat: Number(faker.address.latitude())
							}),
							getStyle: () => ({ layers: [] } as any)
						} as MapRef
					}}
					setShowRouteBox={vi.fn()}
					isSideMenuExpanded={false}
					{...props}
				/>
			</I18nextProvider>
		);

		routeCard = await screen.findByTestId("route-card");
		fromInput = screen.getByTestId("from-input");
		toInput = screen.getByTestId("to-input");
		swapIconContainer = screen.getByTestId("swap-icon-container");
		travelModeCarIconContainer = screen.getByTestId("travel-mode-car-icon-container");
		travelModeWalkingIconContainer = screen.getByTestId("travel-mode-walking-icon-container");
		travelModeTruckIconContainer = screen.getByTestId("travel-mode-truck-icon-container");

		return renderedComponent;
	};

	afterEach(() => {
		vi.clearAllTimers();
	});

	afterAll(() => {
		vi.resetAllMocks();
	});

	it("should render successfully", async () => {
		await renderComponent();

		waitFor(
			() => {
				expect(routeCard).toBeInTheDocument();
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
	});

	it("should load relevant suggestions when the from/to input is focused", async () => {
		const { getByTestId } = await renderComponent();

		waitFor(
			() => {
				fireEvent.change(fromInput, { target: { value: faker.random.word() } });
				fireEvent.focus(fromInput);
				expect(getByTestId("from-suggestions")).toBeInTheDocument();
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

		act(() => {
			fireEvent.change(toInput, { target: { value: faker.random.word() } });
			fireEvent.focus(toInput);
		});

		waitFor(
			() => {
				expect(getByTestId("to-suggestions")).toBeInTheDocument();
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
	});

	it("should render route when both from and to locations are selected", async () => {
		const { getByTestId } = await renderComponent();

		waitFor(
			() => {
				expect(getByTestId("start-route-layer")).not.toBeInTheDocument();
				expect(getByTestId("end-route-layer")).not.toBeInTheDocument();
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

		waitFor(
			() => {
				expect(getByTestId("start-route-layer")).toBeInTheDocument();
				expect(getByTestId("end-route-layer")).toBeInTheDocument();
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
	});

	it("should switch to and from input values when the swap icon is clicked", async () => {
		await renderComponent();

		// @ts-expect-error: ignoring error on `fromInput.value`
		const fromValue = fromInput.value;
		// @ts-expect-error: ignoring error on `fromInput.value`
		const toValue = toInput.value;

		act(() => {
			fireEvent.click(swapIconContainer);
		});

		waitFor(
			() => {
				expect(fromInput).toHaveValue(toValue);
				expect(toInput).toHaveValue(fromValue);
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
	});

	it("should show route data when different travel modes are selected i.e. Car, Walking, Truck", async () => {
		const { getByTestId } = await renderComponent();

		for (const travelModeIconContainer of [
			travelModeCarIconContainer,
			travelModeWalkingIconContainer,
			travelModeTruckIconContainer
		]) {
			act(() => travelModeIconContainer.click());

			waitFor(
				() => {
					expect(getByTestId("route-data-container")).toBeInTheDocument();
					expect(getByTestId("steps-container")).toBeInTheDocument();
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
});
