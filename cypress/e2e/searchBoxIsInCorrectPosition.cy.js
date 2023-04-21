/* Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved. */
/* SPDX-License-Identifier: MIT-0 */
/// <reference types="cypress" />

//STR
// 1- Go to https://qa.amazonlocation.services/demo
// 2-Verify the search box on the map is in the correct position

describe("Verify that search box is existing in the correct position", () => {
	it("authentication", { scrollBehavior: false }, () => {
		cy.visit(Cypress.env("URL"), {
			auth: {
				username: Cypress.env("USERNAME"),
				password: Cypress.env("PASSWORD")
			}
		});
		cy.wait(25000);
		cy.get('[placeholder="Search"]').should("be.visible");
		cy.wait(2000);
		cy.get('[class="amplify-label amplify-visually-hidden"]').should("have.text", "Search");
		cy.wait(2000);
		cy.get('[class="amplify-flex search-bar"]').trigger("mousemove", { clientX: 360, clientY: 40 });
		cy.wait(2000);
	});
});
