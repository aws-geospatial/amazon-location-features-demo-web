import { fireEvent, render } from "@testing-library/react";

import AboutModal from "./AboutModal";

const windowOpen = jest.fn();
window.open = windowOpen;

describe("<AboutModal />", () => {
	it("should render successfully", () => {
		const { getByTestId } = render(<AboutModal open={true} onClose={jest.fn()} />);
		expect(getByTestId("about-modal-container")).toBeInTheDocument();
	});

	it("should render fire Learn More button", () => {
		const { getByTestId } = render(<AboutModal open={true} onClose={jest.fn()} />);
		fireEvent.click(getByTestId("learn-more-button-partner-attribution"));
		expect(windowOpen).toHaveBeenCalledTimes(1);
	});

	it("should render About details", () => {
		const { getByText, getByTestId } = render(<AboutModal open={true} onClose={jest.fn()} />);
		fireEvent.click(getByText("Version"));
		expect(getByTestId("details-heading")).toHaveTextContent("Version");
	});
});
