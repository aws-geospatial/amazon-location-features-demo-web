/* Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved. */
/* SPDX-License-Identifier: MIT-0 */
/// <reference types="cypress" />

//STR
// 1-Go to https://qa.amazonlocation.services/demo
// 2-User clicks on the search field
// 3-User searches for a location from the search bar e.g. Rio tinto
// 4-User clicks on the routing icon which is on the corner of the search bar
// 5-User searches for a location from the routing field e.g. Rio tinto
// 6-Verify User can see the the search in routing field is giving the same results as the normal search

describe("Verify that search in routing fields is working and giving the same results as the normal search", () => {
	it("authentication", { scrollBehavior: false }, () => {
		cy.visit(Cypress.env("WEB_DOMAIN"), {
			auth: {
				username: Cypress.env("WEB_DOMAIN_USERNAME"),
				password: Cypress.env("WEB_DOMAIN_PASSWORD")
			}
		});
		cy.wait(20000);
		cy.get('[class="amplify-button amplify-field-group__control amplify-button--primary"]').click();
		cy.get('[class="amplify-flex icon outter-end-component"]').click();
		cy.wait(3000);
		cy.get('[placeholder="From"]').click().type("Rio tinto{enter}");
		cy.wait(5000);
		for (let i = 0; i < 5; i++) {
			cy.get("div").contains("Rio Tinto").should("exist");
			cy.wait(2000);
		}
	});
});
