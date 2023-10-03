import i18n from "@demo/locales/i18n";
import { faker } from "@faker-js/faker";
import { act, fireEvent, render, waitFor } from "@testing-library/react";
import { I18nextProvider } from "react-i18next";

import ConnectAwsAccountModal, { ConnectAwsAccountModalProps } from "./ConnectAwsAccountModal";

const mockReload = jest.fn();

Object.defineProperty(window, "location", {
	writable: true,
	value: { reload: mockReload }
});

const props: ConnectAwsAccountModalProps = {
	open: true,
	onClose: jest.fn(),
	handleCurrentLocationAndViewpoint: jest.fn()
};

const mockUseAmplifyAuthData = {
	region: "us-east-1",
	isUserAwsAccountConnected: false,
	setConnectFormValues: jest.fn(),
	setIsUserAwsAccountConnected: jest.fn(),
	clearCredentials: jest.fn(),
	onLogin: jest.fn(),
	validateFormValues: jest.fn()
};

const mockUseAmplifyMapData = {
	mapProvider: faker.random.word,
	setMapProvider: jest.fn(),
	setMapStyle: jest.fn()
};

const mockUseAwsData = {
	resetStore: jest.fn()
};

jest.mock("@demo/hooks", () => ({
	useAmplifyAuth: () => mockUseAmplifyAuthData,
	useAmplifyMap: () => mockUseAmplifyMapData,
	useAws: () => mockUseAwsData,
	useMediaQuery: () => true
}));

Object.defineProperty(window, "location", {
	writable: true,
	value: { reload: jest.fn() }
});

describe("<ConnectAwsAccountModal />", () => {
	const renderComponent = () =>
		render(
			<I18nextProvider i18n={i18n}>
				<ConnectAwsAccountModal {...props} />
			</I18nextProvider>
		);

	beforeEach(() => {
		mockUseAmplifyAuthData.isUserAwsAccountConnected = false;
	});

	afterEach(() => {
		mockReload.mockClear();
	});

	it("should render correctly", () => {
		const { getByTestId } = renderComponent();
		expect(getByTestId("connect-aws-account-modal-container")).toBeInTheDocument();
	});

	it("should show connect button as disabled when no values are present", () => {
		const { getByTestId } = renderComponent();
		expect(getByTestId("connect-button")).toBeDisabled();
	});

	it("should show connect button as enabled when all values are present", () => {
		const { getByTestId } = renderComponent();

		for (let i = 0; i < 5; i++) {
			fireEvent.change(getByTestId(`input-field-${i}`), { target: { value: faker.datatype.string() } });
		}

		expect(getByTestId("connect-button")).toBeEnabled();
		act(() => {
			fireEvent.click(getByTestId("connect-button"));
		});
		waitFor(() => {
			expect(mockUseAmplifyAuthData.validateFormValues).toHaveBeenCalled();
			expect(mockUseAmplifyAuthData.setConnectFormValues).toHaveBeenCalled();
			expect(mockUseAmplifyAuthData.clearCredentials).toHaveBeenCalled();
			expect(mockUseAwsData.resetStore).toHaveBeenCalled();
			expect(mockUseAmplifyAuthData.setIsUserAwsAccountConnected).toHaveBeenCalled();
		});
	});

	it("should allow to continue to explore page after connecting successfully", () => {
		mockUseAmplifyAuthData.isUserAwsAccountConnected = true;
		const { getByTestId } = renderComponent();
		expect(getByTestId("sign-in-button")).toBeInTheDocument();
		expect(getByTestId("continue-to-explore")).toBeInTheDocument();
		act(() => {
			fireEvent.click(getByTestId("continue-to-explore"));
		});
		waitFor(() => {
			expect(props.onClose).toHaveBeenCalled();
			expect(mockReload).toHaveBeenCalled();
		});
	});
});
