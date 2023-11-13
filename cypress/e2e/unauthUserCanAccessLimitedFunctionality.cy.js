/* Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved. */
/* SPDX-License-Identifier: MIT-0 */

describe("Unauthorized users have limited permissions", () => {
	context("Desktop view", () => {
		beforeEach(() => {
			cy.visitDomainInDesktopView();
		});

		it("shouldn't allow unauth users to user tracker and geofence", { scrollBehavior: false }, () => {
			cy.get('[data-testid="hamburger-menu"]').click();
			cy.get('[data-testid="connect-aws-account-button"]').should("exist");
		});
	});

	context("Responsive view", () => {
		beforeEach(() => {
			cy.visitDomainInResponsiveView();
			cy.expandBottomsheet();
		});

		it.skip("shouldn't allow unauth users to user tracker and geofence", { scrollBehavior: false }, () => {
			cy.get('[data-testid="connect-aws-account-button"]').should("exist");
		});
	});
});
