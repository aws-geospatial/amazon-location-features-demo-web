import i18n from "@demo/locales/i18n";
import { render } from "@testing-library/react";
import { I18nextProvider } from "react-i18next";

import WelcomeModal from "./WelcomeModal";

const onClose = jest.fn();

describe("<WelcomeModal />", () => {
	it("should render successfully", () => {
		const { getByTestId } = render(
			<I18nextProvider i18n={i18n}>
				<WelcomeModal open={true} onClose={onClose} />
			</I18nextProvider>
		);
		expect(getByTestId("welcome-modal")).toBeInTheDocument();
	});
});
