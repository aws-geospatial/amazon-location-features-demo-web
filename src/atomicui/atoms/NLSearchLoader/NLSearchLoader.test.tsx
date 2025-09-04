import { render, screen } from "@testing-library/react";

import NLSearchLoader from "./NLSearchLoader";

const nlLoadText = [
	"nl_loader_sample_text_1",
	"nl_loader_sample_text_2",
	"nl_loader_sample_text_3",
	"nl_loader_sample_text_4",
	"nl_loader_sample_text_5"
];

describe("<NLLoader/>", () => {
	beforeEach(() => {
		vi.useFakeTimers();
		render(<NLSearchLoader nlLoadText={nlLoadText} />);
	});

	afterEach(() => {
		vi.useRealTimers();
	});

	it("should render successfully", () => {
		const loaderContainer = screen.getByTestId("nl-loader-container");
		expect(loaderContainer).toBeInTheDocument();
	});

	it("should display the loading circle", () => {
		const nlLoader = screen.getByTestId("nl-loader");
		expect(nlLoader).toBeInTheDocument();
	});

	it("should render a message from the nlLoadText array every 3.5 seconds", async () => {
		const message = screen.getByTestId("nl-loader-message");
		expect(message).toHaveTextContent("nl_loader_sample_text_1");

		await vi.advanceTimersByTimeAsync(3500);
		expect(message).toHaveTextContent("nl_loader_sample_text_2");
	});
});
