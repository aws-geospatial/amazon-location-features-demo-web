/* Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved. */
/* SPDX-License-Identifier: MIT-0 */
/// <reference types="cypress" />

// STR
// 1-Go to https://qa.amazonlocation.services/demo
// 2-I click on Geofence icon on the top right corner beneath map styles icon
// 3-I click on add button
// 4-I select a place on the map for adding geofence
// 5-I enter a unique name for the geofence
// 6-I click on save
// 7-Verify User is able add Geofence
const identityPoolId = Cypress.env("IDENTITY_POOL_ID");
const userDomain = Cypress.env("USER_DOMAIN");
const userPoolClientId = Cypress.env("USER_POOL_CLIENT_ID");
const userPoolId = Cypress.env("USER_POOL_ID");
const webSocketUrl = Cypress.env("WEB_SOCKET_URL");
const email = Cypress.env("EMAIL");
const emailPass = Cypress.env("EMAIL_PASS");
const originWeb = Cypress.env("ORIGIN_WEB");
const getWeb = Cypress.env("GET_WEB");

describe("Add Geofence", () => {
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
		cy.get('[placeholder="Enter IdentityPoolId"]').type(identityPoolId);
		cy.wait(2000);
		cy.get('[placeholder="Enter UserDomain"]').type(userDomain);
		cy.wait(2000);
		cy.get('[placeholder="Enter UserPoolClientId"]').type(userPoolClientId);
		cy.wait(2000);
		cy.get('[placeholder="Enter UserPoolId"]').type(userPoolId);
		cy.wait(2000);
		cy.get('[placeholder="Enter WebSocketUrl"]').type(webSocketUrl);
		cy.wait(2000);
		cy.get('[type="button"]').eq(3).click();
		cy.wait(6000);
		cy.contains("Connect AWS Account").click();
		cy.wait(2000);
		cy.get('[type="button"]').eq(3).click();
		cy.wait(2000);
		cy.origin(originWeb, () => {
			cy.get(Cypress.env("GET_WEB")).then(els => {
				[...els].forEach(el => {
					cy.wait(5000);
					cy.wrap(el).get('[placeholder="Username"]').eq(1).invoke("val", "refat.mahmoud@makeen.io");
					cy.wrap(el).get('[placeholder="Password"]').eq(1).invoke("val", "Makeen2022!");
					cy.wrap(el).get('[name="signInSubmitButton"]').eq(1).click();
				});
			});
		});
		cy.wait(10000);
		cy.get('[id="Icon"]').click();
		cy.contains("Sign out").should("exist");
		cy.wait(5000);
		cy.get('[class="amplify-flex geofence-button"]').click();
		cy.wait(2000);
		cy.get('[class="mapboxgl-user-location-dot mapboxgl-marker mapboxgl-marker-anchor-center"]').click();
		cy.wait(2000);
		cy.get('[placeholder="Type unique Geofence Name"]').type("Geofence1");
		cy.wait(2000);
		cy.contains("Save").click();
		cy.wait(2000);
		cy.get("div").should("contain", "Geofence1");
		cy.wait(2000);
		cy.get('[id="Icon/trash"]').eq(0).click({ force: true });
		cy.wait(2000);
	});
});
