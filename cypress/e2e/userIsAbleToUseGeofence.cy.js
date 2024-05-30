/* Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved. */
/* SPDX-License-Identifier: MIT-0 */

import { faker } from "@faker-js/faker";

import { Viewport } from "../support/constants";

describe("Geofence", () => {
	context("Desktop view", () => {
		const geofenceName = faker.random.word();

		beforeEach(() => {
			cy.visitDomain(`${Cypress.env("WEB_DOMAIN")}/demo`);
			cy.connectAwsAccount(Viewport.DESKTOP);
		});

		it("GF-001 - should allow user to add, edit and delete geofence", () => {
			cy.addEditAndDeleteGeofence(Viewport.DESKTOP, geofenceName);
		});
	});

	context("Responsive view", () => {
		const geofenceName = faker.random.word();

		beforeEach(() => {
			cy.visitDomainInResponsiveView(`${Cypress.env("WEB_DOMAIN")}/demo`);
			cy.connectAwsAccount(Viewport.RESPONSIVE);
		});

		it("GF-002 - should allow user to add, edit and delete geofence", () => {
			cy.addEditAndDeleteGeofence(Viewport.RESPONSIVE, geofenceName);
		});
	});
});
