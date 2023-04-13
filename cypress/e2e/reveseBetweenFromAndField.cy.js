/* Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved. */
/* SPDX-License-Identifier: MIT-0 */
/// <reference types="cypress" />

//STR
// 1-Go to https://qa.amazonlocation.services/demo
// 2-User click on route icon
// 3-User select origin point
// 4-User select destination point
// 5-User can see the selected route on the Map
// 6-Verify User clicks on reverse icon and it changes the origin point to destination and destination point to origin

describe("Verify that user can revese between From field and to field", () => {
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
		cy.get('[placeholder="To"]').click().type("Coffee Rawad");
		cy.wait(2000);
		cy.contains("Coffee Rawad").click();
		cy.wait(2000);
		cy.get('[class="amplify-text regular-text"]').should("have.text", "14 minutes");
		cy.wait(2000);
		cy.get('[class="amplify-flex swap-icon-container"]').click();
		cy.wait(2000);
		cy.get('[class="amplify-text regular-text"]').should("have.text", "19 minutes");
		cy.wait(2000);
		cy.get('[class="amplify-flex swap-icon-container"]').click();
	});
});
