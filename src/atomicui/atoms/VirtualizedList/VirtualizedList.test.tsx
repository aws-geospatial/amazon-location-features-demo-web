import i18n from "@demo/locales/i18n";
import { render } from "@testing-library/react";
import { I18nextProvider } from "react-i18next";

import VirtualizedList from "./VirtualizedList";

const mockListData = [<div key={1}>Item 1</div>, <div key={2}>Item 2</div>, <div key={3}>Item 3</div>];

describe("<VirtualizedList />", () => {
	const renderComponent = () =>
		render(
			<I18nextProvider i18n={i18n}>
				<VirtualizedList listData={mockListData} />
			</I18nextProvider>
		);

	it("should render all items", () => {
		const { getByTestId } = renderComponent();
		expect(getByTestId("virtualized-list-container")).toBeInTheDocument();

		for (let i = 0; i < mockListData.length; i++) {
			expect(getByTestId(`virtualized-list-item-${i}`)).toBeInTheDocument();
		}
	});
});
