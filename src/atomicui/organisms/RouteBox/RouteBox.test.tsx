/* eslint-disable @typescript-eslint/no-explicit-any */
import { View } from "@aws-amplify/ui-react";
import { faker } from "@faker-js/faker";
import { RenderResult, act, fireEvent, render, screen, waitFor } from "@testing-library/react";

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
	}),
	routePositions: {
		from: [-73.98566999999997, 40.74843000000004],
		to: [-73.98610999999994, 40.73750000000007]
	},
	routeData: {
		Legs: [
			{
				Distance: 1.595229432932655,
				DurationSeconds: 471.636380781,
				EndPosition: [-73.98617658952028, 40.73754858276029],
				Geometry: {
					LineString: [
						[-73.98581315061287, 40.74809055712277],
						[-73.98581317047518, 40.748090575722],
						[-73.98803994922879, 40.74902998562649],
						[-73.98825997753065, 40.749130007887736],
						[-73.9888099793757, 40.74935999362449],
						[-73.98933996298659, 40.74957998747155],
						[-73.98966997098458, 40.74972001174633],
						[-73.99051997070377, 40.75007999541338],
						[-73.99109998267268, 40.75032000749461],
						[-73.9910999595011, 40.7503200046694],
						[-73.99153995515421, 40.749689987401034],
						[-73.99177997157705, 40.74936000788891],
						[-73.99198997733316, 40.749079988728944],
						[-73.99243996505669, 40.74845999798642],
						[-73.98961996159323, 40.74728999544982],
						[-73.98844995905662, 40.746790012918716],
						[-73.98638997314339, 40.745920013682934],
						[-73.98638995484174, 40.745920006328475],
						[-73.98684998203751, 40.74530001011908],
						[-73.98729994872241, 40.74468001390969],
						[-73.9877499498611, 40.744059983246494],
						[-73.98802995592911, 40.74367999223825],
						[-73.9881999509998, 40.7434399870371],
						[-73.98897995067662, 40.742319997218885],
						[-73.9889799642479, 40.74231999127904],
						[-73.98893996330526, 40.74202999305823],
						[-73.98904997451103, 40.741629983631654],
						[-73.98911995032027, 40.74135001148692],
						[-73.98883997817553, 40.741230008658945],
						[-73.98804995094459, 40.74088998341942],
						[-73.98758995733095, 40.7407000047822],
						[-73.98731997680841, 40.74058999357642],
						[-73.98699996926715, 40.74045000750405],
						[-73.9867399803668, 40.740339996298275],
						[-73.98639995512728, 40.740200010225905],
						[-73.98639996042012, 40.740199998332464],
						[-73.98687996303305, 40.7395400119663],
						[-73.98732995686936, 40.73891999136464],
						[-73.98777995070567, 40.73834000543397],
						[-73.98766997594682, 40.7382900137751],
						[-73.9868399628153, 40.73794000325652],
						[-73.98610996745478, 40.737639984396814],
						[-73.98610995838793, 40.73763998523917],
						[-73.98617658952028, 40.73754858276029]
					]
				},
				StartPosition: [-73.98581315061287, 40.74809055712277],
				Steps: [
					{
						Distance: 0.31719437868072553,
						DurationSeconds: 130.824568517,
						EndPosition: [-73.99109998267268, 40.75032000749461],
						GeometryOffset: 1,
						StartPosition: [-73.98581317047518, 40.748090575722]
					},
					{
						Distance: 0.14607001623461915,
						DurationSeconds: 37.560953442,
						EndPosition: [-73.99243996505669, 40.74845999798642],
						GeometryOffset: 9,
						StartPosition: [-73.9910999595011, 40.7503200046694]
					},
					{
						Distance: 0.3627572907397461,
						DurationSeconds: 83.073988119,
						EndPosition: [-73.98638997314339, 40.745920013682934],
						GeometryOffset: 14,
						StartPosition: [-73.98961996159323, 40.74728999544982]
					},
					{
						Distance: 0.2828482879599609,
						DurationSeconds: 78.326757196,
						EndPosition: [-73.98897995067662, 40.742319997218885],
						GeometryOffset: 17,
						StartPosition: [-73.98638995484174, 40.745920006328475]
					},
					{
						Distance: 0.06825639665539551,
						DurationSeconds: 17.616699218,
						EndPosition: [-73.98911995032027, 40.74135001148692],
						GeometryOffset: 24,
						StartPosition: [-73.9889799642479, 40.74231999127904]
					},
					{
						Distance: 0.16332611318041992,
						DurationSeconds: 45.228882632,
						EndPosition: [-73.98639995512728, 40.740200010225905],
						GeometryOffset: 28,
						StartPosition: [-73.98883997817553, 40.741230008658945]
					},
					{
						Distance: 0.14743533379516602,
						DurationSeconds: 40.828348132,
						EndPosition: [-73.98777995070567, 40.73834000543397],
						GeometryOffset: 35,
						StartPosition: [-73.98639996042012, 40.740199998332464]
					},
					{
						Distance: 0.10012565811642456,
						DurationSeconds: 34.912353515,
						EndPosition: [-73.98610996745478, 40.737639984396814],
						GeometryOffset: 39,
						StartPosition: [-73.98766997594682, 40.7382900137751]
					},
					{
						Distance: 0.007215957570197435,
						DurationSeconds: 3.26383001,
						EndPosition: [-73.98617658952028, 40.73754858276029],
						GeometryOffset: 42,
						StartPosition: [-73.98610995838793, 40.73763998523917]
					}
				]
			}
		],
		Summary: {
			DataSource: "Esri",
			Distance: 1.595229432932655,
			DistanceUnit: "Miles",
			DurationSeconds: 471.636380781,
			RouteBBox: [-73.99243996505669, 40.73754858276029, -73.98581315061287, 40.75032000749461]
		},
		travelMode: "Car"
	}
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
			await waitFor(() => {
				fromSuggestions = screen.queryByTestId("from-suggestions");
			});

			await act(async () => fromSuggestions?.click());
		}

		if (["to", "both"].includes(fromOrTo)) {
			await act(async () => {
				fireEvent.change(toInput, { target: { value: faker.random.word() } });
				fireEvent.focus(toInput);
			});
			await waitFor(() => {
				toSuggestions = screen.queryByTestId("to-suggestions");
			});

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

		await waitFor(() => {
			fromSuggestions = screen.queryByTestId("from-suggestions");
			expect(fromSuggestions).toBeInTheDocument();
		});

		await act(async () => {
			fireEvent.change(toInput, { target: { value: faker.random.word() } });
			fireEvent.focus(toInput);
		});
		await waitFor(() => {
			toSuggestions = screen.queryByTestId("to-suggestions");
			expect(toSuggestions).toBeInTheDocument();
		});
	});

	it("should render route when both from and to locations are selected", async () => {
		await renderComponent();

		let startRouteLayer = screen.queryByTestId("start-route-layer");
		let endRouteLayer = screen.queryByTestId("end-route-layer");

		expect(startRouteLayer).not.toBeInTheDocument();
		expect(endRouteLayer).not.toBeInTheDocument();

		await selectLocation("both");

		await waitFor(
			() => {
				startRouteLayer = screen.queryByTestId("start-route-layer");
				endRouteLayer = screen.queryByTestId("end-route-layer");
				expect(startRouteLayer).toBeInTheDocument();
				expect(endRouteLayer).toBeInTheDocument();
			},
			{ timeout: 5000 }
		);
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

			await waitFor(
				() => {
					expect(routeDataContainer).toBeInTheDocument();
					expect(stepsContainer).toBeInTheDocument();
				},
				{ timeout: 200 }
			);
		}
	});
});
