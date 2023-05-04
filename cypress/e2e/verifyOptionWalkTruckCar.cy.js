/* Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved. */
/* SPDX-License-Identifier: MIT-0 */
/// <reference types="cypress" />

//STR
// 1-Go to https://qa.amazonlocation.services/demo
// 2-User clicks on the routing icon which is beside the search bar
// 3-Verify User sees the route options for Walk, Truck, and Car

describe("Verify that we have three route options - Walk, Truck and Car", () => {
	it("should authenticate login and verify travel mode elements", () => {
		cy.visit(Cypress.env("WEB_DOMAIN"), {
			auth: {
				username: Cypress.env("WEB_DOMAIN_USERNAME"),
				password: Cypress.env("WEB_DOMAIN_PASSWORD")
			}
		});
		cy.wait(20000);
		cy.get('[class="amplify-button amplify-field-group__control amplify-button--primary"]').click();
		cy.get('[class="amplify-flex icon outter-end-component"]').click().wait(3000);
		cy.get(".travel-mode").should("have.class", "selected");
		cy.get(".travel-mode").should("exist").and("have.length", 3);
	});
});
