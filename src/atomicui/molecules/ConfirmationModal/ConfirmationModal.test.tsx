import i18n from "@demo/locales/i18n";
import { fireEvent, render } from "@testing-library/react";
import { I18nextProvider } from "react-i18next";

import ConfirmationModal, { ConfirmationModalProps } from "./ConfirmationModal";

const defaultConfirmationModalProps = {
	className: "",
	open: true,
	onClose: jest.fn(),
	heading: "heading",
	description: "description",
	onConfirm: jest.fn(),
	confirmationText: "confirmationText",
	showLearnMore: false,
	handleLearnMore: jest.fn(),
	hideCancelButton: false,
	cancelationText: "cancelationText",
	showConfirmationCheckbox: false,
	confirmationCheckboxLabel: "confirmationCheckboxLabel",
	confirmationCheckboxValue: "confirmationCheckboxValue",
	confirmationCheckboxName: "confirmationCheckboxName",
	confirmationCheckboxOnChange: jest.fn()
};

describe("<ConfirmationModal />", () => {
	const props: ConfirmationModalProps = {
		...defaultConfirmationModalProps
	};
	const renderComponent = () => {
		return render(
			<I18nextProvider i18n={i18n}>
				<ConfirmationModal {...props} />
			</I18nextProvider>
		);
	};

	beforeEach(() => {
		props.className = defaultConfirmationModalProps.className;
		props.open = defaultConfirmationModalProps.open;
		props.onClose = defaultConfirmationModalProps.onClose;
		props.heading = defaultConfirmationModalProps.heading;
		props.description = defaultConfirmationModalProps.description;
		props.onConfirm = defaultConfirmationModalProps.onConfirm;
		props.confirmationText = defaultConfirmationModalProps.confirmationText;
		props.showLearnMore = defaultConfirmationModalProps.showLearnMore;
		props.handleLearnMore = defaultConfirmationModalProps.handleLearnMore;
		props.hideCancelButton = defaultConfirmationModalProps.hideCancelButton;
		props.cancelationText = defaultConfirmationModalProps.cancelationText;
		props.showConfirmationCheckbox = defaultConfirmationModalProps.showConfirmationCheckbox;
		props.confirmationCheckboxLabel = defaultConfirmationModalProps.confirmationCheckboxLabel;
		props.confirmationCheckboxValue = defaultConfirmationModalProps.confirmationCheckboxValue;
		props.confirmationCheckboxName = defaultConfirmationModalProps.confirmationCheckboxName;
		props.confirmationCheckboxOnChange = defaultConfirmationModalProps.confirmationCheckboxOnChange;
	});

	it("should render without crashing", () => {
		const { getByTestId } = renderComponent();
		expect(getByTestId("confirmation-modal-container")).toBeInTheDocument();
	});

	it("should render successfully when description is of type string", () => {
		const { getByTestId } = renderComponent();
		expect(getByTestId("confirmation-content")).toHaveTextContent(props.description as string);
	});

	it("should render successfully when description is of type node", () => {
		props.description = <div>description node</div>;
		const { getByTestId } = renderComponent();
		expect(getByTestId("confirmation-content")).toHaveTextContent("description node");
	});

	it("should trigger confirmation button", () => {
		const { getByTestId } = renderComponent();
		fireEvent.click(getByTestId("confirmation-button"));
		expect(props.onConfirm).toBeCalled();
	});

	it("should render with learn more button", () => {
		props.showLearnMore = true;
		const { getByTestId } = renderComponent();
		expect(getByTestId("confirmation-learn-more-button")).toBeInTheDocument();
		fireEvent.click(getByTestId("confirmation-learn-more-button"));
		expect(props.handleLearnMore).toBeCalled();
	});

	it("should render with confirmation checkbox", () => {
		props.showConfirmationCheckbox = true;
		const { getByTestId } = renderComponent();
		expect(getByTestId("confirmation-checkbox")).toBeInTheDocument();
		fireEvent.click(getByTestId("confirmation-checkbox"));
		expect(props.confirmationCheckboxOnChange).toBeCalled();
	});
});
