import i18n from "@demo/locales/i18n";
import { fireEvent, render } from "@testing-library/react";
import { I18nextProvider } from "react-i18next";

import OpenDataConfirmationModal from "./OpenDataConfirmationModal";

describe("OpenDataConfirmationModal", () => {
	const props = {
		open: true,
		onClose: jest.fn(),
		onConfirm: jest.fn(),
		isUnauthSimulationOpen: false
	};

	const renderComponent = () => {
		return render(
			<I18nextProvider i18n={i18n}>
				<OpenDataConfirmationModal {...props} />
			</I18nextProvider>
		);
	};

	it("renders OpenDataConfirmationModal with expected content", () => {
		const { getByTestId } = renderComponent();
		expect(getByTestId("confirmation-modal-container")).toBeInTheDocument();
	});

	it("triggers onClose when Cancel button is clicked", () => {
		const { getByText } = renderComponent();
		fireEvent.click(getByText("Cancel"));
		expect(props.onClose).toHaveBeenCalled();
	});

	it("triggers onConfirm when Enable Open button is clicked", () => {
		const { getByTestId } = renderComponent();
		fireEvent.click(getByTestId("confirmation-button"));
		expect(props.onConfirm).toHaveBeenCalled();
	});
});
