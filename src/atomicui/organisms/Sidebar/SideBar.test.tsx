import { fireEvent, render } from "@testing-library/react";

import { BrowserRouter } from "react-router-dom";

import Sidebar from "./Sidebar";

const mockProps = {
	onCloseSidebar: jest.fn(),
	onOpenConnectAwsAccountModal: jest.fn(),
	onOpenSignInModal: jest.fn(),
	onShowGeofenceBox: jest.fn(),
	onShowTrackingBox: jest.fn(),
	onShowSettings: jest.fn(),
	onShowTrackingDisclaimerModal: jest.fn(),
	onShowAboutModal: jest.fn()
};

describe("<Sidebar />", () => {
	it("renders the logo", () => {
		const { getByTestId } = render(
			<BrowserRouter>
				<Sidebar {...mockProps} />
			</BrowserRouter>
		);
		expect(getByTestId("side-bar")).toBeInTheDocument();
	});

	it("calls onCloseSidebar when clicking the close icon", () => {
		const { getByTestId } = render(
			<BrowserRouter>
				<Sidebar {...mockProps} />
			</BrowserRouter>
		);
		fireEvent.click(getByTestId("icon-close"));
		expect(mockProps.onCloseSidebar).toHaveBeenCalled();
	});

	it("opens the Geofence box when Geofence is clicked", () => {
		const { getByText } = render(
			<BrowserRouter>
				<Sidebar {...mockProps} />
			</BrowserRouter>
		);
		fireEvent.click(getByText("Geofence"));
		expect(mockProps.onShowGeofenceBox).toHaveBeenCalledTimes(0);
		expect(mockProps.onCloseSidebar).toHaveBeenCalledTimes(1);
	});

	it("opens the Tracker box when Tracker is clicked", () => {
		const { getByText } = render(
			<BrowserRouter>
				<Sidebar {...mockProps} />
			</BrowserRouter>
		);
		fireEvent.click(getByText("Tracker"));
		expect(mockProps.onShowTrackingBox).toHaveBeenCalledTimes(0);
		expect(mockProps.onCloseSidebar).toHaveBeenCalledTimes(1);
	});

	it("opens the Settings box when Settings is clicked", () => {
		const { getByText } = render(
			<BrowserRouter>
				<Sidebar {...mockProps} />
			</BrowserRouter>
		);
		fireEvent.click(getByText("Settings"));
		expect(mockProps.onShowSettings).toHaveBeenCalledTimes(1);
		expect(mockProps.onCloseSidebar).toHaveBeenCalledTimes(1);
	});

	it("opens the About box when About is clicked", () => {
		const { getByText } = render(
			<BrowserRouter>
				<Sidebar {...mockProps} />
			</BrowserRouter>
		);
		fireEvent.click(getByText("About"));
		expect(mockProps.onShowAboutModal).toHaveBeenCalledTimes(1);
		expect(mockProps.onCloseSidebar).toHaveBeenCalledTimes(1);
	});

	it("opens the Connect AWS Account Modal when it is clicked", () => {
		const { getByText } = render(
			<BrowserRouter>
				<Sidebar {...mockProps} />
			</BrowserRouter>
		);
		fireEvent.click(getByText("Connect AWS Account"));
		expect(mockProps.onOpenConnectAwsAccountModal).toHaveBeenCalledTimes(1);
		expect(mockProps.onCloseSidebar).toHaveBeenCalledTimes(1);
	});
});
