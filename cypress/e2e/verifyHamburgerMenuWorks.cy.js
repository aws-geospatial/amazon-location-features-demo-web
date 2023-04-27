/* Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved. */
/* SPDX-License-Identifier: MIT-0 */
/// <reference types="cypress" />

//STR
// 1-Go to https://qa.amazonlocation.services/demo
// 2-User can see hamburger menu
// 3-User clicks on the hamburger menu
// 4-Verify User is able to see demo, geofence, tracker, settings, more, overview, product, and samples

describe("Verify that we have Side menu displayed as a humbrger menu, and it works fine", () => {
	it("authentication", { scrollBehavior: false }, () => {
		cy.visit(Cypress.env("URL"), {
			auth: {
				username: Cypress.env("USERNAME"),
				password: Cypress.env("PASSWORD")
			}
		});
		cy.wait(20000);
		cy.get('[id="Icon"]').click();
		cy.wait(2000);
		cy.get("div").should("contain", "Demo");
		cy.wait(500);
		cy.get("div").should("contain", "Geofence");
		cy.wait(500);
		cy.get("div").should("contain", "Tracker");
		cy.wait(500);
		cy.get("div").should("contain", "Settings");
		cy.wait(500);
		cy.get("div").should("contain", "More");
		cy.wait(500);
		cy.get("div").should("contain", "Overview");
		cy.wait(500);
		// cy.get("div").should("contain", "Product");
		// cy.wait(2000);
		cy.get("div").should("contain", "Samples");
		cy.wait(2000);
	});
});
