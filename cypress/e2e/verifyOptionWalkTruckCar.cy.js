/* Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved. */
/* SPDX-License-Identifier: MIT-0 */
/// <reference types="cypress" />

//STR
// 1-Go to https://qa.amazonlocation.services/demo
// 2-User clicks on the routing icon which is beside the search bar
// 3-Verify User sees the route options for Walk, Truck, and Car

describe("Verify that we have three route options - Walk, Truck and Car", () => {
	it("should authenticate login and verify travel mode elements", () => {
		cy.visit(Cypress.env("URL"), {
			auth: {
				username: Cypress.env("USERNAME"),
				password: Cypress.env("PASSWORD")
			}
		});
		cy.wait(25000);
		cy.get('[class="amplify-flex icon outter-end-component"]').click();
		cy.wait(3000);
		cy.get(".travel-mode").should("have.class", "selected");
		cy.wait(2000);
		cy.get(".travel-mode").should("exist");
		cy.wait(2000);
		cy.get(".travel-mode").should("exist");
		cy.wait(2000);
	});
});
