/* Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved. */
/* SPDX-License-Identifier: MIT-0 */
/// <reference types="cypress" />

//STR
// 1- Go to https://qa.amazonlocation.services/demo
// 2-Verify User can see his current location

describe("Verify that system is showing users current location", () => {
	it("authentication", { scrollBehavior: false }, () => {
		cy.visit(Cypress.env("WEB_DOMAIN"), {
			auth: {
				username: Cypress.env("WEB_DOMAIN_USERNAME"),
				password: Cypress.env("WEB_DOMAIN_PASSWORD")
			}
		});
		cy.wait(20000);
		cy.get('[class="amplify-button amplify-field-group__control amplify-button--primary"]').click();
		cy.get('[class="mapboxgl-user-location-dot mapboxgl-marker mapboxgl-marker-anchor-center"]').should("be.visible");
		cy.wait(2000);
	});
});
