/* Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved. */
/* SPDX-License-Identifier: MIT-0 */
/// <reference types="cypress" />

//STR
// 1- Go to https://qa.amazonlocation.services/demo
// 2-User clicks on the search field
// 3-I search for a location e.g. “Rio Tinto”
// 4-Verify user sees 5 suggestions

describe("Verify that once you start typing a text inside search box you will get five suggestions", () => {
	it("authentication", { scrollBehavior: false }, () => {
		cy.visit(Cypress.env("URL"), {
			auth: {
				username: Cypress.env("USERNAME"),
				password: Cypress.env("PASSWORD")
			}
		});
		cy.wait(25000);
		cy.get('[placeholder="Search"]').click().type("Rio Tinto");
		cy.wait(5000);
		cy.get("div").should("contain", "Rio Tinto");
		cy.wait(2000);
		cy.get("div").should("contain", "Rio Tinto");
		cy.wait(2000);
		cy.get("div").should("contain", "Rio Tinto");
		cy.wait(2000);
		cy.get("div").should("contain", "Rio Tinto");
		cy.wait(2000);
		cy.get("div").should("contain", "Rio Tinto");
		cy.wait(2000);
	});
});
