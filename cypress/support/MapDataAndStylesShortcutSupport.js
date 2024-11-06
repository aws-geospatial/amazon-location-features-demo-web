Cypress.Commands.add("switchBetweenMapStyles", isResponsive => {
	if (isResponsive) {
		cy.get('[data-testid="explore-button-container-Map style"]').click();
		cy.get('[data-testid="map-styles-wrapper"]').should("exist");
	} else {
		cy.get('[data-testid="map-styles-button"]').click();
		cy.get('[data-testid="map-styles-card"]').should("be.visible");
	}

	cy.get('[data-testid="map-style-item-Standard"]').should("have.class", "mb-style-container selected");

	cy.get('[data-testid="map-style-item-Monochrome"]').click({ force: true });
	cy.get('[data-testid="map-style-item-Monochrome"]').click({ force: true });
	cy.get('[data-testid="map-style-item-Monochrome"]').should("have.class", "mb-style-container selected");

	cy.get('[data-testid="map-style-item-Hybrid"]').click({ force: true });
	cy.get('[data-testid="map-style-item-Hybrid"]').click({ force: true });
	cy.get('[data-testid="map-style-item-Hybrid"]').should("have.class", "mb-style-container selected");

	cy.get('[data-testid="map-style-item-Satellite"]').click({ force: true });
	cy.get('[data-testid="map-style-item-Satellite"]').click({ force: true });
	cy.get('[data-testid="map-style-item-Satellite"]').should("have.class", "mb-style-container selected");
});
