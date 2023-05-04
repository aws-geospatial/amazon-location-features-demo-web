/* Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved. */
/* SPDX-License-Identifier: MIT-0 */
/// <reference types="cypress" />

//STR
// 1-Go to https://qa.amazonlocation.services/demo
// 2-User clicks on the search field
// 3-User searches for a specific location e.g.Rio tinto
// 4-Verify the search suggestions are displayed on the map as well

describe("Verify that search suggestions will be displayed on the map as well.", () => {
	it("authentication", { scrollBehavior: false }, () => {
		cy.visit(Cypress.env("WEB_DOMAIN"), {
			auth: {
				username: Cypress.env("WEB_DOMAIN_USERNAME"),
				password: Cypress.env("WEB_DOMAIN_PASSWORD")
			}
		});
		cy.wait(20000);
		cy.get('[class="amplify-button amplify-field-group__control amplify-button--primary"]').click();
		cy.get('[placeholder="Search"]').click().type("Rio tinto").type("{enter}");
		cy.wait(10000);
		for (let i = 0; i < 10; i++) {
			cy.wait(2000);
			cy.get("div").should("contain", "Rio Tinto");
		}
	});
});
