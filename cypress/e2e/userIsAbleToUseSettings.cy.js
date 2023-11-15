/* Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved. */
/* SPDX-License-Identifier: MIT-0 */

describe("Settings", () => {
	beforeEach(() => {
		cy.visitDomain(`${Cypress.env("WEB_DOMAIN")}/demo`);
		cy.get('[data-testid="hamburger-menu"]').click();
		cy.contains("Settings").click();
	});

	it("should allow user toggle default units for map", { scrollBehavior: false }, () => {
		cy.get('[data-testid="option-item-Units"]').click();
		cy.get('[data-testid="unit-imperial-radio"]').click({ force: true });
		cy.get('[data-testid="option-item-Units"]').contains("Imperial");
	});

	it.only("should allow user to select map data provider", { scrollBehavior: false }, () => {
		cy.get('[data-testid="option-item-Data provider"]').click();
		cy.get('[class="amplify-flex option-details-container"]').contains("Esri");
		cy.get('[class="amplify-flex option-details-container"]').contains("HERE");
		cy.get('[class="amplify-flex option-details-container"]').contains("GrabMaps");
		cy.get('[class="amplify-flex option-details-container"]').contains("OpenData");
		// cy.get('[data-testid="option-details-container"]').contains("Esri");
		// cy.get('[data-testid="option-details-container"]').contains("HERE");
		// cy.get('[data-testid="option-details-container"]').contains("GrabMaps");
		// cy.get('[data-testid="option-details-container"]').contains("OpenData");
	});

	it("should allow user to select map style", { scrollBehavior: false }, () => {
		cy.get('[data-testid="option-item-Map style"]').click();
		cy.contains("Streets").click();
		cy.get('[data-testid="option-item-Map style"]').contains("Streets");
	});

	it("should allow user to set default route options from settings", { scrollBehavior: false }, () => {
		cy.get('[data-testid="option-item-Default route options"]').click();
		cy.get("div").should("contain", "Avoid tolls");
		cy.get("div").should("contain", "Avoid ferries");
	});
});
