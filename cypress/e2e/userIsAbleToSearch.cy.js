/* Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved. */
/* SPDX-License-Identifier: MIT-0 */

describe("Search", () => {
	beforeEach(() => {
		cy.visitDomain(Cypress.env("WEB_DOMAIN"))
		cy.get('[class="amplify-button amplify-field-group__control amplify-button--primary"]').click();
	});

	it("should allow user to use the search box and get suggestions based on input", () => {
		cy.get('[placeholder="Search"]').click().type("School").wait(5000).type("{enter}");
		cy.wait(5000);
		cy.get('[class="mapboxgl-marker mapboxgl-marker-anchor-center"]').should("be.visible");
	});

	it("should allow user to search by address", { scrollBehavior: false }, () => {
		cy.get('[placeholder="Search"]')
			.click()
			.type("44 Boobialla Street, Corbie Hill, Australia")
			.wait(5000)
			.type("{downArrow}")
			.type("{enter}");
		cy.wait(10000);
		cy.get('[class="info-container"]').should("be.visible");
	});

	it("should allow user to search by geocode", { scrollBehavior: false }, () => {
		cy.get('[placeholder="Search"]')
			.click()
			.type("-31.9627092,115.9248736")
			.wait(5000)
			.type("{downArrow}")
			.type("{enter}");
		cy.wait(10000);
		cy.get('[class="amplify-text amplify-text--tertiary"]').should(
			"have.text",
			"Rivervale, Perth, Western Australia, 6103, AUS"
		);
	});

	it("should allow user to view the POI after a search", { scrollBehavior: false }, () => {
		// eslint-disable-next-line @typescript-eslint/no-unused-vars, no-unused-vars
		Cypress.on("uncaught:exception", (err, runnable) => {
			return false;
		});
		cy.get('[placeholder="Search"]').click().type("Rio tinto").type("{enter}");
		cy.wait(10000);
		cy.get("div").should("contain", "Rio Tinto");
		cy.wait(2000);
		for (let i = 0; i < 10; i++) {
			cy.get("div").should("contain", "Rio Tinto");
			cy.wait(2000);
		}
	});

	it("should show user an error message when no search text is present", { scrollBehavior: false }, () => {
		cy.get('[placeholder="Search"]').click().type("{enter}");
		cy.wait(5000);
		cy.get("div").should("contain", "Failed to search place by text, 'Text' must have length at least 1");
	});

	it("should allow user to view the list of search results once search is performed", { scrollBehavior: false }, () => {
		cy.get('[placeholder="Search"]').click().type("Kewdale");
		cy.wait(5000);
		cy.get('[class="amplify-scrollview amplify-autocomplete__menu" ]').should("be.visible");
	});
});
