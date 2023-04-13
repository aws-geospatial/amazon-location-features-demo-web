/* Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved. */
/* SPDX-License-Identifier: MIT-0 */
/// <reference types="cypress" />

//STR
// 1- Go to https://qa.amazonlocation.services/demo
// 2-I click on search bar
// 3-Verify User can search any location without any need to connect to AWS
// 4-Verify User can navigate on the map without any need to connect to AWS
// 5-I click on the map styles icon
// 6-Verify User can change map styles without any need to connect to AWS

describe("Verify that user can navigate on map or search or do routing or change map style without any need to connect to AWs", () => {
	it("authentication", { scrollBehavior: false }, () => {
		cy.visit(Cypress.env("URL"), {
			auth: {
				username: Cypress.env("USERNAME"),
				password: Cypress.env("PASSWORD")
			}
		});
		cy.wait(25000);
		cy.get('[placeholder="Search"]').click().type("Coffee").wait(5000).type("{enter}");
		cy.wait(10000);
		cy.get(".map-styles-button > svg").click();
		cy.wait(3000);
		cy.contains("Streets").click();
		cy.wait(5000);
		cy.contains("Navigation").click();
		cy.wait(5000);
		cy.contains("Dark Gray").click();
		cy.wait(5000);
		cy.contains("Light Gray").click();
		cy.wait(5000);
		cy.contains("Imagery").click();
		cy.wait(5000);
		cy.get('[type="radio"]').check({ force: true });
		cy.wait(2000);
		cy.get(".map-styles-button > svg").click();
		cy.wait(3000);
		cy.contains("Explore").click();
		cy.wait(3000);
		cy.contains("Contrast").click();
		cy.wait(5000);
		cy.contains("Explore Truck").click();
		cy.wait(5000);
		cy.contains("Hybrid").click();
		cy.wait(5000);
		cy.contains("Imagery").click();
		cy.wait(5000);
	});
});
