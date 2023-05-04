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
		cy.visit(Cypress.env("WEB_DOMAIN"), {
			auth: {
				username: Cypress.env("WEB_DOMAIN_USERNAME"),
				password: Cypress.env("WEB_DOMAIN_PASSWORD")
			}
		});
		cy.wait(20000);
		cy.get('[class="amplify-button amplify-field-group__control amplify-button--primary"]').click();
		cy.get('[class="amplify-flex icon outter-end-component"]').click();
		cy.wait(2000);
		cy.get('[placeholder="From"]').type("40.7485492, -73.9879522");
		cy.wait(2000);
		cy.contains("Nycomputers, 1270 Broadway, New York, NY, 10001, USA").click();
		cy.wait(2000);
		cy.get('[placeholder="To"]').click().type("40.737941, -73.9881014");
		cy.wait(2000);
		cy.contains("232-250 Park Ave S, New York, NY, 10003, USA").click();
		cy.wait(2000);
		cy.get('[class="mapboxgl-marker mapboxgl-marker-anchor-center"]').eq(0).should("be.visible");
		cy.wait(2000);
		cy.get('[class="mapboxgl-marker mapboxgl-marker-anchor-center"]').eq(1).should("be.visible");
		cy.wait(2000);
	});
});
