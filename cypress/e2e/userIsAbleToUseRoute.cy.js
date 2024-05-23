/* Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved. */
/* SPDX-License-Identifier: MIT-0 */

describe("Route", () => {
	context("Desktop view", () => {
		beforeEach(() => {
			cy.visitDomain(`${Cypress.env("WEB_DOMAIN")}/demo`);
			cy.get('[class="amplify-flex icon outter-end-component"]').click();
			cy.wait(2000);
		});
	
		it(
			"should allow user to perform a route search and is able to select current location if enabled",
			{ scrollBehavior: false },
			() => {
				cy.get('[placeholder="From"]').click();
				cy.get("div").should("contain", "Current location");
				cy.get('[placeholder="From"]').type("Empire State Building");
				cy.wait(2000);
				cy.contains("Empire State Building").click();
				cy.wait(2000);
				cy.get('[placeholder="To"]').click().type("Gramercy Park");
				cy.wait(2000);
				cy.contains("Gramercy Park").click();
				cy.wait(2000);
				cy.get('[class="mapboxgl-marker mapboxgl-marker-anchor-center"]').eq(0).should("be.visible");
				cy.wait(2000);
				cy.get('[class="mapboxgl-marker mapboxgl-marker-anchor-center"]').eq(1).should("be.visible");
			}
		);
	
		it("should allow user to swap the departure and destination addresses", { scrollBehavior: false }, () => {
			cy.get('[placeholder="From"]').type("Empire State Building");
			cy.wait(2000);
			cy.contains("Empire State Building").click();
			cy.wait(2000);
			cy.get('[placeholder="To"]').click().type("Gramercy Park");
			cy.wait(2000);
			cy.contains("Gramercy Park").click();
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

	context("Responsive view", () => {
		beforeEach(() => {
			cy.visitDomainInResponsiveView(`${Cypress.env("WEB_DOMAIN")}/demo`);
			cy.get('[data-testid="explore-button-container-Routes"]').click();
			cy.wait(2000);
		});
	
		it(
			"should allow user to perform a route search and is able to select current location if enabled",
			{ scrollBehavior: false },
			() => {
				cy.get('[placeholder="From"]').click();
				cy.get("div").should("contain", "Current location");
				cy.get('[placeholder="From"]').type("Empire State Building");
				cy.wait(2000);
				cy.contains("Empire State Building").click({force: true});
				cy.wait(2000);
				cy.get('[placeholder="To"]').click().type("Gramercy Park");
				cy.wait(2000);
				cy.contains("Gramercy Park").click({force: true});
				cy.wait(2000);
				cy.get('[class="mapboxgl-marker mapboxgl-marker-anchor-center"]').eq(0).should("be.visible");
				cy.wait(2000);
				cy.get('[class="mapboxgl-marker mapboxgl-marker-anchor-center"]').eq(1).should("be.visible");
			}
		);
	
		it("should allow user to swap the departure and destination addresses", { scrollBehavior: false }, () => {
			cy.get('[placeholder="From"]').type("Empire State Building");
			cy.wait(2000);
			cy.contains("Empire State Building").click({force: true});
			cy.wait(2000);
			cy.get('[placeholder="To"]').click().type("Gramercy Park");
			cy.wait(2000);
			cy.contains("Gramercy Park").click({force: true});
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
			cy.contains("Auburn").click({force: true});
			cy.wait(2000);
			cy.get('[placeholder="To"]').click().type("manly beach sydney");
			cy.wait(4000);
			cy.contains("Beach").click({force: true});
			cy.wait(2000);
			cy.get('[data-testid="more-action-icon-container"]').click();
			cy.wait(2000);
			cy.contains("Avoid tolls").click();
			cy.wait(2000);
			cy.get('[data-testid="bottomsheet-header-close-icon"]').click();
			cy.wait(3000);
		});
	
		it("should allow user to search for route with avoid ferry option", () => {
			cy.get('[placeholder="From"]').click().type("port fouad");
			cy.wait(2000);
			cy.contains("Port Fouad").click({force: true});
			cy.wait(2000);
			cy.get('[placeholder="To"]').click().type("port said");
			cy.wait(2000);
			cy.contains("Port Said").click({force: true});
			cy.wait(2000);
			cy.get('[data-testid="more-action-icon-container"]').click();
			cy.wait(2000);
			cy.contains("Avoid ferries").click();
			cy.wait(2000);
			cy.get('[data-testid="bottomsheet-header-close-icon"]').click();
			cy.wait(2000);
		});
	});
});
