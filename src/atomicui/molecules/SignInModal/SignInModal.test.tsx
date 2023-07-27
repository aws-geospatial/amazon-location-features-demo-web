import i18n from "@demo/locales/i18n";
import { act, render } from "@testing-library/react";
import { I18nextProvider } from "react-i18next";

import SignInModal from "./SignInModal";

const useAmplifyAuthReturnValue = {
	onLogin: jest.fn()
};

const useAmplifyAuth = () => useAmplifyAuthReturnValue;
const delay = (cb: () => void, ms: number) => setTimeout(cb, ms);

jest.mock("hooks", () => ({
	useAmplifyAuth
}));

describe("<SignInModal/>", () => {
	let signInModalContainer: HTMLElement;
	let signInButton: HTMLElement;
	let maybeLaterButton: HTMLElement;

	const onClose = jest.fn();

	const renderComponent = () => {
		const renderedComponent = render(
			<I18nextProvider i18n={i18n}>
				<SignInModal open onClose={onClose} />
			</I18nextProvider>
		);
		const { getByTestId } = renderedComponent;

		signInModalContainer = getByTestId("sign-in-modal");
		signInButton = getByTestId("sign-in-button");
		maybeLaterButton = getByTestId("maybe-later-button");

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
		delay(() => expect(useAmplifyAuthReturnValue.onLogin).toBeCalled(), 500);
	});

	it("should call `onClose` when `Maybe later` button is clicked", () => {
		renderComponent();
		act(() => maybeLaterButton.click());
		expect(onClose).toBeCalled();
	});
});
