/* Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved. */
/* SPDX-License-Identifier: MIT-0 */
/// <reference types="cypress" />

//STR
// 1- Go to https://qa.amazonlocation.services/demo
// 2-Verify User can see his current location

describe("Verify that system is showing users current location", () => {
	it("authentication", { scrollBehavior: false }, () => {
		cy.visit(Cypress.env("URL"), {
			auth: {
				username: Cypress.env("USERNAME"),
				password: Cypress.env("PASSWORD")
			}
		});
		cy.wait(25000);
		cy.get('[class="mapboxgl-user-location-accuracy-circle mapboxgl-marker mapboxgl-marker-anchor-center"]').click({
			force: true
		});
		cy.wait(2000);
		cy.get('[class="amplify-text amplify-text--tertiary"]').should("have.text", "SAU");
		cy.wait(2000);
	});
});
