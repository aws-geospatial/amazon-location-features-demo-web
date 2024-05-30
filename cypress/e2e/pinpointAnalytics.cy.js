describe("Should record user events correctly", () => {
	context("Desktop view", () => {
		beforeEach(() => {
			cy.visitDomain(`${Cypress.env("WEB_DOMAIN")}/demo`);
		});
	
		it("PPA-001 - should successfully send correct user event to pinpoint", () => {
			cy.sendCorrectEventToPinpoint(false);
		});
	
		it("PPA-002 - should successfully create correct endpoint with the correct event to correct pinpoint application", () => {
			cy.getAllLocalStorage().then(result => {
				const analyticsEndpointId = result[`${Cypress.env("WEB_DOMAIN")}`]["amazon-location_analyticsEndpointId"];
				cy.exec("node extra/fetch-pinpoint-analytics-events/index.js", {
					failOnNonZeroExit: false,
					env: {
						PINPOINT_IDENTITY_POOL_ID: Cypress.env("PINPOINT_IDENTITY_POOL_ID"),
						PINPOINT_APPLICATION_ID: Cypress.env("PINPOINT_APPLICATION_ID"),
						ANALYTICS_ENDPOINT_ID: analyticsEndpointId
					}
				}).then(result => {
					cy.task("log", { result });
	
					if (result.stdout) {
						const response = JSON.parse(result.stdout);
						expect(response["$metadata"]["httpStatusCode"]).to.equal(200);
						expect(response["EndpointResponse"]["Id"]).to.equal(analyticsEndpointId);
						expect(response["EndpointResponse"]["User"]["UserId"]).to.equal(`AnonymousUser:${analyticsEndpointId}`);
					}
				});
			});
		});
	});

	context("Responsive view", () => {
		beforeEach(() => {
			cy.visitDomainInResponsiveView(`${Cypress.env("WEB_DOMAIN")}/demo`);
		});
	
		it("PPA-003 - should successfully send correct user event to pinpoint", () => {
			cy.sendCorrectEventToPinpoint(true);
		});
	});
});
