import i18n from "@demo/locales/i18n";
import { faker } from "@faker-js/faker";
import { RenderResult, render, screen } from "@testing-library/react";
import { I18nextProvider } from "react-i18next";
import { BrowserRouter } from "react-router-dom";

import List from "./List";

describe("<List/>", () => {
	let listContainer: HTMLElement;
	let latestRenderedListComponent: RenderResult;
	const listArray = [
		...[...Array(2)].map(() => ({
			label: faker.random.word(),
			link: faker.internet.url()
		})),
		{
			label: faker.random.word(),
			link: "/somewhere"
		}
	];

	const renderListComponent = (props?: { hideIcons?: boolean }) =>
		render(
			<I18nextProvider i18n={i18n}>
				<BrowserRouter>
					<List useDefaultStyles {...props} listArray={listArray} />
				</BrowserRouter>
			</I18nextProvider>
		);

	beforeEach(() => {
		latestRenderedListComponent = renderListComponent();
		listContainer = screen.getByTestId("list-container");
	});

	it("should render successfully", () => {
		expect(listContainer).toBeInTheDocument();
	});

	it("should not render icons if `hideIcons` prop is supplied", () => {
		expect(listContainer).toBeInTheDocument();
		const listItemIconBeforeLinks = screen.getAllByTestId("list-item-icon-before-link");
		expect(listItemIconBeforeLinks.length).toBe(listArray.length);
		latestRenderedListComponent.unmount();

		latestRenderedListComponent = renderListComponent({ hideIcons: true });
		const listContainer2 = screen.getByTestId("list-container");
		expect(listContainer2).toBeInTheDocument();
		const listItemIconBeforeLinks2 = screen.queryAllByTestId("list-item-icon-before-link");
		expect(listItemIconBeforeLinks2.length).toBe(0);
		latestRenderedListComponent.unmount();
	});

	it("should not create a link with target='_blank' if the url passed is external", () => {
		const checkIfExternalLink = (link: string): boolean =>
			!!(
				link?.startsWith("https://") ||
				link?.startsWith("http://") ||
				link?.startsWith("#") ||
				link?.startsWith("/demo")
			);

		const listItemIconBeforeLinks = screen.getAllByRole("link");

		listItemIconBeforeLinks.forEach(listItemIconBeforeLink => {
			const href = listItemIconBeforeLink.getAttribute("href");

			if (checkIfExternalLink(href!)) {
				const asd = listItemIconBeforeLink.getAttribute("target");
				expect(asd).toBe("_blank");
			}
		});
	});
});
