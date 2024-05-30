Cypress.Commands.add("switchBetweenMapStyles", isResponsive => {
	if (isResponsive) {
		cy.get('[data-testid="explore-button-container-Map style"]').click();
		cy.get('[data-testid="map-styles-wrapper"]').should("exist");
	} else {
		cy.get('[data-testid="map-styles-button"]').click();
		cy.get('[data-testid="map-styles-card"]').should("be.visible");
	}

	cy.get('[data-testid="map-style-item-location.aws.com.demo.maps.Esri.Light"]').should(
		"have.class",
		"mb-style-container selected"
	);

	cy.get('[data-testid="map-style-item-location.aws.com.demo.maps.HERE.Explore"]').click({ force: true });
	cy.get('[data-testid="map-style-item-location.aws.com.demo.maps.HERE.Explore"]').click({ force: true });
	cy.get('[data-testid="map-style-item-location.aws.com.demo.maps.HERE.Explore"]').should(
		"have.class",
		"mb-style-container selected"
	);

	cy.get('[data-testid="map-style-item-location.aws.com.demo.maps.Grab.StandardLight"]').click({ force: true });
	cy.get('[data-testid="map-style-item-location.aws.com.demo.maps.Grab.StandardLight"]').click({ force: true });
	cy.get('[data-testid="confirmation-button"]').click({ force: true });
	cy.get('[data-testid="map-style-item-location.aws.com.demo.maps.Grab.StandardLight"]').should(
		"have.class",
		"mb-style-container selected"
	);

	cy.wait(5000);
	cy.get('[data-testid="map-style-item-location.aws.com.demo.maps.OpenData.StandardLight"]').click({ force: true });
	cy.get('[data-testid="map-style-item-location.aws.com.demo.maps.OpenData.StandardLight"]').click({ force: true });
	cy.get('[data-testid="confirmation-button"]').click({ force: true });
	cy.get('[data-testid="map-style-item-location.aws.com.demo.maps.OpenData.StandardLight"]').should(
		"have.class",
		"mb-style-container selected"
	);
});
