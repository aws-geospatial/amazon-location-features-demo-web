/* Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved. */
/* SPDX-License-Identifier: MIT-0 */

import { Viewport } from "../support/constants";

describe("Connecting and Disconnecting AWS account", () => {
	context("Desktop view", () => {
		beforeEach(() => {
			cy.visitDomain(`${Cypress.env("WEB_DOMAIN")}/demo`);
			cy.connectAwsAccount(Viewport.DESKTOP);
		});

		it("CDAA-001 - should allow user to connect, sign-in, sign-out and disconnect AWS account from sidebar", () => {
			cy.signOutAndDisconnectFromAwsAccount(Viewport.DESKTOP);
		});
	});

	context("Responsive view", () => {
		beforeEach(() => {
			cy.visitDomainInResponsiveView(`${Cypress.env("WEB_DOMAIN")}/demo`);
			cy.connectAwsAccount(Viewport.RESPONSIVE);
		});

		it("CDAA-002 - should allow user to connect, sign-in, sign-out and disconnect AWS account from sidebar", () => {
			cy.signOutAndDisconnectFromAwsAccount(Viewport.RESPONSIVE);
		});
	});
});
