/* Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved. */
/* SPDX-License-Identifier: MIT-0 */
/// <reference types="cypress" />

// STR
// 1-Go to https://qa.amazonlocation.services/demo
// 2- click on the hamburger menu
// 3-I go to tracker
// 4-I click continue on pop-up
// 5- I select drone
// 6- I add tracker points that pass through a geofence
// 7- I click on create
// 8- I click on Simulate
// 9- Verify I see a toast message while entering “Entered {geofence name} geofence
// 10- Verify I see a toast message while exiting “Exited {geofence name} geofence

describe("Add Simulator Tracker for drone", () => {
	it("authentication", () => {
		cy.visit(Cypress.env("URL"), {
			auth: {
				username: Cypress.env("USERNAME"),
				password: Cypress.env("PASSWORD")
			}
		});
		cy.wait(20000);
		cy.get('[id="Icon"]').click();
		cy.wait(2000);
		cy.contains("Settings").click();
		cy.wait(2000);
		cy.contains("Connect AWS Account").click();
		cy.wait(2000);
		cy.get('[placeholder="Enter IdentityPoolId"]').type(`${Cypress.env("IDENTITY_POOL_ID")}`);
		cy.wait(2000);
		cy.get('[placeholder="Enter UserDomain"]').type(`${Cypress.env("USER_DOMAIN")}`);
		cy.wait(2000);
		cy.get('[placeholder="Enter UserPoolClientId"]').type(`${Cypress.env("USER_POOL_CLIENT_ID")}`);
		cy.wait(2000);
		cy.get('[placeholder="Enter UserPoolId"]').type(`${Cypress.env("USER_POOL_ID")}`);
		cy.wait(2000);
		cy.get('[placeholder="Enter WebSocketUrl"]').type(`${Cypress.env("WEB_SOCKET_URL")}`);
		cy.wait(2000);
		cy.get('[type="button"]').eq(3).click();
		cy.wait(6000);
		cy.contains("Connect AWS Account").click();
		cy.wait(2000);
		cy.get('[type="button"]').eq(3).click();
		cy.wait(2000);
		cy.origin(Cypress.env("ORIGIN_WEB"), () => {
			cy.get(Cypress.env("GET_WEB")).then(els => {
				[...els].forEach(el => {
					cy.wrap(el)
						.get('[placeholder="Username"]')
						.eq(1)
						.type(`${Cypress.env("EMAIL")}`);
					cy.wrap(el)
						.get('[placeholder="Password"]')
						.eq(1)
						.type(`${Cypress.env("EMAIL_PASS")}`);
					cy.wrap(el).get('[name="signInSubmitButton"]').eq(1).click();
				});
			});
		});
		cy.wait(10000);
		cy.get('[id="Icon"]').click();
		cy.contains("Sign out").should("exist");
		cy.wait(5000);
		cy.contains("Tracker").click();
		cy.wait(2000);
		cy.contains("Continue").click();
		cy.wait(2000);
		cy.get('[class="icon-container"]').eq(1).click();
		cy.wait(2000);
		cy.get('[class="mapboxgl-canvas"]').click("left");
		cy.wait(2000);
		cy.get('[class="mapboxgl-user-location-dot mapboxgl-marker mapboxgl-marker-anchor-center"]').click();
		cy.wait(2000);
		cy.contains("Save").click();
		cy.wait(2000);
		cy.contains("Simulate").click();
		cy.wait(20000);
		cy.get("div").should("contain", "Pause");
		cy.wait(2000);
	});
});
