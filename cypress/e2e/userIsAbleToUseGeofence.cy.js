/* Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved. */
/* SPDX-License-Identifier: MIT-0 */

import { faker } from "@faker-js/faker";

const geofenceName = faker.random.word();

describe("Geofence", () => {
	context("Desktop view", () => {
		beforeEach(() => {
			cy.visitDomainInDesktopView();
			cy.connectAwsAccountInDesktopView();
		});

		it("should allow user to add, edit and delete geofence", () => {
			cy.get('[class="amplify-flex geofence-button"]').click();
			cy.wait(2000);
			cy.get('[placeholder="Enter address or coordinates"]').type("Rio Tinto Perth Western Australia");
			cy.wait(2000);
			cy.contains("Rio Tinto Operations Centre").click();
			cy.wait(5000);
			cy.get('[placeholder="Type unique Geofence Name"]').type(`${geofenceName}`);
			cy.wait(2000);
			cy.contains("Save").click();
			cy.wait(5000);
			cy.get("div").should("contain", `${geofenceName}`);
			cy.wait(2000);
			cy.contains(`${geofenceName}`).click({ force: true });
			cy.wait(2000);
			cy.contains("Save").should("be.disabled");
			cy.contains("Go Back").click();
			cy.wait(5000);
			cy.get(`[data-testid="icon-trash-${geofenceName}"]`).click({ force: true });
			cy.wait(5000);
			cy.get('[data-testid="geofences-list-container"]').should("not.contain", `${geofenceName}`);
			cy.wait(2000);
			cy.get('[data-testid="auth-geofence-box-close-button"]').click();
			cy.wait(2000);
			cy.disconnectAwsAccountInDesktopView();
		});
	});

	context("Responsive view", () => {
		beforeEach(() => {
			cy.visitDomainInResponsiveView();
			cy.expandBottomsheet();
			cy.connectAwsAccountInResponsiveView();
		});

		it("should allow user to add, edit and delete geofence", () => {
			cy.get('[data-testid="explore-button-container-Geofences"]').click();
			cy.wait(2000);
			cy.get('[data-testid="add-geofence-button-container-mobile"]').click();
			cy.wait(2000);
			cy.get('[placeholder="Enter address or coordinates"]').type("Rio Tinto Perth Western Australia");
			cy.wait(2000);
			cy.contains("Rio Tinto Operations Centre").click();
			cy.wait(5000);
			cy.get('[placeholder="Type unique Geofence Name"]').type(`${geofenceName}`);
			cy.wait(2000);
			cy.contains("Save").click();
			cy.wait(5000);
			cy.get("div").should("contain", `${geofenceName}`);
			cy.wait(2000);
			cy.contains(`${geofenceName}`).click({ force: true });
			cy.wait(2000);
			cy.contains("Save").should("be.disabled");
			cy.get('[data-testid="bottomsheet-header-close-icon"]').click();
			cy.wait(5000);
			cy.get(`[data-testid="icon-trash-${geofenceName}"]`).click({ force: true });
			cy.wait(5000);
			cy.get('[data-testid="geofences-list-container"]').should("not.contain", `${geofenceName}`);
			cy.wait(2000);
			cy.get('[data-testid="bottomsheet-header-close-icon"]').click();
			cy.wait(2000);
			cy.disconnectAwsAccountInResponsiveView();
		});
	});
});
