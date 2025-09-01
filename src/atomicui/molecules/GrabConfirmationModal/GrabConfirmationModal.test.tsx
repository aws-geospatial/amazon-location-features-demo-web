import i18n from "@demo/locales/i18n";
import { fireEvent, render, waitFor } from "@testing-library/react";
import { I18nextProvider } from "react-i18next";

import GrabConfirmationModal from "./GrabConfirmationModal";

const mockProps = {
	open: true,
	onClose: vi.fn(),
	onConfirm: vi.fn()
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

		waitFor(
			() => {
				expect(getByTestId("confirmation-modal-container")).toBeInTheDocument();
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

	it("triggers onClose when Cancel button is clicked", () => {
		const { getByText } = renderComponent();

		waitFor(
			() => {
				fireEvent.click(getByText("Cancel"));
				expect(mockProps.onClose).toHaveBeenCalled();
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

	it("triggers onConfirm when Enable Grab button is clicked", () => {
		const { getByTestId } = renderComponent();

		waitFor(
			() => {
				fireEvent.click(getByTestId("confirmation-button"));
				expect(mockProps.onConfirm).toHaveBeenCalled();
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
