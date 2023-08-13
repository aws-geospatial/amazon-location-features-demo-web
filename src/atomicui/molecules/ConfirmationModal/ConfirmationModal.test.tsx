import i18n from "@demo/locales/i18n";
import { act, render } from "@testing-library/react";
import { I18nextProvider } from "react-i18next";

import ConfirmationModal from "./ConfirmationModal";

describe("<ConfirmationModal />", () => {
	const props: {
		open: boolean;
		onClose: () => void;
		onConfirm: () => void;
		description: string | React.ReactNode;
		showLearnMore: boolean;
		handleLearnMore: () => {};
	} = {
		open: false,
		onClose: jest.fn(),
		onConfirm: jest.fn(),
		description: "description",
		showLearnMore: true,
		handleLearnMore: jest.fn()
	};

	const renderComponent = () => {
		return render(
			<I18nextProvider i18n={i18n}>
				<ConfirmationModal {...props} />
			</I18nextProvider>
		);
	};

	it("should not render when open is false", () => {
		const { queryByTestId } = renderComponent();
		expect(queryByTestId("confirmation-modal-container")).not.toBeInTheDocument();
	});

	it("should render successfully when description is of type string", () => {
		props.open = true;
		const { getByTestId } = renderComponent();
		expect(getByTestId("confirmation-modal-container")).toBeInTheDocument();
	});

	it("should render successfully when description is of type node", () => {
		props.description = <div>description</div>;
		const { getByTestId } = renderComponent();
		expect(getByTestId("confirmation-modal-container")).toBeInTheDocument();
	});

	it("should trigger confirmation button", () => {
		const { getByTestId } = renderComponent();
		const confirmButton = getByTestId("confirmation-button");
		act(() => confirmButton.click());
		expect(props.onConfirm).toBeCalled();
	});

	it("should render with learn more button", () => {
		const { getByTestId } = renderComponent();
		const learnMoreButton = getByTestId("confirmation-learn-more-button");
		act(() => learnMoreButton.click());
		expect(props.handleLearnMore).toBeCalled();
	});
});
