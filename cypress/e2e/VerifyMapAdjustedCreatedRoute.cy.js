/* Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved. */
/* SPDX-License-Identifier: MIT-0 */
/// <reference types="cypress" />

//STR
// 1-Go to https://qa.amazonlocation.services/demo
// 2-User clicks on the route icon besides the search bar.
// 3-User enters auburn sydney to manly beach sydney in the route
// 4-Verify the map is adjusted to show the created route

describe("Verify that user can add his current location in one of routing fields", () => {
	it("authentication", { scrollBehavior: false }, () => {
		cy.visit(Cypress.env("URL"), {
			auth: {
				username: Cypress.env("USERNAME"),
				password: Cypress.env("PASSWORD")
			}
		});
		cy.wait(25000);
		cy.get('[class="amplify-flex icon outter-end-component"]').click();
		cy.wait(2000);
		cy.get('[placeholder="From"]').click().type("auburn sydney");
		cy.wait(2000);
		cy.contains("Auburn").click();
		cy.wait(2000);
		cy.get('[placeholder="To"]').click().type("manly beach sydney");
		cy.wait(2000);
		cy.contains("Manly Beach Pharmacy").click();
		cy.wait(2000);
		cy.get("div").should("contain", "Alice St, Auburn, Sydney, New South Wales, 2144, AUS");
		cy.wait(2000);
		cy.get("div").should("contain", "Darley Rd, Manly, Sydney, New South Wales, 2095, AUS");
		cy.wait(2000);
	});
});
