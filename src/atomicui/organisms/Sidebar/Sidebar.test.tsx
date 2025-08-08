import i18n from "@demo/locales/i18n";
import { fireEvent, render, waitFor } from "@testing-library/react";
import { I18nextProvider } from "react-i18next";
import { BrowserRouter } from "react-router-dom";
import { Suspense } from "react";
import Sidebar, { SidebarProps } from "./Sidebar";

jest.mock("@demo/atomicui/atoms/Logo", () => ({
    Logo: () => <div data-testid="mock-logo">Mock Logo</div>
  }));
  
  jest.mock("@demo/atomicui/atoms/List", () => ({
    List: () => <div data-testid="mock-list">Mock List</div>
  }));
  
const mockProps: SidebarProps = {
	onCloseSidebar: jest.fn(),
	onShowSettings: jest.fn(),
	onShowAboutModal: jest.fn(),
	onShowUnauthSimulation: jest.fn(),
	onOpenFeedbackModal: jest.fn()
};

describe("<Sidebar />", () => {
	const renderComponent = () => {
		console.log("Sidebar is:", Sidebar);
		return render(
			<I18nextProvider i18n={i18n}>
				<BrowserRouter>
					<Sidebar {...mockProps} />
				</BrowserRouter>
			</I18nextProvider>
		);
	};

	beforeEach(() => {
		// Object.defineProperty(window, "location", {
		// 	writable: true,
		// 	value: {
		// 		...window.location,
		// 		href: "http://localhost/",
		// 		origin: "http://localhost"
		// 	}
		// });
	});

	it("renders the logo", () => {
		const { getByTestId } = renderComponent();

		waitFor(
			() => {
				expect(getByTestId("side-bar")).toBeInTheDocument();
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

	it("calls onCloseSidebar when clicking the close icon", () => {
		const { getByTestId } = renderComponent();
		fireEvent.click(getByTestId("icon-close"));
		expect(mockProps.onCloseSidebar).toHaveBeenCalled();
	});

	it("opens the unauth simulation when Trackers is clicked", () => {
		const { getByText } = renderComponent();
		fireEvent.click(getByText("Trackers"));
		expect(mockProps.onShowUnauthSimulation).toHaveBeenCalledTimes(1);
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
});
