/* Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved. */
/* SPDX-License-Identifier: MIT-0 */

import { faker } from "@faker-js/faker";

import { Viewport } from "../support/constants";

describe("Tracker", () => {
	context("Desktop view", () => {
		beforeEach(() => {
			cy.visitDomain(`${Cypress.env("WEB_DOMAIN")}/demo`);
			cy.connectAwsAccount(Viewport.DESKTOP);
		});

		it("TR-001 - should allow user to add a tracker and the user should see the notifications for Geofence enter and exit events", () => {
			const geofenceName = faker.random.word();
			cy.addTrackerAndGeofenceEnterExit(Viewport.DESKTOP, geofenceName);
		});
	});

	context("Responsive view", () => {
		beforeEach(() => {
			cy.visitDomainInResponsiveView(`${Cypress.env("WEB_DOMAIN")}/demo`);
			cy.connectAwsAccount(Viewport.RESPONSIVE);
		});

		it("TR-002 - should allow user to add a tracker and the user should see the notifications for Geofence enter and exit events", () => {
			const geofenceName = faker.random.word();
			cy.addTrackerAndGeofenceEnterExit(Viewport.RESPONSIVE, geofenceName);
		});
	});
});
