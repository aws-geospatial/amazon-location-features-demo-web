/* Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved. */
/* SPDX-License-Identifier: MIT-0 */
/// <reference types="cypress" />

//STR
// 1- Go to https://qa.amazonlocation.services/demo
// 2-User clicks on the search bar and searches any location geocode e.g.-31.9627092,115.9248736
// 3-Verify User can search any location by geocode

describe("Verify that user can search by geocode location", () => {
	it("authentication", { scrollBehavior: false }, () => {
		cy.visit(Cypress.env("WEB_DOMAIN"), {
			auth: {
				username: Cypress.env("WEB_DOMAIN_USERNAME"),
				password: Cypress.env("WEB_DOMAIN_PASSWORD")
			}
		});
		cy.wait(20000);
		cy.get('[class="amplify-button amplify-field-group__control amplify-button--primary"]').click();
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
		cy.wait(2000);
	});
});
