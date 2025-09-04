import i18n from "@demo/locales/i18n";
import { render, waitFor } from "@testing-library/react";
import { I18nextProvider } from "react-i18next";

import FeedbackModal, { FeedbackModalProps } from "./FeedbackModal";

const mockProps: FeedbackModalProps = {
	open: true,
	onClose: vi.fn()
};

Object.defineProperty(window, "location", {
	writable: true,
	value: { reload: vi.fn() }
});

describe("<FeedbackModal />", () => {
	const windowOpen = vi.fn();
	window.open = windowOpen;

	const renderComponent = () =>
		render(
			<I18nextProvider i18n={i18n} defaultNS={"fr"}>
				<FeedbackModal {...mockProps} />
			</I18nextProvider>
		);

	beforeEach(() => {
		i18n.changeLanguage("en");
	});

	afterEach(() => {
		vi.clearAllMocks();
		windowOpen.mockClear();
	});

	it("should render correctly", () => {
		const { getByTestId } = renderComponent();

		waitFor(
			() => {
				expect(getByTestId("feedback-modal-container")).toBeInTheDocument();
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
