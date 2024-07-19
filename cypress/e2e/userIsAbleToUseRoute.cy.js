/* Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved. */
/* SPDX-License-Identifier: MIT-0 */

import { Viewport } from "../support/constants";

describe("Route", () => {
	context("Desktop view", () => {
		beforeEach(() => {
			cy.visitDomain(`${Cypress.env("WEB_DOMAIN")}/demo`);
			cy.reload();
			cy.wait(10000);
			cy.get('[class="amplify-flex icon outter-end-component"]').click();
			cy.wait(2000);
		});

		it(
			"R-001 - should allow user to perform a route search and is able to select current location if enabled",
			{ scrollBehavior: false },
			() => {
				cy.searchRouteAndSelectCurrentLocation();
			}
		);

		it("R-002 - should allow user to swap the departure and destination addresses", { scrollBehavior: false }, () => {
			cy.swapDepartureAndDestinationAddresses();
		});

		it("R-003 - should allow user to select any of the route modes from car, walk and truck", () => {
			cy.canSelectAnyRouteMode();
		});

		it("R-004 - should allow user to search for route with avoid toll route option", () => {
			cy.searchRouteWithAvoidTollOption(Viewport.DESKTOP);
		});

		it("R-005 - should allow user to search for route with avoid ferry option", () => {
			cy.searchRouteWithAvoidFerryOption(Viewport.DESKTOP);
		});
	});

	context("Responsive view", () => {
		beforeEach(() => {
			cy.visitDomainInResponsiveView(`${Cypress.env("WEB_DOMAIN")}/demo`);
			cy.reload();
			cy.wait(10000);
			cy.get('[data-testid="explore-button-container-Routes"]').click();
			cy.wait(2000);
		});

		it(
			"R-006 - should allow user to perform a route search and is able to select current location if enabled",
			{ scrollBehavior: false },
			() => {
				cy.searchRouteAndSelectCurrentLocation();
			}
		);

		it("R-007 - should allow user to swap the departure and destination addresses", { scrollBehavior: false }, () => {
			cy.swapDepartureAndDestinationAddresses();
		});

		it("R-008 - should allow user to select any of the route modes from car, walk and truck", () => {
			cy.canSelectAnyRouteMode();
		});

		it("R-009 - should allow user to search for route with avoid toll route option", () => {
			cy.searchRouteWithAvoidTollOption(Viewport.RESPONSIVE);
		});

		it("R-010 - should allow user to search for route with avoid ferry option", () => {
			cy.searchRouteWithAvoidFerryOption(Viewport.RESPONSIVE);
		});
	});
});
