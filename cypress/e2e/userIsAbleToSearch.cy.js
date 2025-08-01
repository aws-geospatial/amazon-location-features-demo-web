/* Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved. */
/* SPDX-License-Identifier: MIT-0 */

describe("Search", () => {
	context("Desktop view", () => {
		beforeEach(() => {
			cy.visitDomain(`${Cypress.env("WEB_DOMAIN")}/demo`);
			cy.get('[placeholder="Search"]').click();
		});

		it(
			"DS-001 - should allow user to view the list of search results once search is performed",
			{ scrollBehavior: false },
			() => {
				cy.get('[inputmode="search"]').type("gramercy park music school USA");
				cy.get('[class="amplify-scrollview amplify-autocomplete__menu" ]').should("be.visible");
			}
		);

		it(
			"DS-002 - should allow user to search an address and view the information popup after selecting a suggestion",
			{ scrollBehavior: false },
			() => {
				cy.get('[inputmode="search"]')
					.type("gramercy park music school USA")
					.wait(10000)
					.type("{downArrow}")
					.type("{enter}");
				cy.get('[class="maplibregl-popup popup-container maplibregl-popup-anchor-left"]').should("be.visible");
			}
		);

		it("DS-003 - should allow user to search by geocode", { scrollBehavior: false }, () => {
			cy.get('[inputmode="search"]').type("-31.9627092,115.9248736").wait(10000).type("{downArrow}").type("{enter}");
			cy.get('[class="maplibregl-popup popup-container maplibregl-popup-anchor-left"]').should("be.visible");
		});

		it("DS-004 - should allow user to view the POIs after a search", { scrollBehavior: false }, () => {
			// eslint-disable-next-line @typescript-eslint/no-unused-vars, no-unused-vars
			Cypress.on("uncaught:exception", (err, runnable) => {
				return false;
			});
			cy.get('[inputmode="search"]').type("Rio tinto").wait(10000).type("{enter}");
			cy.get("div").should("contain", "Rio Tinto");
			for (let i = 0; i < 10; i++) {
				cy.get("div").should("contain", "Rio Tinto");
				cy.wait(2000);
			}
		});

		it("DS-005 - should show user an error message when no search text is present", { scrollBehavior: false }, () => {
			cy.get('[inputmode="search"]').type("{enter}");
			cy.get("div").should("contain", "Failed to search place by text, 'QueryText' must have length at least 1");
		});

		it.skip("should enable nl search and allow user to view POI after nl search", { scrollBehavior: false }, () => {
			cy.get('[id="nl-search"]').click();
			cy.get('[placeholder="Search"]').click();
			cy.get('[inputmode="search"]').type("Find me one starbucks in Vancouver?").wait(5000).type("{enter}");
			cy.get("div").invoke("text").should("have.length.gt", 0);
		});
	});

	context("Responsive view", () => {
		beforeEach(() => {
			cy.visitDomainInResponsiveView(`${Cypress.env("WEB_DOMAIN")}/demo`);
			cy.get('[placeholder="Search"]').click();
		});

		it(
			"DS-006 - should allow user to view the list of search results once search is performed",
			{ scrollBehavior: false },
			() => {
				cy.get('[data-testid="search-box-input"]').type("gramercy park music school USA");
				cy.get('[data-testid="search-suggestions"]').should("be.visible");
			}
		);

		it(
			"DS-007 - should allow user to search an address and view the information popup after selecting a suggestion",
			{ scrollBehavior: false },
			() => {
				cy.get('[data-testid="search-box-input"]').type("gramercy park music school USA");
				cy.get('[data-testid="search-suggestions"]').first().click();
				cy.get('[data-testid="poi-body"]').should("be.visible");
			}
		);

		it("DS-008 - should allow user to search by geocode", { scrollBehavior: false }, () => {
			cy.get('[data-testid="search-box-input"]').type("-31.9627092,115.9248736");
			cy.get('[data-testid="search-suggestions"]').first().click();
			cy.get('[data-testid="poi-body"]').should("be.visible");
		});

		it("DS-009 - should allow user to view the POIs after a search", { scrollBehavior: false }, () => {
			// eslint-disable-next-line @typescript-eslint/no-unused-vars, no-unused-vars
			Cypress.on("uncaught:exception", (err, runnable) => {
				return false;
			});
			cy.get('[data-testid="search-box-input"]').type("Rio tinto");
			cy.get('[data-testid="search-suggestions"]').first().click();
			cy.get("div").should("contain", "Rio Tinto");
		});

		it("DS-010 - should show user an error message when no search text is present", { scrollBehavior: false }, () => {
			cy.get('[data-testid="search-box-input"]').type("{enter}");
			cy.get("div").should("contain", "Failed to search place by text, 'QueryText' must have length at least 1");
		});
	});
});
