/* Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved. */
/* SPDX-License-Identifier: MIT-0 */
/// <reference types="cypress" />

//STR
// 1-Go to https://qa.amazonlocation.services/demo
// 2-User clicks on the route icon besides the search bar.
// 3-User enters from and to location. e.g. cloverdale perth to Kewdale Perth
// 4-Verify User sees estimated time and distance on the route list

describe("Verify that Estimated time and distance will be displayed on the route list ", () => {
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
		cy.get("div").should("contain", "81.02 km");
		cy.wait(2000);
		cy.get("div").should("contain", "1 hour");
		cy.wait(2000);
	});
});
