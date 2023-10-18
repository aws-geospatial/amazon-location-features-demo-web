import i18n from "@demo/locales/i18n";
import { fireEvent, render } from "@testing-library/react";
import { I18nextProvider } from "react-i18next";

import GrabConfirmationModal from "./GrabConfirmationModal";

const mockProps = {
	open: true,
	onClose: jest.fn(),
	onConfirm: jest.fn()
};

describe("GrabConfirmationModal", () => {
	const renderComponent = () => {
		return render(
			<I18nextProvider i18n={i18n}>
				<GrabConfirmationModal {...mockProps} />
			</I18nextProvider>
		);
	};

	it("renders GrabConfirmationModal with expected content", () => {
		const { getByTestId } = renderComponent();
		expect(getByTestId("confirmation-modal-container")).toBeInTheDocument();
	});

	it("triggers onClose when Cancel button is clicked", () => {
		const { getByText } = renderComponent();
		fireEvent.click(getByText("Cancel"));
		expect(mockProps.onClose).toHaveBeenCalled();
	});

	it("triggers onConfirm when Enable Grab button is clicked", () => {
		const { getByTestId } = renderComponent();
		fireEvent.click(getByTestId("confirmation-button"));
		expect(mockProps.onConfirm).toHaveBeenCalled();
	});
});
