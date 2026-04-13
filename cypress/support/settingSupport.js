Cypress.Commands.add("toggleDefaultUnitsForMap", isResponsive => {
	cy.get('[data-testid="option-item-Units"]').click();
	cy.get('[data-testid="unit-imperial-radio"]').click({ force: true });
	if (isResponsive) {
		cy.get('[class="grey-icon back-arrow"]').click();
	}
	cy.get('[data-testid="option-item-Units"]').contains("Imperial");
});

Cypress.Commands.add("selectMapStyle", isResponsive => {
	cy.get('[data-testid="option-item-Map style"]').click();
	cy.get('[data-testid="map-style-item-Monochrome"]').click();

	if (isResponsive) {
		cy.get('[class="grey-icon back-arrow"]').click();
	}

	cy.get('[data-testid="option-item-Map style"]').contains("Monochrome");
});

Cypress.Commands.add("checkDefaultRouteOptions", () => {
	cy.get('[data-testid="option-item-Default route options"]').click();
	cy.get("div").should("contain", "Avoid tolls");
	cy.get("div").should("contain", "Avoid ferries");
});
