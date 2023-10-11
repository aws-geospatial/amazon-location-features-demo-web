describe("Should record user events correctly", () => {
	beforeEach(() => {
		cy.visitDomain(`${Cypress.env("WEB_DOMAIN")}/demo`);
	});

	it("should record user events correctly", () => {
		cy.get('[data-testid="hamburger-menu"]').click();
		cy.wait(2000);
		cy.contains("Settings").click();
		cy.intercept("POST", "**/events").as("postAnalyticEvent");
		cy.get('[data-testid="option-item-Map style"]').click();
		cy.get('[data-testid="map-style-item-location.aws.com.demo.maps.HERE.Explore"]').click();
		cy.wait("@postAnalyticEvent").then(intercepted => {
			const requestBody = intercepted.request.body;
			expect(Object.values(Object.values(Object.values(requestBody.BatchItem)[0])[1])[0].EventType).to.equal(
				"MAP_STYLE_CHANGE"
			);
		});
	});
});
