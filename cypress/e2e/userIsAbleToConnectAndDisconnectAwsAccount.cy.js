/* Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved. */
/* SPDX-License-Identifier: MIT-0 */

describe("Connecting and Disconnecting AWS account", () => {
	context("Desktop view", () => {
		beforeEach(() => {
			cy.visitDomain(`${Cypress.env("WEB_DOMAIN")}/demo`);
			cy.connectAwsAccount(false);
		});
	
		it("CDAA-001 - should allow user to connect, sign-in, sign-out and disconnect AWS account from sidebar", () => {
			cy.signOutAndDisconnectFromAwsAccount(false);
		});
	});

	context("Responsive view", () => {
		beforeEach(() => {
			cy.visitDomainInResponsiveView(`${Cypress.env("WEB_DOMAIN")}/demo`);
			cy.connectAwsAccount(true);
		});
	
		it("CDAA-002 - should allow user to connect, sign-in, sign-out and disconnect AWS account from sidebar", () => {
			cy.signOutAndDisconnectFromAwsAccount(true);
		});
	});
});
