import i18n from "@demo/locales/i18n";
import { fireEvent, render, screen } from "@testing-library/react";
import { I18nextProvider } from "react-i18next";

import AboutModal from "./AboutModal";

describe("<AboutModal />", () => {
	const windowOpen = vi.fn();
	window.open = windowOpen;

	const props = {
		open: true,
		onClose: vi.fn()
	};

	const renderComponent = () => {
		return render(
			<I18nextProvider i18n={i18n}>
				<AboutModal {...props} />
			</I18nextProvider>
		);
	};

	it("should render successfully", async () => {
		renderComponent();
		expect(await screen.findByTestId("about-modal-container")).toBeInTheDocument();
	});

	it("should fire Learn More button when clicked", async () => {
		renderComponent();
		fireEvent.click(await screen.findByTestId("learn-more-button-partner-attribution"));
		expect(windowOpen).toHaveBeenCalledTimes(1);
		fireEvent.click(await screen.findByTestId("learn-more-button-software-attribution"));
		expect(windowOpen).toHaveBeenCalledTimes(2);
	});

	it("should render About details when an option is clicked", async () => {
		renderComponent();
		fireEvent.click(await screen.findByText("Version"));
		expect(await screen.findByTestId("details-heading")).toHaveTextContent("Version");
	});
});
