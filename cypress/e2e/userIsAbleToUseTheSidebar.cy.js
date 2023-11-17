/* Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved. */
/* SPDX-License-Identifier: MIT-0 */

describe("Sidebar", () => {
	context("Desktop view", () => {
		beforeEach(() => {
			cy.visitDomainInDesktopView();
		});

		it("should allow user to access the sidebar via hamburger menu", { scrollBehavior: false }, () => {
			cy.get('[data-testid="hamburger-menu"]').click();
			cy.wait(2000);
			cy.get("div").should("contain", "Demo");
			cy.wait(500);
			cy.get("div").should("contain", "Geofence");
			cy.wait(500);
			cy.get("div").should("contain", "Tracker");
			cy.wait(500);
			cy.get("div").should("contain", "Settings");
			cy.wait(500);
			cy.get("div").should("contain", "About");
			cy.wait(500);
			cy.get("div").should("contain", "Overview");
			cy.wait(500);
			cy.get("div").should("contain", "Samples");
			cy.wait(2000);
		});
	});

	context("Responsive view", () => {
		beforeEach(() => {
			cy.visitDomainInResponsiveView();
			cy.expandBottomsheet();
		});

		it("should allow user to access the sidebar via hamburger menu", { scrollBehavior: false }, () => {
			cy.get("div").should("contain", "Routes");
			cy.wait(500);
			cy.get("div").should("contain", "Map style");
			cy.wait(500);
			cy.get("div").should("contain", "Trackers");
			cy.wait(500);
			cy.get("div").should("contain", "Geofences");
			cy.wait(500);
			cy.get("div").should("contain", "Overview");
			cy.wait(500);
			cy.get("div").should("contain", "Samples");
			cy.wait(500);
			cy.get("div").should("contain", "Settings");
			cy.wait(500);
			cy.get("div").should("contain", "About");
			cy.wait(2000);
		});
	});
});
