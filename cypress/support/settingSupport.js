Cypress.Commands.add("toggleDefaultUnitsForMap", (isResponsive) => {
    cy.get('[data-testid="option-item-Units"]').click();
	cy.get('[data-testid="unit-imperial-radio"]').click({ force: true });
    if(isResponsive){
        cy.get('[class="grey-icon back-arrow"]').click();
    }
	cy.get('[data-testid="option-item-Units"]').contains("Imperial");
});

Cypress.Commands.add("selectMapDataProvider", () => {
    cy.get('[data-testid="option-item-Data provider"]').click();
	cy.get('[data-testid="option-details-container"]').contains("Esri");
	cy.get('[data-testid="option-details-container"]').contains("HERE");
	cy.get('[data-testid="option-details-container"]').contains("GrabMaps");
	cy.get('[data-testid="option-details-container"]').contains("OpenData");
});

Cypress.Commands.add("selectMapStyle", (isResponsive) => {
    cy.get('[data-testid="option-item-Map style"]').click();
	cy.contains("Streets").click();
    if(isResponsive){
        cy.get('[class="grey-icon back-arrow"]').click();
    }
	cy.get('[data-testid="option-item-Map style"]').contains("Streets");
});

Cypress.Commands.add("checkDefaultRouteOptions", () => {
    cy.get('[data-testid="option-item-Default route options"]').click();
	cy.get("div").should("contain", "Avoid tolls");
	cy.get("div").should("contain", "Avoid ferries");
});

Cypress.Commands.add("sendCorrectEventToPinpoint", (isResponsive) => {
    cy.getAllLocalStorage().then(result => {
		const analyticsEndpointId = result[`${Cypress.env("WEB_DOMAIN")}`]["amazon-location_analyticsEndpointId"];
		isResponsive ? cy.openResponsiveMenu('[data-testid="bottomsheet"]') : cy.get('[data-testid="hamburger-menu"]').click()
		cy.contains("Settings").click();
		cy.intercept("POST", "**/events").as("postPinpointEvents");
		cy.get('[data-testid="option-item-Map style"]').click();
		cy.get('[data-testid="map-style-item-location.aws.com.demo.maps.HERE.Explore"]').click();
		cy.wait("@postPinpointEvents").then(intercepted => {
			const requestBody = intercepted.request.body;
			const responseBody = intercepted.response.body;
			expect(Object.values(requestBody["BatchItem"][analyticsEndpointId]["Events"])[0].EventType).to.equal(
				"MAP_STYLE_CHANGE"
			);
			expect(responseBody["Results"][analyticsEndpointId].EndpointItemResponse.Message).to.equal("Accepted");
			expect(responseBody["Results"][analyticsEndpointId].EndpointItemResponse.StatusCode).to.equal(202);
			expect(Object.values(responseBody["Results"][analyticsEndpointId].EventsItemResponse)[0].Message).to.equal(
				"Accepted"
			);
			expect(Object.values(responseBody["Results"][analyticsEndpointId].EventsItemResponse)[0].StatusCode).to.equal(
				202
			);
		});
	});
});