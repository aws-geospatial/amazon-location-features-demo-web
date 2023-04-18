/* Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved. */
/* SPDX-License-Identifier: MIT-0 */
/// <reference types="cypress" />

//STR
// 1-Go to https://qa.amazonlocation.services/demo
// 2-I click on the hamburger menu
// 3-I go to geofence
// 4-I click on existing geofence
// 5-I change the radius and the name of geofence
// 6-I click on save button
// 7-Verify user is able to edit geofence
const identityPoolId = Cypress.env("IDENTITY_POOL_ID");
const userDomain = Cypress.env("USER_DOMAIN");
const userPoolClientId = Cypress.env("USER_POOL_CLIENT_ID");
const userPoolId = Cypress.env("USER_POOL_ID");
const webSocketUrl = Cypress.env("WEB_SOCKET_URL");
const email = Cypress.env("EMAIL");
const emailPass = Cypress.env("EMAIL_PASS");
const originWeb = Cypress.env("ORIGIN_WEB");
const getWeb = Cypress.env("GET_WEB");

console.log(identityPoolId);
console.log(userDomain);
console.log(userPoolClientId);
console.log(userPoolId);
console.log(webSocketUrl);
console.log(email);
console.log(emailPass);
console.log(originWeb);
console.log(getWeb);
describe("Edit Geofence", () => {
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
					cy.wrap(el).get('[placeholder="Username"]').eq(1).type(Cypress.env("EMAIL"));
                    cy.wrap(el).get('[placeholder="Password"]').eq(1).type(Cypress.env("EMAIL_PASS"));
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
		cy.get('[class="mapboxgl-user-location-dot mapboxgl-marker mapboxgl-marker-anchor-center"]').click({ force: true });
		cy.wait(2000);
		cy.get('[placeholder="Type unique Geofence Name"]').type("Geofence1");
		cy.wait(2000);
		cy.contains("Save").click();
		cy.wait(2000);
		cy.get("div").should("contain", "Geofence1");
		cy.wait(2000);
		cy.contains("Geofence1").click();
		cy.wait(2000);
		cy.get('[type="number"]').type("0");
		cy.wait(2000);
		cy.contains("Save").click();
		cy.wait(2000);
		cy.get('[id="Icon/trash"]').eq(0).click({ force: true });
		cy.wait(2000);
	});
});
