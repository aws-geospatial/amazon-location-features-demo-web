import i18n from "@demo/locales/i18n";
import { TravelMode } from "@demo/types";
import { faker } from "@faker-js/faker";
import { render, waitFor } from "@testing-library/react";
import { I18nextProvider } from "react-i18next";

import StepCard from "./StepCard";

const usePlace = () => ({
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
});

vi.mock("hooks", () => ({ usePlace, useMap: () => ({ mapUnit: "Metric" }) }));

describe("<StepCard/>", () => {
	let stepCardContainer: HTMLElement;
	let segmentIcon: HTMLElement | null;
	let destinationIcon: HTMLElement | null;

	const renderComponent = async (props: { travelMode?: TravelMode; isFirst: boolean; isLast: boolean }) => {
		const renderedComponent = render(
			<I18nextProvider i18n={i18n}>
				<StepCard
					step={{
						Instruction: faker.random.words(3),
						Distance: faker.datatype.number({ min: 100, max: 1000 }),
						Duration: faker.datatype.number({ min: 100, max: 1000 }),
						Type: "Arrive"
					}}
					travelMode={TravelMode.CAR}
					{...props}
				/>
			</I18nextProvider>
		);
		const { findByTestId, queryByTestId } = renderedComponent;

		stepCardContainer = await findByTestId("step-card-container");
		segmentIcon = queryByTestId("segment-icon");
		destinationIcon = queryByTestId("destination-icon");

		return renderedComponent;
	};

	afterAll(() => {
		vi.resetAllMocks();
	});

	it("should render successfully (stepCardContainer and icon)", async () => {
		const isFirst = faker.datatype.boolean();
		const isLast = faker.datatype.boolean();

		await renderComponent({ isFirst, isLast });

		expect(stepCardContainer).toBeInTheDocument();

		if (isLast && !isFirst) {
			waitFor(() => {
				expect(destinationIcon).toBeInTheDocument();
			});
		} else {
			segmentIcon && expect(segmentIcon).toBeInTheDocument();
		}
	});

	it.only("should render successfully when different isFirst and isLast prop is passed", async () => {
		let renderedComponent;

		// 0-0
		renderedComponent = await renderComponent({
			isFirst: false,
			isLast: false
		});
		expect(stepCardContainer).toBeInTheDocument();
		renderedComponent.unmount();

		// 0-1
		renderedComponent = await renderComponent({
			isFirst: false,
			isLast: true
		});
		expect(stepCardContainer).toBeInTheDocument();
		renderedComponent.unmount();

		// 1-0
		renderedComponent = await renderComponent({
			isFirst: true,
			isLast: false
		});
		expect(stepCardContainer).toBeInTheDocument();
		renderedComponent.unmount();

		// 1-1
		renderedComponent = await renderComponent({
			isFirst: true,
			isLast: true
		});
		expect(stepCardContainer).toBeInTheDocument();
		renderedComponent.unmount();
	});

	it("should render with different travel modes", async () => {
		const renderedComponent = await renderComponent({ travelMode: TravelMode.TRUCK, isFirst: false, isLast: false });
		expect(stepCardContainer).toBeInTheDocument();
		renderedComponent.unmount();

		await renderComponent({ travelMode: TravelMode.PEDESTRIAN, isFirst: false, isLast: false });
		expect(stepCardContainer).toBeInTheDocument();
	});
});
