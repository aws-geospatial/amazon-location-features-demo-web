/* Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved. */
/* SPDX-License-Identifier: MIT-0 */

import { faker } from "@faker-js/faker";

import { Viewport } from "../support/constants";

describe("Geofence", () => {
	context("Desktop view", () => {
		beforeEach(() => {
			cy.visitDomain(`${Cypress.env("WEB_DOMAIN")}/demo`);
			cy.connectAwsAccount(Viewport.DESKTOP);
		});

		it("GF-001 - should allow user to add, edit and delete geofence", () => {
			const geofenceName = faker.random.word();
			cy.addEditAndDeleteGeofence(Viewport.DESKTOP, geofenceName);
		});
	});

	context("Responsive view", () => {
		beforeEach(() => {
			cy.visitDomainInResponsiveView(`${Cypress.env("WEB_DOMAIN")}/demo`);
			cy.connectAwsAccount(Viewport.RESPONSIVE);
		});

		it("GF-002 - should allow user to add, edit and delete geofence", () => {
			const geofenceName = faker.random.word();
			cy.addEditAndDeleteGeofence(Viewport.RESPONSIVE, geofenceName);
		});
	});
});
