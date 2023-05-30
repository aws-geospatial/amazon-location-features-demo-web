/* Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved. */
/* SPDX-License-Identifier: MIT-0 */

describe("Switch data provider and map styles", () => {
	beforeEach(() => {
		cy.visitDomain(Cypress.env("WEB_DOMAIN"));
	});

	it("should allow user to switch between map styles from right side menu", { scrollBehavior: false }, () => {
		cy.get('[data-testid="map-styles-button"]').click();

		cy.get('[data-testid="map-data-provider-esri"]').should("have.class", "selected-map-data-provider");
		cy.get('[data-testid="map-style-item-Streets"]').click();
		cy.wait(5000);
		cy.get('[data-testid="map-style-item-Streets"]').should("have.class", "selected");

		cy.get('[data-testid="map-data-provider-here"]').click();
		cy.get('[data-testid="map-data-provider-here"]').should("have.class", "selected-map-data-provider");
		cy.get('[data-testid="map-style-item-Contrast"]').click();
		cy.wait(5000);
		cy.get('[data-testid="map-style-item-Contrast"]').should("have.class", "selected");

		cy.get('[data-testid="map-data-provider-grab"]').click();
		cy.get('[data-testid="confirmation-button"]').click();
		cy.wait(5000);
		cy.get('[data-testid="map-data-provider-grab"]').should("have.class", "selected-map-data-provider");
		cy.get('[data-testid="map-style-item-Dark"]').click();
		cy.wait(5000);
		cy.get('[data-testid="map-style-item-Dark"]').should("have.class", "selected");
	});
});
