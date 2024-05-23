/* Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved. */
/* SPDX-License-Identifier: MIT-0 */

describe("Unauthorized users have limited permissions", () => {
	context("Desktop view", () => {
		it("shouldn't allow unauth users to user tracker and geofence", { scrollBehavior: false }, () => {
			cy.visitDomain(`${Cypress.env("WEB_DOMAIN")}/demo`);
			cy.get('[data-testid="hamburger-menu"]').click();
			cy.get('[data-testid="connect-aws-account-button"]').should("exist");
		});
	});

	context("Responsive view", () => {
		it("shouldn't allow unauth users to user tracker and geofence", { scrollBehavior: false }, () => {
			cy.visitDomainInResponsiveView(`${Cypress.env("WEB_DOMAIN")}/demo`);
			cy.openResponsiveMenu('[data-testid="bottomsheet"]')
			cy.get('[data-testid="connect-aws-account-button"]').should("exist");
		});
	});
});
