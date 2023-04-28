import { RenderResult, act, render, screen } from "@testing-library/react";

import Modal from "./Modal";

describe("<Modal/>", () => {
	let modalContainer: HTMLElement | null;
	let modalContent: HTMLElement | null;
	let modalCloseIconContainer: HTMLElement | null;

	let isOpen = true;

	const onClose = () => {
		isOpen = false;
	};

	afterEach(() => {
		// revert parameters
		isOpen = true;
	});

	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	const renderComponent = (props?: any): RenderResult => {
		const renderedComponent = render(
			<Modal content={<div data-testid="modal-content" />} open={isOpen} onClose={onClose} {...props} />
		);
		modalContainer = screen.queryByTestId("modal-container");
		modalContent = screen.queryByTestId("modal-content");
		modalCloseIconContainer = screen.queryByTestId("modal-close-icon-container");
		return renderedComponent;
	};

	it("should render successfully", () => {
		renderComponent();
		expect(modalContainer).toBeInTheDocument();
		expect(modalContent).toBeInTheDocument();
	});

	it("should trigger close function(and close modal) if clicked out of modal content or close icon", () => {
		// clicking close icon
		let renderedComponent = renderComponent();
		expect(modalContent).toBeInTheDocument();
		act(() => modalCloseIconContainer!.click());
		expect(isOpen).toBeFalsy();
		renderedComponent.unmount();
		// re-render
		renderedComponent = renderComponent();
		expect(modalContent).toBeNull();
		renderedComponent.unmount();

		// clicking outside of content
		isOpen = true;
		renderedComponent = renderComponent();
		act(() => modalContainer!.click());
		expect(isOpen).toBeFalsy();
		renderedComponent.unmount();
		// re-render
		renderComponent();
		expect(modalContent).toBeNull();
	});

	it("should add `disabled` class for close button if `hideCloseIcon` prop is passed", () => {
		renderComponent({ hideCloseIcon: true });
		expect(modalCloseIconContainer?.className).toContain("disabled");
	});
});
