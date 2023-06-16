import React from "react";

import { fireEvent, render } from "@testing-library/react";

import GrabConfirmationModal from "./GrabConfirmationModal";

const defaultProps = {
	open: true,
	onClose: jest.fn(),
	onConfirm: jest.fn()
};

describe("GrabConfirmationModal", () => {
	it("renders GrabConfirmationModal with expected content", () => {
		const { getByTestId } = render(<GrabConfirmationModal {...defaultProps} />);
		expect(getByTestId("confirmation-modal-container")).toBeInTheDocument();
	});

	it("triggers onClose when Cancel button is clicked", () => {
		const { getByText } = render(<GrabConfirmationModal {...defaultProps} />);
		fireEvent.click(getByText("Cancel"));
		expect(defaultProps.onClose).toHaveBeenCalled();
	});

	it("triggers onConfirm when Enable Grab button is clicked", () => {
		const { getByTestId } = render(<GrabConfirmationModal {...defaultProps} />);
		fireEvent.click(getByTestId("confirmation-button"));
		expect(defaultProps.onConfirm).toHaveBeenCalled();
	});

	// it("opens external link when Learn more is clicked", () => {
	// 	window.open = jest.fn();
	// 	const { getByText } = render(<GrabConfirmationModal {...defaultProps} />);
	// 	fireEvent.click(getByText("Learn more"));
	// 	expect(window.open).toHaveBeenCalledWith(expect.stringContaining("https://"), "_blank");
	// });
});
