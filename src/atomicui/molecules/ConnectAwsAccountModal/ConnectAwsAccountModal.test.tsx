import i18n from "@demo/locales/i18n";
import { UserProvidedValues } from "@demo/types";
import { faker } from "@faker-js/faker";
import { fireEvent, render, waitFor } from "@testing-library/react";
import { I18nextProvider } from "react-i18next";

import ConnectAwsAccountModal, { ConnectAwsAccountModalProps } from "./ConnectAwsAccountModal";

const mockReload = jest.fn();

Object.defineProperty(window, "location", {
	writable: true,
	value: { reload: mockReload }
});

const mockProps: ConnectAwsAccountModalProps = {
	open: true,
	onClose: jest.fn()
};

const mockUseAuthData = {
	userProvidedValues: undefined as UserProvidedValues | undefined,
	setConnectFormValues: jest.fn(),
	clearCredentials: jest.fn(),
	onLogin: jest.fn(),
	validateFormValues: jest.fn(),
	stackRegion: "ap-southeast-1",
	cloudFormationLink: "https://link.com",
	handleStackRegion: jest.fn()
};

const mockUseMapData = {
	mapProvider: "Grab",
	setMapProvider: jest.fn(),
	setMapStyle: jest.fn()
};

const mockUseClientData = {
	resetStore: jest.fn()
};

jest.mock("@demo/hooks", () => ({
	useAuth: () => mockUseAuthData,
	useMap: () => mockUseMapData,
	useClient: () => mockUseClientData,
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
				<ConnectAwsAccountModal {...mockProps} />
			</I18nextProvider>
		);

	beforeEach(() => {
		mockUseAuthData.userProvidedValues = undefined;
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

		waitFor(
			() => {
				expect(getByTestId("connect-aws-account-modal-container")).toBeInTheDocument();
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

	it("should show connect button as disabled when no values are present and allow to click terms and conditions", () => {
		const { getByTestId } = renderComponent();

		waitFor(
			() => {
				expect(getByTestId("connect-button")).toBeDisabled();
				expect(getByTestId("terms-and-conditions")).toBeInTheDocument();
				fireEvent.click(getByTestId("terms-and-conditions"));
				expect(windowOpen).toHaveBeenCalled();
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

	it("should show connect button as enabled when all values are present", () => {
		const { getByTestId } = renderComponent();

		for (let i = 0; i < 5; i++) {
			fireEvent.change(getByTestId(`input-field-${i}`), {
				target: { value: i === 0 ? "ap-southeast-1:XXXXXXXXX" : faker.datatype.string() }
			});
		}

		waitFor(
			() => {
				expect(getByTestId("connect-button")).toBeEnabled();
				fireEvent.click(getByTestId("connect-button"));
				expect(mockUseAuthData.validateFormValues).toHaveBeenCalledWith();
				expect(mockUseAuthData.setConnectFormValues).toHaveBeenCalled();
				expect(mockUseAuthData.clearCredentials).toHaveBeenCalled();
				expect(mockUseClientData.resetStore).toHaveBeenCalled();
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

	it("should allow to continue to explore page after connecting successfully", () => {
		mockUseAuthData.userProvidedValues = {
			identityPoolId: "",
			region: "",
			userDomain: "",
			userPoolClientId: "",
			userPoolId: "",
			webSocketUrl: ""
		};
		const { getByTestId } = renderComponent();

		waitFor(
			() => {
				expect(getByTestId("sign-in-button")).toBeInTheDocument();
				expect(getByTestId("continue-to-explore")).toBeInTheDocument();
				fireEvent.click(getByTestId("continue-to-explore"));
				expect(mockProps.onClose).toHaveBeenCalled();
				expect(mockReload).toHaveBeenCalled();
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

	it("should allow to signin after connecting successfully", () => {
		mockUseAuthData.userProvidedValues = {
			identityPoolId: "",
			region: "",
			userDomain: "",
			userPoolClientId: "",
			userPoolId: "",
			webSocketUrl: ""
		};
		const { getByTestId } = renderComponent();

		waitFor(
			() => {
				expect(getByTestId("sign-in-button")).toBeInTheDocument();
				expect(getByTestId("continue-to-explore")).toBeInTheDocument();
				fireEvent.click(getByTestId("sign-in-button"));
				expect(mockProps.onClose).toHaveBeenCalled();
				expect(mockUseAuthData.onLogin).toHaveBeenCalled();
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

	it("should fire handleModalClose when user clicks outside modal", () => {
		const { getByTestId } = renderComponent();

		for (let i = 0; i < 5; i++) {
			fireEvent.change(getByTestId(`input-field-${i}`), {
				target: { value: i === 0 ? "ap-southeast-1:XXXXXXXXX" : faker.datatype.string() }
			});
		}

		waitFor(
			() => {
				expect(getByTestId("modal-container")).toBeInTheDocument();
				fireEvent.click(getByTestId("modal-container"));
				expect(mockProps.onClose).toHaveBeenCalled();
				expect(mockUseAuthData.onLogin).toHaveBeenCalled();
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

	it("should allow user to select regions", () => {
		const { getByTestId } = renderComponent();

		waitFor(
			() => {
				expect(getByTestId("dropdown-trigger")).toBeInTheDocument();
				fireEvent.click(getByTestId("dropdown-trigger"));
				expect(getByTestId("dropdown-options")).toBeInTheDocument();
				fireEvent.click(getByTestId("us-east-2"));
				expect(getByTestId("dropdown-label")).toHaveDisplayValue("us-east-2");
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
});
