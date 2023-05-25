/* Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved. */
/* SPDX-License-Identifier: MIT-0 */

describe("Switch data provider and map styles", () => {
	beforeEach(() => {
		cy.visitDomain(Cypress.env("WEB_DOMAIN"));
	});

	it("should allow user to switch between map styles from right side menu", { scrollBehavior: false }, () => {
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
		cy.wait(3000);
		cy.contains("Contrast").click();
		cy.wait(5000);
		cy.contains("Explore Truck").click();
		cy.wait(5000);
		cy.contains("Hybrid").click();
		cy.wait(5000);
		cy.contains("Imagery").click();
	});
});
