import i18n from "@demo/locales/i18n";
import { act, fireEvent, render, waitFor } from "@testing-library/react";
import { I18nextProvider } from "react-i18next";

import ExploreButton from "./ExploreButton";

const mockProps = {
	text: "text",
	icon: <div />,
	onClick: jest.fn()
};

describe("<ExploreButton />", () => {
	const renderComponent = () =>
		render(
			<I18nextProvider i18n={i18n}>
				<ExploreButton {...mockProps} />
			</I18nextProvider>
		);

	it("should render and fire onClick when clicked", () => {
		const { getByTestId } = renderComponent();
		expect(getByTestId("explore-button-container")).toBeInTheDocument();
		act(() => {
			fireEvent.click(getByTestId("explore-button-container"));
		});
		waitFor(() => {
			expect(mockProps.onClick).toHaveBeenCalled();
		});
	});
});
