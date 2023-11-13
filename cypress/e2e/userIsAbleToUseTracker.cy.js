/* Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved. */
/* SPDX-License-Identifier: MIT-0 */
import { faker } from "@faker-js/faker";

const geofenceName = faker.random.word();

describe("Tracker", () => {
	context("Desktop view", () => {
		beforeEach(() => {
			cy.visitDomainInDesktopView();
			cy.connectAwsAccountInDesktopView();
		});

		it("should allow user to add a tracker and the user should see the notifications for Geofence enter and exit events", () => {
			cy.get('[class="amplify-flex geofence-button"]').click();
			cy.wait(5000);
			cy.get('[placeholder="Enter address or coordinates"]').type("Empire State Building");
			cy.wait(5000);
			cy.contains("Empire State Building").click();
			cy.wait(5000);
			cy.get('[placeholder="Type unique Geofence Name"]').type(`${geofenceName}`);
			cy.wait(5000);
			cy.contains("Save").click();
			cy.wait(5000);
			cy.get("div").should("contain", `${geofenceName}`);
			cy.wait(1000);
			cy.get('[data-testid="auth-geofence-box-close-button"]').click();
			cy.wait(5000);
			cy.get('[data-testid="hamburger-menu"]').click();
			cy.wait(5000);
			cy.contains("Tracker").click();
			cy.wait(5000);
			cy.contains("Continue").click();
			cy.wait(5000);
			cy.get('[class="mapboxgl-canvas"]').click("left", { force: true });
			cy.wait(5000);
			cy.get('[class="mapboxgl-canvas"]').click("right", { force: true });
			cy.wait(5000);
			cy.get('[class="mapboxgl-canvas"]').click("right", { force: true });
			cy.wait(5000);
			cy.contains("Save").click();
			cy.wait(5000);
			cy.get('[class="amplify-button amplify-field-group__control amplify-button--primary play-pause-button"]').click();
			cy.wait(5000);
			cy.get(
				'[class="Toastify__toast Toastify__toast-theme--dark Toastify__toast--info Toastify__toast--close-on-click enter-geofence"]',
				{ timeout: 50000 }
			)
				.should("be.visible")
				.click({ multiple: true, force: true });
			cy.get(
				'[class="Toastify__toast Toastify__toast-theme--dark Toastify__toast--info Toastify__toast--close-on-click exit-geofence"]',
				{ timeout: 50000 }
			)
				.should("be.visible")
				.click({ multiple: true, force: true });
			cy.wait(5000);
			cy.get('[data-testid="auth-tracker-box-close"]').click();
			cy.wait(5000);
			cy.get('[class="amplify-flex geofence-button"]').click();
			cy.wait(5000);
			cy.contains("Go Back").click();
			cy.wait(5000);
			cy.get(`[data-testid="icon-trash-${geofenceName}"]`).click({ force: true });
			cy.wait(5000);
			cy.get('[data-testid="geofences-list-container"]').should("not.contain", `${geofenceName}`);
			cy.wait(5000);
			cy.get('[data-testid="auth-geofence-box-close-button"]').click();
			cy.wait(5000);
			cy.disconnectAwsAccountInDesktopView();
		});
	});
});
