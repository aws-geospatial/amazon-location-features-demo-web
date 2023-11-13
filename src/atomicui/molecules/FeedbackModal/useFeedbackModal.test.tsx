import i18n from "@demo/locales/i18n";
import { render } from "@testing-library/react";
import { I18nextProvider } from "react-i18next";

import FeedbackModal, { FeedbackModalProps } from "./FeedbackModal";

const mockProps: FeedbackModalProps = {
	open: true,
	onClose: jest.fn()
};

Object.defineProperty(window, "location", {
	writable: true,
	value: { reload: jest.fn() }
});


describe("<FeedbackModal />", () => {
    const windowOpen = jest.fn();
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
		jest.clearAllMocks();
		windowOpen.mockClear();
	});

    it("should render correctly", () => {
		const { getByTestId } = renderComponent();
		expect(getByTestId("feedback-modal-container")).toBeInTheDocument();
	});

});
