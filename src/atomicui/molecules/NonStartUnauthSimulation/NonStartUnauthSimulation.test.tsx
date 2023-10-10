import i18n from "@demo/locales/i18n";
import { MenuItemEnum } from "@demo/types";
import { faker } from "@faker-js/faker";
import { act, fireEvent, render, waitFor } from "@testing-library/react";
import { I18nextProvider } from "react-i18next";

import NonStartUnauthSimulation, { NonStartUnauthSimulationProps } from "./NonStartUnauthSimulation";

const mockProps: NonStartUnauthSimulationProps = {
	unauthSimulationCtaText: faker.random.word(),
	handleClose: jest.fn(),
	handleCta: jest.fn(),
	handleEnableLive: jest.fn(),
	from: MenuItemEnum.GEOFENCE,
	startRef: {} as React.RefObject<HTMLDivElement>
};

describe("<NonStartUnauthSimulation />", () => {
	const renderComponent = () => {
		return render(
			<I18nextProvider i18n={i18n}>
				<NonStartUnauthSimulation {...mockProps} />
			</I18nextProvider>
		);
	};

	it("should render correctly", () => {
		const { getByTestId } = renderComponent();
		expect(getByTestId("unauth-simulation-card")).toBeInTheDocument();
		expect(getByTestId("unauth-simulation-card-header-close")).toBeInTheDocument();
		expect(getByTestId("unauth-simulation-cta")).toBeInTheDocument();
		expect(getByTestId("unauth-simulation-enable-live")).toBeInTheDocument();
	});

	it("should call exact functions when clicked", () => {
		const { getByTestId } = renderComponent();
		act(() => {
			fireEvent.click(getByTestId("unauth-simulation-card-header-close"));
		});
		waitFor(() => {
			expect(mockProps.handleClose).toBeCalled();
		});
		act(() => {
			fireEvent.click(getByTestId("unauth-simulation-cta"));
		});
		waitFor(() => {
			expect(mockProps.handleCta).toBeCalled();
		});
		act(() => {
			fireEvent.click(getByTestId("unauth-simulation-enable-live"));
		});
		waitFor(() => {
			expect(mockProps.handleEnableLive).toBeCalled();
		});
	});
});
