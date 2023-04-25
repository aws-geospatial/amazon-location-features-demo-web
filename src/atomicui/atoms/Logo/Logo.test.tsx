import { render, screen } from "@testing-library/react";

import Logo from "./Logo";

describe("<Logo/>", () => {
	it("should render successfully", () => {
		render(<Logo />);
		const logoContainer = screen.getByTestId("logo-container");
		expect(logoContainer).toBeInTheDocument();
	});

	it("fires the on click function successfully", () => {
		const logoClickFunction = jest.fn();

		render(<Logo onClick={logoClickFunction} />);
		const logoContainer = screen.getByTestId("logo-container");
		expect(logoContainer).toBeInTheDocument();

		logoContainer.click();

		expect(logoClickFunction).toHaveBeenCalled();
	});
});
