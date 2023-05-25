/* Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved. */
/* SPDX-License-Identifier: MIT-0 */

describe("Sidebar", () => {
	it("should allow user to access the sidebar via hamburger menu", { scrollBehavior: false }, () => {
		cy.visitDomain(Cypress.env("WEB_DOMAIN"));
		cy.get('[id="Icon"]').click();
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
