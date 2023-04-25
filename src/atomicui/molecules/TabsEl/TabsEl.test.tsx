import { faker } from "@faker-js/faker";
import { RenderResult, render, screen } from "@testing-library/react";

import TabsEl from "./TabsEl";

describe("<TabsEl/>", () => {
	let tabsContainer: HTMLElement;
	let tabsTitleContainer: HTMLElement | null;

	const renderComponent = (props?: { title: string }): RenderResult => {
		const renderedComponent = render(
			<TabsEl
				tabsConfig={[
					{
						title: faker.random.words(3),
						body: faker.random.words(10)
					}
				]}
				{...props}
			/>
		);

		tabsContainer = screen.getByTestId("tabs-container");
		tabsTitleContainer = screen.queryByTestId("tabs-title-container");

		return renderedComponent;
	};

	it("should render successfully", () => {
		renderComponent();
		expect(tabsContainer).toBeInTheDocument();
	});

	it("should render title if provided", () => {
		const renderedComponent = renderComponent({ title: faker.random.word() });
		expect(tabsTitleContainer).toBeInTheDocument();
		renderedComponent.unmount();

		renderComponent();
		expect(tabsTitleContainer).not.toBeInTheDocument();
	});
});
