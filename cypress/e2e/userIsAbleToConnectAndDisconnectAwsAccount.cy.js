/* Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved. */
/* SPDX-License-Identifier: MIT-0 */

describe("Connecting and Disconnecting AWS account", () => {
	context("Desktop view", () => {
		beforeEach(() => {
			cy.visitDomainInDesktopView();
		});

		it("should allow user to connect, sign-in, sign-out and disconnect AWS account from sidebar", () => {
			cy.connectAwsAccountInDesktopView();
			cy.disconnectAwsAccountInDesktopView();
		});
	});

	context("Responsive view", () => {
		beforeEach(() => {
			cy.visitDomainInResponsiveView();
		});

		it.skip("should allow user to connect, sign-in, sign-out and disconnect AWS account from sidebar", () => {
			cy.expandBottomsheet();
			cy.connectAwsAccountInResponsiveView();
			cy.expandBottomsheet();
			cy.disconnectAwsAccountInResponsiveView();
		});
	});
});
