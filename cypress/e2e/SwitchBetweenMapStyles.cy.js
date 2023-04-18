/* Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved. */
/* SPDX-License-Identifier: MIT-0 */
/// <reference types="cypress" />

//STR
// 1-Go to https://qa.amazonlocation.services/demo
// 2-User clicks on the map styles icon on the top right corner
// 3-I am on esri map style
// 4-I switch between light, streets, navigation, Dark Gray, Light Gray, and Imagery
// 5-I click on Here map style
// 6-I switch between explore, contrast, ExploreTruck, Imagery, and Hybrid
// 7-Verify User is able to switch between map styles from the right side menu

describe("Switch between map styles from right side menu", () => {
	it("authentication", { scrollBehavior: false }, () => {
		cy.visit(Cypress.env("URL"), {
			auth: {
				username: Cypress.env("USERNAME"),
				password: Cypress.env("PASSWORD")
			}
		});
		cy.wait(25000);
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
