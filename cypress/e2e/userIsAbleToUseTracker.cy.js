/* Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved. */
/* SPDX-License-Identifier: MIT-0 */
import { faker } from "@faker-js/faker";

const geofenceName = faker.random.word();

describe("Tracker", () => {
	context("Desktop view", () => {
		beforeEach(() => {
			cy.visitDomain(`${Cypress.env("WEB_DOMAIN")}/demo`);
			cy.connectAwsAccount(false);
		});
	
		it("TR-001 - should allow user to add a tracker and the user should see the notifications for Geofence enter and exit events", () => {
			cy.addTrackerAndGeofenceEnterExit(false, geofenceName);
		});
	});

	context("Responsive view", () => {
		beforeEach(() => {
			cy.visitDomainInResponsiveView(`${Cypress.env("WEB_DOMAIN")}/demo`);
			cy.connectAwsAccount(true);
		});
	
		it("TR-002 - should allow user to add a tracker and the user should see the notifications for Geofence enter and exit events", () => {
			cy.addTrackerAndGeofenceEnterExit(true, geofenceName)
		});
	});
});
