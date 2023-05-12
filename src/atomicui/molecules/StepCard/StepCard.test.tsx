import { TravelMode } from "@demo/types";
import { faker } from "@faker-js/faker";
import { RenderResult, render, screen } from "@testing-library/react";

import StepCard from "./StepCard";

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
	})
};

const useAwsPlace = () => useAwsPlaceReturnValue;
jest.mock("hooks", () => ({ useAwsPlace, useAmplifyMap: () => ({ mapUnit: "Metric" }) }));

describe("<StepCard/>", () => {
	let stepCardContainer: HTMLElement;
	let segmentIcon: HTMLElement | null;
	let destinationIcon: HTMLElement | null;

	const renderComponent = async (props: {
		travelMode?: TravelMode;
		isFirst: boolean;
		isLast: boolean;
	}): Promise<RenderResult> => {
		const renderedComponent = render(
			<StepCard
				step={{
					GeometryOffset: faker.datatype.number(),
					Distance: faker.datatype.number(),
					DurationSeconds: faker.datatype.number(),
					EndPosition: [Number(faker.address.longitude()), Number(faker.address.latitude())],
					StartPosition: [Number(faker.address.longitude()), Number(faker.address.latitude())]
				}}
				travelMode={TravelMode.CAR}
				{...props}
			/>
		);

		stepCardContainer = await screen.findByTestId("step-card-container");
		segmentIcon = screen.queryByTestId("segment-icon");
		destinationIcon = screen.queryByTestId("destination-icon");

		return renderedComponent;
	};

	afterAll(() => {
		jest.resetAllMocks();
	});

	it("should render successfully (stepCardContainer and icon)", async () => {
		const isFirst = faker.datatype.boolean();
		const isLast = faker.datatype.boolean();

		await renderComponent({ isFirst, isLast });

		expect(stepCardContainer).toBeInTheDocument();

		if (isLast && !isFirst) {
			expect(destinationIcon).toBeInTheDocument();
		} else {
			expect(segmentIcon).toBeInTheDocument();
		}
	});

	it("should render successfully when different isFirst and isLast prop is passed", async () => {
		// 0-0
		await renderComponent({
			isFirst: false,
			isLast: false
		});
		expect(stepCardContainer).toBeInTheDocument();

		// 0-1
		await renderComponent({
			isFirst: false,
			isLast: true
		});
		expect(stepCardContainer).toBeInTheDocument();

		// 1-0
		await renderComponent({
			isFirst: true,
			isLast: false
		});
		expect(stepCardContainer).toBeInTheDocument();

		// 1-1
		await renderComponent({
			isFirst: true,
			isLast: true
		});
		expect(stepCardContainer).toBeInTheDocument();
	});

	it("should render with different travel modes", async () => {
		const renderedComponent = await renderComponent({ travelMode: TravelMode.TRUCK, isFirst: false, isLast: false });
		expect(stepCardContainer).toBeInTheDocument();
		renderedComponent.unmount();

		await renderComponent({ travelMode: TravelMode.WALKING, isFirst: false, isLast: false });
		expect(stepCardContainer).toBeInTheDocument();
	});
});
