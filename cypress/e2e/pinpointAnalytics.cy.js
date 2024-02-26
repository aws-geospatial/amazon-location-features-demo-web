describe("Should record user events correctly", () => {
	beforeEach(() => {
		cy.visitDomain(`${Cypress.env("WEB_DOMAIN")}/demo`);
	});

	it("should successfully send correct user event to pinpoint", () => {
		cy.wait(10000);
		cy.getAllLocalStorage().then(result => {
			const analyticsEndpointId = result[`${Cypress.env("WEB_DOMAIN")}`]["amazon-location_analyticsEndpointId"];
			cy.get('[data-testid="hamburger-menu"]').click();
			cy.wait(2000);
			cy.contains("Settings").click();
			cy.intercept("POST", "**/events").as("postPinpointEvents");
			cy.get('[data-testid="option-item-Map style"]').click();
			cy.wait(2000);
			cy.get('[data-testid="map-style-item-location.aws.com.demo.maps.HERE.Explore"]').click();
			cy.wait(2000);
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

	it("should successfully create correct endpoint with the correct event to correct pinpoint application", () => {
		cy.wait(10000);
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
