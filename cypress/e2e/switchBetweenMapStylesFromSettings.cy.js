/* Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved. */
/* SPDX-License-Identifier: MIT-0 */
/// <reference types="cypress" />

//STR
// 1-Go to https://qa.amazonlocation.services/demo
// 2-I click on the hamburger menu
// 3-I open settings
// 4-I click on map styles
// 5-I am on esri map style
// 4-I switch between light, streets, navigation, Dark Gray, Light Gray, and Imagery
// 5-I click on Here map style
// 6-I switch between explore, contrast, ExploreTruck, Imagery, and Hybrid
// 7-Verify User is able to switch between map styles from the right side menu

describe("switch between map styles from settings", () => {
	it("authentication", { scrollBehavior: false }, () => {
		cy.visit(Cypress.env("URL"), {
			auth: {
				username: Cypress.env("USERNAME"),
				password: Cypress.env("PASSWORD")
			}
		});
		cy.wait(25000);
		cy.get('[id="Icon"]').click();
		cy.wait(2000);
		cy.contains("Settings").click();
		cy.wait(2000);
		cy.contains("Map style").click();
		cy.wait(2000);
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
		cy.contains("Explore").click();
		cy.wait(5000);
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
