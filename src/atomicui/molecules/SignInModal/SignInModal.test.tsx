import i18n from "@demo/locales/i18n";
import { act, render, waitFor } from "@testing-library/react";
import { I18nextProvider } from "react-i18next";

import SignInModal from "./SignInModal";

const useAmplifyAuthReturnValue = {
	onLogin: jest.fn()
};
const useAmplifyAuth = () => useAmplifyAuthReturnValue;
const delay = (cb: () => void, ms: number) => setTimeout(cb, ms);
const onClose = jest.fn();

jest.mock("hooks", () => ({
	useAmplifyAuth
}));

describe("<SignInModal/>", () => {
	const renderComponent = () =>
		render(
			<I18nextProvider i18n={i18n}>
				<SignInModal open onClose={onClose} />
			</I18nextProvider>
		);

	afterAll(() => {
		jest.resetAllMocks();
	});

	it("should render successfully", () => {
		const { getByTestId } = renderComponent();

		waitFor(
			() => {
				expect(getByTestId("sign-in-modal")).toBeInTheDocument();
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

	it("should call `onLogin` when `sign in` button is clicked", () => {
		const { getByTestId } = renderComponent();
		act(() => getByTestId("sign-in-button").click());
		delay(() => expect(useAmplifyAuthReturnValue.onLogin).toBeCalled(), 500);
	});

	it("should call `onClose` when `Maybe later` button is clicked", () => {
		const { getByTestId } = renderComponent();
		act(() => getByTestId("maybe-later-button").click());
		expect(onClose).toBeCalled();
	});
});
