import { RenderResult, act, render, screen } from "@testing-library/react";

import SignInModal from "./SignInModal";

const useAmplifyAuthReturnValue = {
	onLogin: jest.fn()
};

const useAmplifyAuth = () => useAmplifyAuthReturnValue;

jest.mock("hooks", () => ({
	useAmplifyAuth
}));

describe("<SignInModal/>", () => {
	let signInModalContainer: HTMLElement;
	let signInButton: HTMLElement;
	let maybeLaterButton: HTMLElement;

	const onClose = jest.fn();

	const renderComponent = (): RenderResult => {
		const renderedComponent = render(<SignInModal open onClose={onClose} />);

		signInModalContainer = screen.getByTestId("sign-in-modal");
		signInButton = screen.getByTestId("sign-in-button");
		maybeLaterButton = screen.getByTestId("maybe-later-button");

		return renderedComponent;
	};

	afterAll(() => {
		jest.resetAllMocks();
	});

	it("should render successfully", () => {
		renderComponent();
		expect(signInModalContainer).toBeInTheDocument();
	});

	it("should call `onLogin` when `sign in` button is clicked", () => {
		renderComponent();
		act(() => signInButton.click());
		expect(useAmplifyAuthReturnValue.onLogin).toBeCalled();
	});

	it("should call `onClose` when `Maybe later` button is clicked", () => {
		renderComponent();
		act(() => maybeLaterButton.click());
		expect(onClose).toBeCalled();
	});
});
