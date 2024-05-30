/* Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved. */
/* SPDX-License-Identifier: MIT-0 */

import { faker } from "@faker-js/faker";

describe("Geofence", () => {
	context("Desktop view", () => {
		const geofenceName = faker.random.word();

		beforeEach(() => {
			cy.visitDomain(`${Cypress.env("WEB_DOMAIN")}/demo`);
			cy.connectAwsAccount(false);
		});
	
		it("GF-001 - should allow user to add, edit and delete geofence", () => {
			cy.addEditAndDeleteGeofence(false, geofenceName);
		});
	});

	context("Responsive view", () => {
		const geofenceName = faker.random.word();

		beforeEach(() => {
			cy.visitDomainInResponsiveView(`${Cypress.env("WEB_DOMAIN")}/demo`);
			cy.connectAwsAccount(true,);
		});
	
		it("GF-002 - should allow user to add, edit and delete geofence", () => {
			cy.addEditAndDeleteGeofence(true, geofenceName);
		});
	});
});
