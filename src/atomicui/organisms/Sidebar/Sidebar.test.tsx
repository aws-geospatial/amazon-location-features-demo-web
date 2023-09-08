import i18n from "@demo/locales/i18n";
import { fireEvent, render } from "@testing-library/react";
import { I18nextProvider } from "react-i18next";
import { BrowserRouter } from "react-router-dom";

import Sidebar from "./Sidebar";

const mockProps = {
	onCloseSidebar: jest.fn(),
	onOpenConnectAwsAccountModal: jest.fn(),
	onOpenSignInModal: jest.fn(),
	onShowSettings: jest.fn(),
	onShowAboutModal: jest.fn(),
	onShowAuthGeofenceBox: jest.fn(),
	onShowAuthTrackerDisclaimerModal: jest.fn(),
	onShowAuthTrackerBox: jest.fn(),
	onShowUnauthSimulationDisclaimerModal: jest.fn(),
	onShowUnauthGeofenceBox: jest.fn(),
	onShowUnauthTrackerBox: jest.fn()
};

describe("<Sidebar />", () => {
	const renderComponent = () => {
		return render(
			<I18nextProvider i18n={i18n}>
				<BrowserRouter>
					<Sidebar {...mockProps} />
				</BrowserRouter>
			</I18nextProvider>
		);
	};
	it("renders the logo", () => {
		const { getByTestId } = renderComponent();
		expect(getByTestId("side-bar")).toBeInTheDocument();
	});

	it("calls onCloseSidebar when clicking the close icon", () => {
		const { getByTestId } = renderComponent();
		fireEvent.click(getByTestId("icon-close"));
		expect(mockProps.onCloseSidebar).toHaveBeenCalled();
	});

	it("opens the Geofence box when Geofence is clicked", () => {
		const { getByText } = renderComponent();
		fireEvent.click(getByText("Geofence"));
		expect(mockProps.onShowAuthGeofenceBox).toHaveBeenCalledTimes(0);
		expect(mockProps.onCloseSidebar).toHaveBeenCalledTimes(1);
	});

	it("opens the Tracker box when Tracker is clicked", () => {
		const { getByText } = renderComponent();
		fireEvent.click(getByText("Tracker"));
		expect(mockProps.onShowAuthTrackerBox).toHaveBeenCalledTimes(0);
		expect(mockProps.onCloseSidebar).toHaveBeenCalledTimes(1);
	});

	it("opens the Settings box when Settings is clicked", () => {
		const { getByText } = renderComponent();
		fireEvent.click(getByText("Settings"));
		expect(mockProps.onShowSettings).toHaveBeenCalledTimes(1);
		expect(mockProps.onCloseSidebar).toHaveBeenCalledTimes(1);
	});

	it("opens the About box when About is clicked", () => {
		const { getByText } = renderComponent();
		fireEvent.click(getByText("About"));
		expect(mockProps.onShowAboutModal).toHaveBeenCalledTimes(1);
		expect(mockProps.onCloseSidebar).toHaveBeenCalledTimes(1);
	});

	it("opens the Connect AWS Account Modal when it is clicked", () => {
		const { getByText } = renderComponent();
		fireEvent.click(getByText("Connect AWS Account"));
		expect(mockProps.onOpenConnectAwsAccountModal).toHaveBeenCalledTimes(1);
		expect(mockProps.onCloseSidebar).toHaveBeenCalledTimes(1);
	});
});
