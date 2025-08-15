import i18n from "@demo/locales/i18n";
import { render, waitFor } from "@testing-library/react";
import { I18nextProvider } from "react-i18next";

import WelcomeModal from "./WelcomeModal";

const onClose = vi.fn();

describe("<WelcomeModal />", () => {
	it("should render successfully", () => {
		const { getByTestId } = render(
			<I18nextProvider i18n={i18n}>
				<WelcomeModal open={true} onClose={onClose} />
			</I18nextProvider>
		);

		waitFor(
			() => {
				expect(getByTestId("welcome-modal")).toBeInTheDocument();
			},
			{
				timeout: 10000,
				interval: 1000,
				onTimeout: e => {
					console.error({ e });
					return e;
				}
			}
		);
	});
});
