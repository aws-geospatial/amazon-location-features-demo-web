/* Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved. */
/* SPDX-License-Identifier: MIT-0 */
/// <reference types="cypress" />

//STR
// 1-Go to https://qa.amazonlocation.services/demo
// 2-User clicks on the search field
// 3-User search for a Location e.g. “Rio Tinto Perth Western Australia”
// 4-User can see the exact match for the address
// 5-Once the POI card is open
// 6-Verify User sees the travel time with directions button in a card

describe("Verify that when user searches exact match with the address it must display the travel time with directions button in the POI card", () => {
	it("authentication", { scrollBehavior: false }, () => {
		cy.visit(Cypress.env("URL"), {
			auth: {
				username: Cypress.env("USERNAME"),
				password: Cypress.env("PASSWORD")
			}
		});
		cy.wait(20000);
		cy.get('[placeholder="Search"]').click().type("Rio Tinto Perth Western Australia");
		cy.wait(10000);
		cy.get("div").should("contain", "Rio Tinto Operations Centre");
		cy.wait(2000);
		cy.get('[placeholder="Search"]').click().type("{downArrow}{downArrow}{enter}");
		cy.wait(5000);
		cy.get('[class="amplify-text amplify-text--tertiary"]').should(
			"have.text",
			"11 George Wiencke Dr, Perth Airport, Perth, Western Australia, 6105, AUS"
		);
		cy.wait(3000);
	});
});
