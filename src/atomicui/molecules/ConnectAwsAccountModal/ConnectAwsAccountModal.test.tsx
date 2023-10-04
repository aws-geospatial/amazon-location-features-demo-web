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
	region: "ap-southeast-1",
	isUserAwsAccountConnected: false,
	setConnectFormValues: jest.fn(),
	setIsUserAwsAccountConnected: jest.fn(),
	clearCredentials: jest.fn(),
	onLogin: jest.fn(),
	validateFormValues: jest.fn()
};

const mockUseAmplifyMapData = {
	mapProvider: "Grab",
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
	const windowOpen = jest.fn();
	window.open = windowOpen;

	const renderComponent = () =>
		render(
			<I18nextProvider i18n={i18n} defaultNS={"fr"}>
				<ConnectAwsAccountModal {...props} />
			</I18nextProvider>
		);

	beforeEach(() => {
		mockUseAmplifyAuthData.isUserAwsAccountConnected = false;
		i18n.changeLanguage("en");
	});

	afterEach(() => {
		jest.clearAllMocks();
		mockReload.mockClear();
		windowOpen.mockClear();
	});

	it("should render correctly", () => {
		i18n.changeLanguage("de");
		const { getByTestId } = renderComponent();
		expect(getByTestId("connect-aws-account-modal-container")).toBeInTheDocument();
	});

	it("should show connect button as disabled when no values are present and allow to click terms and conditions", () => {
		const { getByTestId } = renderComponent();
		expect(getByTestId("connect-button")).toBeDisabled();
		expect(getByTestId("terms-and-conditions")).toBeInTheDocument();
		act(() => {
			fireEvent.click(getByTestId("terms-and-conditions"));
		});
		waitFor(() => {
			expect(windowOpen).toHaveBeenCalled();
		});
	});

	it("should show connect button as enabled when all values are present", () => {
		const { getByTestId } = renderComponent();

		for (let i = 0; i < 5; i++) {
			fireEvent.change(getByTestId(`input-field-${i}`), {
				target: { value: i === 0 ? "ap-southeast-1:XXXXXXXXX" : faker.datatype.string() }
			});
		}

		expect(getByTestId("connect-button")).toBeEnabled();
		act(() => {
			fireEvent.click(getByTestId("connect-button"));
		});
		waitFor(() => {
			expect(mockUseAmplifyAuthData.validateFormValues).toHaveBeenCalledWith();
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

	it("should allow to signin after connecting successfully", () => {
		mockUseAmplifyAuthData.isUserAwsAccountConnected = true;
		const { getByTestId } = renderComponent();
		expect(getByTestId("sign-in-button")).toBeInTheDocument();
		expect(getByTestId("continue-to-explore")).toBeInTheDocument();
		act(() => {
			fireEvent.click(getByTestId("sign-in-button"));
		});
		waitFor(() => {
			expect(props.onClose).toHaveBeenCalled();
			expect(mockUseAmplifyAuthData.onLogin).toHaveBeenCalled();
		});
	});

	it("should fire handleModalClose when user clicks outside modal", () => {
		const { getByTestId } = renderComponent();

		for (let i = 0; i < 5; i++) {
			fireEvent.change(getByTestId(`input-field-${i}`), {
				target: { value: i === 0 ? "ap-southeast-1:XXXXXXXXX" : faker.datatype.string() }
			});
		}

		expect(getByTestId("modal-container")).toBeInTheDocument();
		act(() => {
			fireEvent.click(getByTestId("modal-container"));
		});
		waitFor(() => {
			expect(props.onClose).toHaveBeenCalled();
			expect(mockUseAmplifyAuthData.onLogin).toHaveBeenCalled();
		});
	});

	it("should allow user to select regions", () => {
		const { getByTestId } = renderComponent();
		expect(getByTestId("dropdown-trigger")).toBeInTheDocument();
		act(() => {
			fireEvent.click(getByTestId("dropdown-trigger"));
		});
		waitFor(() => {
			expect(getByTestId("dropdown-options")).toBeInTheDocument();
		});
		act(() => {
			fireEvent.click(getByTestId("us-east-2"));
		});
		waitFor(() => {
			expect(getByTestId("dropdown-label")).toHaveDisplayValue("us-east-2");
		});
	});
});
