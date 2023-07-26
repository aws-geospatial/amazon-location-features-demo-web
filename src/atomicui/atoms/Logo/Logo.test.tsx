import i18n from "@demo/locales/i18n";
import { render, screen } from "@testing-library/react";
import { I18nextProvider } from "react-i18next";

import Logo from "./Logo";

describe("<Logo/>", () => {
	const onClick = jest.fn();
	const renderComponent = () => {
		render(
			<I18nextProvider i18n={i18n}>
				<Logo onClick={onClick} />
			</I18nextProvider>
		);
	};

	it("should render successfully", () => {
		renderComponent();
		const logoContainer = screen.getByTestId("logo-container");
		expect(logoContainer).toBeInTheDocument();
	});

	it("fires the on click function successfully", () => {
		renderComponent();
		const logoContainer = screen.getByTestId("logo-container");
		expect(logoContainer).toBeInTheDocument();
		logoContainer.click();
		expect(onClick).toHaveBeenCalled();
	});
});
