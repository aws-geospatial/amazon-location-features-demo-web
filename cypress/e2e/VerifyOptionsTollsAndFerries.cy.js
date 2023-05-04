/* Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved. */
/* SPDX-License-Identifier: MIT-0 */
/// <reference types="cypress" />

//STR
// 1-Go to https://qa.amazonlocation.services/demo
// 2-User opens settings
// 3-User clicks on Default route options
// 4-Verify User sees two route options( avoid tolls/ avoid ferries)

describe("Verify that we have two route options( avoid tolls/ avoid ferries)", () => {
	it("authentication", { scrollBehavior: false }, () => {
		cy.visit(Cypress.env("WEB_DOMAIN"), {
			auth: {
				username: Cypress.env("WEB_DOMAIN_USERNAME"),
				password: Cypress.env("WEB_DOMAIN_PASSWORD")
			}
		});
		cy.wait(20000);
		cy.get('[class="amplify-button amplify-field-group__control amplify-button--primary"]').click();
		cy.get('[id="Icon"]').click();
		cy.wait(2000);
		cy.contains("Settings").click();
		cy.wait(2000);
		cy.contains("Default route options").click();
		cy.wait(2000);
		cy.get("div").should("contain", "Avoid tolls");
		cy.wait(2000);
		cy.get("div").should("contain", "Avoid ferries");
		cy.wait(2000);
	});
});
