/* Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved. */
/* SPDX-License-Identifier: MIT-0 */

describe("Switch data provider and map styles", () => {
	context("Desktop view", () => {
		beforeEach(() => {
			cy.visitDomain(`${Cypress.env("WEB_DOMAIN")}/demo`);
		});
	
		it("MSS-001 - should allow user to view and switch between map styles from right side menu", { scrollBehavior: false }, () => {
			cy.switchBetweenMapStyles(false);
		});
	});

	context("Responsive view", () => {
		beforeEach(() => {
			cy.visitDomainInResponsiveView(`${Cypress.env("WEB_DOMAIN")}/demo`);
		});
	
		it("MSS-002 - Should allow user to view and switch between map styles from right side menu", { scrollBehavior: false }, () => {
			cy.switchBetweenMapStyles(true);
		});
	});
});
