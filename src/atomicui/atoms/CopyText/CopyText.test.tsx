import { faker } from "@faker-js/faker";
import { act, render, screen } from "@testing-library/react";
import "@testing-library/jest-dom";

import CopyText from "./CopyText";

describe("<CopyText/>", () => {
	let copyTextContainer: HTMLElement;
	let copyIcon: HTMLElement;

	beforeEach(() => {
		render(<CopyText text={faker.random.words()} />);

		copyTextContainer = screen.getByTestId("copy-text-container");
		copyIcon = screen.getByTestId("copy-icon");

		jest.useFakeTimers();
	});

	afterEach(() => {
		jest.useRealTimers();
	});

	it("should render successfully", () => {
		// main component container should show
		expect(copyTextContainer).toBeInTheDocument();

		// default icon should show
		expect(copyIcon).toBeInTheDocument();
	});

	it("should change the icon to copied-icon after user click", () => {
		// default(copy-icon) icon should show
		expect(copyIcon).toBeInTheDocument();

		act(() => copyTextContainer.click());

		const copiedIcon = screen.getByTestId("copied-icon");
		// icon changed to copied-icon after click
		expect(copiedIcon).toBeInTheDocument();
	});

	it("should revert back to the default state after 2.5 seconds of the click", () => {
		// default(copy-icon) icon should show
		expect(copyIcon).toBeInTheDocument();

		act(() => copyTextContainer.click());

		// icon changed after click
		const copiedIcon = screen.getByTestId("copied-icon");
		expect(copiedIcon).toBeInTheDocument();
		act(jest.runAllTimers);

		// icon restored to default after 2.5 seconds
		copyIcon = screen.getByTestId("copy-icon");
		expect(copyIcon).toBeInTheDocument();
	});
});
