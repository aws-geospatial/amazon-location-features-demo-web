/* Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved. */
/* SPDX-License-Identifier: MIT-0 */

describe("Route", () => {
	beforeEach(() => {
		cy.visitDomain(Cypress.env("WEB_DOMAIN"))
		cy.get('[class="amplify-button amplify-field-group__control amplify-button--primary"]').click();
		cy.get('[class="amplify-flex icon outter-end-component"]').click();
		cy.wait(2000);
	});

	it(
		"should allow user to perform a route search and is able to select current location if enabled",
		{ scrollBehavior: false },
		() => {
			cy.get('[placeholder="From"]').click();
			cy.get("div").should("contain", "Current location");
			cy.get('[placeholder="From"]').type("40.7485492, -73.9879522");
			cy.wait(2000);
			cy.contains("Nycomputers, 1270 Broadway, New York, NY, 10001, USA").click();
			cy.wait(2000);
			cy.get('[placeholder="To"]').click().type("40.737941, -73.9881014");
			cy.wait(2000);
			cy.contains("232-250 Park Ave S, New York, NY, 10003, USA").click();
			cy.wait(2000);
			cy.get('[class="mapboxgl-marker mapboxgl-marker-anchor-center"]').eq(0).should("be.visible");
			cy.wait(2000);
			cy.get('[class="mapboxgl-marker mapboxgl-marker-anchor-center"]').eq(1).should("be.visible");
		}
	);

	it("should allow user to swap the departure and destination addresses", { scrollBehavior: false }, () => {
		cy.get('[placeholder="From"]').type("40.7485492, -73.9879522");
		cy.wait(2000);
		cy.contains("Nycomputers, 1270 Broadway, New York, NY, 10001, USA").click();
		cy.wait(2000);
		cy.get('[placeholder="To"]').click().type("40.737941, -73.9881014");
		cy.wait(2000);
		cy.contains("232-250 Park Ave S, New York, NY, 10003, USA").click();
		cy.wait(2000);
		cy.get('[class="mapboxgl-marker mapboxgl-marker-anchor-center"]').eq(0).should("be.visible");
		cy.wait(2000);
		cy.get('[class="mapboxgl-marker mapboxgl-marker-anchor-center"]').eq(1).should("be.visible");
		cy.wait(2000);
		cy.get('[class="amplify-flex swap-icon-container"]').click();
		cy.wait(2000);
		cy.get('[class="mapboxgl-marker mapboxgl-marker-anchor-center"]').eq(0).should("be.visible");
		cy.wait(2000);
		cy.get('[class="mapboxgl-marker mapboxgl-marker-anchor-center"]').eq(1).should("be.visible");
		cy.wait(2000);
		cy.get('[class="amplify-flex swap-icon-container"]').click();
	});

	it("should allow user to select any of the route modes from car, walk and truck", () => {
		cy.get(".travel-mode").should("have.class", "selected");
		cy.get(".travel-mode").should("exist").and("have.length", 3);
	});

	it("should allow user to search for route with avoid toll route option", () => {
		cy.get('[placeholder="From"]').click().type("auburn sydney");
		cy.wait(4000);
		cy.contains("Auburn").click();
		cy.wait(2000);
		cy.get('[placeholder="To"]').click().type("manly beach sydney");
		cy.wait(4000);
		cy.contains("Beach").click();
		cy.wait(2000);
		cy.contains("Route Options").click();
		cy.wait(2000);
		cy.contains("Avoid tolls").click();
		cy.wait(2000);
		cy.get('[class="route-card-close"]').click();
		cy.wait(3000);
	});

	it("should allow user to search for route with avoid ferry option", () => {
		cy.get('[placeholder="From"]').click().type("port fouad");
		cy.wait(2000);
		cy.contains("Port Fouad").click();
		cy.wait(2000);
		cy.get('[placeholder="To"]').click().type("port said");
		cy.wait(2000);
		cy.contains("Port Said").click();
		cy.wait(2000);
		cy.contains("Route Options").click();
		cy.wait(2000);
		cy.contains("Avoid ferries").click();
		cy.wait(2000);
		cy.get('[class="route-card-close"]').click();
		cy.wait(2000);
	});
});
