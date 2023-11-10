/* Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved. */
/* SPDX-License-Identifier: MIT-0 */

describe("Unauthorized users have limited permissions", () => {
	context("Desktop view", () => {
		beforeEach(() => {
			cy.visitDomain(`${Cypress.env("WEB_DOMAIN")}/demo`);
		});

		it("shouldn't allow unauth users to user tracker and geofence", { scrollBehavior: false }, () => {
			cy.get('[data-testid="hamburger-menu"]').click();
			cy.get('[data-testid="connect-aws-account-button"]').should("exist");
		});
	});

	context("Responsive view", () => {
		beforeEach(() => {
			cy.visitDomainResponsive(`${Cypress.env("WEB_DOMAIN")}/demo`);
			cy.expandBottomsheet();
		});

		it("shouldn't allow unauth users to user tracker and geofence", { scrollBehavior: false }, () => {
			// cy.get('[data-testid="connect-aws-account-button"]').should("exist");
			cy.contains("Connect to AWS").should("exist"); // TODO: remove after deployment to prod
		});
	});
});
