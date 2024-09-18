/* Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved. */
/* SPDX-License-Identifier: MIT-0 */

describe("Sidebar", () => {
	context("Desktop view", () => {
		it("SB-001 - should allow user to access the sidebar via hamburger menu", { scrollBehavior: false }, () => {
			cy.visitDomain(`${Cypress.env("WEB_DOMAIN")}/demo`);
			cy.get('[data-testid="hamburger-menu"]').click();
			cy.get("div")
				.should("contain", "Samples")
				.and("contain", "Migration")
				.and("contain", "Overview")
				.and("contain", "Products")
				.and("contain", "Getting Started")
				.and("contain", "Pricing")
				.and("contain", "FAQs")
				.and("contain", "Industry")
				.and("contain", "Resources");
		});
	});

	context("Responsive view", () => {
		it(
			"SB-002 - should allow user to access the Bottom Sheet (sidebar) in responsive menu",
			{ scrollBehavior: false },
			() => {
				cy.visitDomainInResponsiveView(`${Cypress.env("WEB_DOMAIN")}/demo`);
				cy.openResponsiveMenu('[data-testid="bottomsheet"]');
				cy.get('[data-testid="explore-button-container-Map style"]').should("contain", "Map style");
				cy.get('[data-testid="explore-button-container-Routes"]').should("contain", "Routes");
				cy.get('[data-testid="explore-button-container-Geofences"]').should("contain", "Geofences");
				cy.get('[data-testid="explore-button-container-Trackers"]').should("contain", "Tracker");
				cy.get('[data-testid="iconic-info-card-title"]')
					.should("contain", "Samples")
					.and("contain", "Migration")
					.and("contain", "Settings")
					.and("contain", "About")
					.and("contain", "Provide Feedback")
					.and("contain", "Overview")
					.and("contain", "Products")
					.and("contain", "Getting Started")
					.and("contain", "Pricing")
					.and("contain", "FAQs")
					.and("contain", "Industry")
					.and("contain", "Resources");
			}
		);
	});
});
