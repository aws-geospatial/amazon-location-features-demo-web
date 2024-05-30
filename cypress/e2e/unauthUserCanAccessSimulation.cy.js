/* Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved. */
/* SPDX-License-Identifier: MIT-0 */

describe("Unauth Simulation", () => {
	context("Desktop view", () => {
		beforeEach(() => {
			cy.visitDomain(`${Cypress.env("WEB_DOMAIN")}/demo`);
		});
	
		it("US-001 - should allow user to use unauth simulation", () => {
			cy.useUnauthSimulation(false)
		});
	});

	context("Responsive view", () => {
		beforeEach(() => {
			cy.visitDomainInResponsiveView(`${Cypress.env("WEB_DOMAIN")}/demo`);
		});
	
		it("US-002 - should allow user to use unauth simulation", () => {
			cy.useUnauthSimulation(true)
		});
	});
});