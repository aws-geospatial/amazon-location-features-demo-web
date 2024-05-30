/* Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved. */
/* SPDX-License-Identifier: MIT-0 */

describe("Unauthorized users have limited permissions", () => {
	let awsAccountButtonLocator = '[data-testid="connect-aws-account-button"]';

	context("Desktop view", () => {
		it("UULP-001 - shouldn't allow unauth users to use tracker and geofence", { scrollBehavior: false }, () => {
			cy.visitDomain(`${Cypress.env("WEB_DOMAIN")}/demo`);
			cy.get('[data-testid="hamburger-menu"]').click();
			cy.get(awsAccountButtonLocator).should("exist");
		});
	});

	context("Responsive view", () => {
		it("UULP-002 - shouldn't allow unauth users to use tracker and geofence", { scrollBehavior: false }, () => {
			cy.visitDomainInResponsiveView(`${Cypress.env("WEB_DOMAIN")}/demo`);
			cy.openResponsiveMenu('[data-testid="bottomsheet"]');
			cy.get(awsAccountButtonLocator).should("exist");
		});
	});
});
