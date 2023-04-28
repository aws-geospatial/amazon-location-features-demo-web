import { act, render, screen } from "@testing-library/react";

import ConfirmationModal from "./ConfirmationModal";

describe("<ConfirmationModal />", () => {
	const onClose = jest.fn();
	const onConfirm = jest.fn();

	it("should not render when open is false", () => {
		const { queryByTestId } = render(<ConfirmationModal open={false} onClose={onClose} onConfirm={onConfirm} />);
		expect(queryByTestId("confirmation-modal-container")).not.toBeInTheDocument();
	});

	it("should render successfully when description is of type string", () => {
		const { getByTestId } = render(<ConfirmationModal open={true} onClose={onClose} onConfirm={onConfirm} />);
		expect(getByTestId("confirmation-modal-container")).toBeInTheDocument();
	});

	it("should render successfully when description is of type node", () => {
		const { getByTestId } = render(
			<ConfirmationModal open={true} onClose={onClose} onConfirm={onConfirm} description={<></>} />
		);
		expect(getByTestId("confirmation-modal-container")).toBeInTheDocument();
	});

	it("should trigger confirmation button", () => {
		render(<ConfirmationModal open={true} onClose={onClose} onConfirm={onConfirm} />);
		const confirmButton = screen.getByTestId("confirmation-button");
		act(() => confirmButton.click());
		expect(onConfirm).toBeCalled();
	});
});
