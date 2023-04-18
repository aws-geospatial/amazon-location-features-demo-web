/* Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved. */
/* SPDX-License-Identifier: MIT-0 */
/// <reference types="cypress" />

//STR
// 1-Go to https://qa.amazonlocation.services/demo
// 2-User clicks on the route icon besides the search bar.
// 3-User enters from and to location.
// 4-User enters his current location in the from
// 5-User enters kewdale perth in the to
// 6-Verify User can add his current location in one of the routing fields

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
		cy.get('[placeholder="From"]').click();
		cy.wait(2000);
		cy.get('[class="amplify-text"]').click();
		cy.wait(2000);
		cy.get('[placeholder="To"]').click().type("Mecca");
		cy.wait(2000);
		cy.contains("Mecca").click();
		cy.wait(2000);
		cy.get("div").should("contain", "Ibrahim Al Khalil Road, Al Haram, Makkah, 24231, SAU");
		cy.wait(2000);
	});
});
