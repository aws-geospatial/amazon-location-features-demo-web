/* Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved. */
/* SPDX-License-Identifier: MIT-0 */

describe("Search", () => {
	beforeEach(() => {
		cy.visitDomain(`${Cypress.env("WEB_DOMAIN")}`);
	});

	it("should allow user to view the list of search results once search is performed", { scrollBehavior: false }, () => {
		cy.get('[placeholder="Search"]').click();
		cy.wait(2000);
		cy.get('[inputmode="search"]').type("gramercy park music school USA");
		cy.wait(10000);
		cy.get('[class="amplify-scrollview amplify-autocomplete__menu" ]').should("be.visible");
	});

	it(
		"should allow user to search an address and view the information popup after selecting a suggestion",
		{ scrollBehavior: false },
		() => {
			cy.get('[placeholder="Search"]').click();
			cy.wait(2000);
			cy.get('[inputmode="search"]')
				.type("gramercy park music school USA")
				.wait(10000)
				.type("{downArrow}")
				.type("{enter}");
			cy.wait(2000);
			cy.get('[class="mapboxgl-popup popup-container mapboxgl-popup-anchor-left"]').should("be.visible");
		}
	);

	it("should allow user to search by geocode", { scrollBehavior: false }, () => {
		cy.get('[placeholder="Search"]').click();
		cy.wait(2000);
		cy.get('[inputmode="search"]').type("-31.9627092,115.9248736").wait(10000).type("{downArrow}").type("{enter}");
		cy.wait(2000);
		cy.get('[class="mapboxgl-popup popup-container mapboxgl-popup-anchor-left"]').should("be.visible");
	});

	it("should allow user to view the POIs after a search", { scrollBehavior: false }, () => {
		// eslint-disable-next-line @typescript-eslint/no-unused-vars, no-unused-vars
		Cypress.on("uncaught:exception", (err, runnable) => {
			return false;
		});
		cy.get('[placeholder="Search"]').click();
		cy.wait(2000);
		cy.get('[inputmode="search"]').type("Rio tinto").wait(10000).type("{enter}");
		cy.wait(2000);
		cy.get("div").should("contain", "Rio Tinto");
		cy.wait(2000);
		for (let i = 0; i < 10; i++) {
			cy.get("div").should("contain", "Rio Tinto");
			cy.wait(2000);
		}
	});

	it("should show user an error message when no search text is present", { scrollBehavior: false }, () => {
		cy.get('[placeholder="Search"]').click();
		cy.wait(2000);
		cy.get('[inputmode="search"]').type("{enter}");
		cy.wait(2000);
		cy.get("div").should("contain", "Failed to search place by text, 'Text' must have length at least 1");
	});
});
