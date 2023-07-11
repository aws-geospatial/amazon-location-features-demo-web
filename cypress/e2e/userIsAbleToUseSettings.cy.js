/* Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved. */
/* SPDX-License-Identifier: MIT-0 */

describe("Settings", () => {
	beforeEach(() => {
		cy.visitDomain(`${Cypress.env("WEB_DOMAIN")}/demo`);
		cy.get('[id="Icon"]').click();
		cy.contains("Settings").click();
	});

	it("should allow user toggle default units for map", { scrollBehavior: false }, () => {
		cy.get('[data-testid="option-item-Units"]').click();
		cy.get('[data-testid="unit-imperial-radio"]').click({ force: true });
		cy.get('[data-testid="option-item-Units"]').contains("Imperial");
	});

	it("should allow user to select map data provider", { scrollBehavior: false }, () => {
		cy.get('[data-testid="option-item-Data provider"]').click();
		cy.get('[data-testid="data-provider-here-radio"]').click({ force: true });
		cy.get('[data-testid="option-item-Data provider"]').contains("HERE");
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
