import i18n from "@demo/locales/i18n";
import { fireEvent, render } from "@testing-library/react";
import { I18nextProvider } from "react-i18next";

import AboutModal from "./AboutModal";

describe("<AboutModal />", () => {
	const windowOpen = jest.fn();
	window.open = windowOpen;
	const props = {
		open: true,
		onClose: jest.fn()
	};

	const renderComponent = () => {
		return render(
			<I18nextProvider i18n={i18n}>
				<AboutModal {...props} />
			</I18nextProvider>
		);
	};

	it("should render successfully", () => {
		const { getByTestId } = renderComponent();
		expect(getByTestId("about-modal-container")).toBeInTheDocument();
	});

	it("should render fire Learn More button", () => {
		const { getByTestId } = renderComponent();
		fireEvent.click(getByTestId("learn-more-button-partner-attribution"));
		expect(windowOpen).toHaveBeenCalledTimes(1);
		fireEvent.click(getByTestId("learn-more-button-software-attribution"));
		expect(windowOpen).toHaveBeenCalledTimes(2);
	});

	it("should render About details", () => {
		const { getByText, getByTestId } = renderComponent();
		fireEvent.click(getByText("Version"));
		expect(getByTestId("details-heading")).toHaveTextContent("Version");
	});
});
