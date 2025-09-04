import i18n from "@demo/locales/i18n";
import { fireEvent, render, screen } from "@testing-library/react";
import { I18nextProvider } from "react-i18next";
import { BrowserRouter } from "react-router-dom";

import Sidebar, { SidebarProps } from "./Sidebar";

const mockProps: SidebarProps = {
	onCloseSidebar: vi.fn(),
	onShowSettings: vi.fn(),
	onShowAboutModal: vi.fn(),
	onShowUnauthSimulation: vi.fn(),
	onOpenFeedbackModal: vi.fn()
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

	beforeEach(() => {
		vi.clearAllMocks();
		Object.defineProperty(window, "location", {
			writable: true,
			value: {
				...window.location,
				href: "http://localhost/",
				origin: "http://localhost"
			}
		});
	});

	it("renders the sidebar", async () => {
		renderComponent();
		expect(await screen.findByTestId("side-bar")).toBeInTheDocument();
	});

	it("calls onCloseSidebar when clicking the close icon", async () => {
		renderComponent();
		fireEvent.click(await screen.findByTestId("icon-close"));
		expect(mockProps.onCloseSidebar).toHaveBeenCalled();
	});

	it("opens the unauth simulation when Trackers is clicked", async () => {
		renderComponent();
		fireEvent.click(await screen.findByText("Trackers"));
		expect(mockProps.onShowUnauthSimulation).toHaveBeenCalledTimes(1);
		expect(mockProps.onCloseSidebar).toHaveBeenCalledTimes(1);
	});

	it("opens the Settings box when Settings is clicked", async () => {
		renderComponent();
		fireEvent.click(await screen.findByText("Settings"));
		expect(mockProps.onShowSettings).toHaveBeenCalledTimes(1);
		expect(mockProps.onCloseSidebar).toHaveBeenCalledTimes(1);
	});

	it("opens the About box when About is clicked", async () => {
		renderComponent();
		fireEvent.click(await screen.findByText("About"));
		expect(mockProps.onShowAboutModal).toHaveBeenCalledTimes(1);
		expect(mockProps.onCloseSidebar).toHaveBeenCalledTimes(1);
	});
});
