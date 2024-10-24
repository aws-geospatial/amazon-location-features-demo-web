Cypress.Commands.add("searchRouteAndSelectCurrentLocation", () => {
	cy.wait(20000);
	cy.get('[placeholder="From"]').click();
	cy.get("div").should("contain", "Current location");
	cy.get('[placeholder="From"]').type("Empire State Building", { delay: 200 });
	cy.contains("Empire State Building").click({ force: true });
	cy.wait(2000);
	cy.get('[placeholder="To"]').click().type("Gramercy Park", { delay: 200 });
	cy.contains("Gramercy Park").click({ force: true });
	cy.get('[class="maplibregl-marker maplibregl-marker-anchor-center"]').eq(0).should("be.visible");
	cy.get('[class="maplibregl-marker maplibregl-marker-anchor-center"]').eq(1).should("be.visible");
});

Cypress.Commands.add("swapDepartureAndDestinationAddresses", () => {
	cy.get('[placeholder="From"]').type("Empire State Building", { delay: 200 });
	cy.contains("Empire State Building").click({ force: true });
	cy.wait(2000);
	cy.get('[placeholder="To"]').click().type("Gramercy Park", { delay: 200 });
	cy.contains("Gramercy Park").click({ force: true });
	cy.wait(10000);
	cy.get('[class="maplibregl-marker maplibregl-marker-anchor-center"]').eq(0).should("be.visible");
	cy.get('[class="maplibregl-marker maplibregl-marker-anchor-center"]').eq(1).should("be.visible");
	cy.get('[class="amplify-flex swap-icon-container"]').click();
	cy.get('[class="maplibregl-marker maplibregl-marker-anchor-center"]').eq(0).should("be.visible");
	cy.get('[class="maplibregl-marker maplibregl-marker-anchor-center"]').eq(1).should("be.visible");
	cy.get('[class="amplify-flex swap-icon-container"]').click();
});

Cypress.Commands.add("canSelectAnyRouteMode", () => {
	cy.get(".travel-mode").should("have.class", "selected");
	cy.get(".travel-mode").should("exist").and("have.length", 4);
});

Cypress.Commands.add("searchRouteWithAvoidTollOption", isResponsive => {
	cy.get('[placeholder="From"]').click().type("auburn sydney", { delay: 200 });
	cy.contains("Auburn").click({ force: true });
	cy.wait(2000);
	cy.get('[placeholder="To"]').click().type("manly beach sydney", { delay: 200 });
	cy.contains("Beach").click({ force: true });
	isResponsive ? cy.get('[data-testid="more-action-icon-container"]').click() : cy.contains("Route Options").click();
	cy.contains("Avoid tolls").click();
	isResponsive
		? cy.get('[data-testid="bottomsheet-header-close-icon"]').click()
		: cy.get('[class="route-card-close"]').click();
});

Cypress.Commands.add("searchRouteWithAvoidFerryOption", isResponsive => {
	cy.get('[placeholder="From"]').click().type("port fouad", { delay: 200 });
	cy.contains("Port Fouad").click({ force: true });
	cy.wait(2000);
	cy.get('[placeholder="To"]').click().type("port said", { delay: 200 });
	cy.contains("Port Said").click();
	isResponsive ? cy.get('[data-testid="more-action-icon-container"]').click() : cy.contains("Route Options").click();
	cy.contains("Avoid ferries").click();
	isResponsive
		? cy.get('[data-testid="bottomsheet-header-close-icon"]').click()
		: cy.get('[class="route-card-close"]').click();
});
