/* Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved. */
/* SPDX-License-Identifier: MIT-0 */
/// <reference types="cypress" />

//STR
// 1- Go to https://qa.amazonlocation.services/demo
// 2-User clicks on the search field
// 3-User search for a location e.g. “Kewdale”
// 4-Verify List of search results are displayed once User enters the location

describe("Verify that list of search results will be displayed once you enter the location that you are searching for", () => {
	it("authentication", { scrollBehavior: false }, () => {
		cy.visit(Cypress.env("URL"), {
			auth: {
				username: Cypress.env("USERNAME"),
				password: Cypress.env("PASSWORD")
			}
		});
		cy.wait(20000);
		cy.get('[placeholder="Search"]').click().type("Kewdale");
		cy.wait(5000);
		// cy.get("div").should("contain", "Kewdale");
		// cy.wait(2000);
		// cy.get("div").should("contain", "Kewdale");
		// cy.wait(2000);
		// cy.get("div").should("contain", "Kewdale Exhaust");
		// cy.wait(2000);
		// cy.get("div").should("contain", "Kewdale Mufflers");
		// cy.wait(2000);
		// cy.get("div").should("contain", "Kewdale Cad & Drafting Supplies");
		// cy.wait(2000);
		cy.get('[class="amplify-scrollview amplify-autocomplete__menu" ]').should("be.visible");
	});
});
