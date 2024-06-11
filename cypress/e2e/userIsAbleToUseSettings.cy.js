/* Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved. */
/* SPDX-License-Identifier: MIT-0 */

import { Viewport } from "../support/constants";

describe("Settings", () => {
	context("Desktop view", () => {
		beforeEach(() => {
			cy.visitDomain(`${Cypress.env("WEB_DOMAIN")}/demo`);
			cy.get('[data-testid="hamburger-menu"]').click();
			cy.contains("Settings").click();
		});

		it("ST-001 - should allow user toggle default units for map", { scrollBehavior: false }, () => {
			cy.toggleDefaultUnitsForMap(Viewport.DESKTOP);
		});

		it("ST-002 - should allow user to select map data provider", { scrollBehavior: false }, () => {
			cy.selectMapDataProvider();
		});

		it("ST-003 - should allow user to select map style", { scrollBehavior: false }, () => {
			cy.selectMapStyle(Viewport.DESKTOP);
		});

		it("ST-004 - should allow user to set default route options from settings", { scrollBehavior: false }, () => {
			cy.checkDefaultRouteOptions();
		});
	});

	context("Responsive view", () => {
		beforeEach(() => {
			cy.visitDomainInResponsiveView(`${Cypress.env("WEB_DOMAIN")}/demo`);
			cy.openResponsiveMenu('[data-testid="bottomsheet"]');
			cy.contains("Settings").click();
		});

		it("ST-005 - should allow user toggle default units for map", { scrollBehavior: false }, () => {
			cy.toggleDefaultUnitsForMap(Viewport.RESPONSIVE);
		});

		it("ST-006 - should allow user to select map data provider", { scrollBehavior: false }, () => {
			cy.selectMapDataProvider();
		});

		it("ST-007 - should allow user to select map style", { scrollBehavior: false }, () => {
			cy.selectMapStyle(Viewport.RESPONSIVE);
		});

		it("ST-008 - should allow user to set default route options from settings", { scrollBehavior: false }, () => {
			cy.checkDefaultRouteOptions();
		});
	});
});
