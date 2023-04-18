/* Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved. */
/* SPDX-License-Identifier: MIT-0 */
/// <reference types="cypress" />

//STR
// 1- Go to https://qa.amazonlocation.services/demo
// 2-User clicks on the search field
// 3-User searches a location by category e.g.School
// 4-Verify user searches by categories

describe("Verify that user can search by categories ", () => {
	it("should authenticate with credentials and search for schools", () => {
		cy.visit(Cypress.env("URL"), {
			auth: {
				username: Cypress.env("USERNAME"),
				password: Cypress.env("PASSWORD")
			}
		});
		cy.wait(20000);
		cy.get('[placeholder="Search"]').click().type("School").wait(5000).type("{enter}");
		cy.wait(5000);
		for (let i = 1; i <= 5; i++) {
			cy.get('[class="mapboxgl-marker mapboxgl-marker-anchor-center"]').eq(i).should("be.visible");
			cy.wait(500);
		}
	});
});
