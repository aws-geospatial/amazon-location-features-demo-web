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
		cy.get('[placeholder="Enter IdentityPoolId"]').type('us-east-1:8bb6d55c-cbfd-41e8-9024-ca45f0bfe690');
		cy.wait(2000);
		cy.get('[placeholder="Enter UserDomain"]').type('https://179807038416.auth.us-east-1.amazoncognito.com/');
		cy.wait(2000);
		cy.get('[placeholder="Enter UserPoolClientId"]').type('7pjjrkhvg8gm7oj3opdjnk4e1p');
		cy.wait(2000);
		cy.get('[placeholder="Enter UserPoolId"]').type('us-east-1_qxJGBCMyh');
		cy.wait(2000);
		cy.get('[placeholder="Enter WebSocketUrl"]').type('http://a28q0qgycwbp4k-ats.iot.us-east-1.amazonaws.com/');
		cy.wait(2000);
		cy.get('[class="amplify-button amplify-field-group__control amplify-button--primary"]').click();
		cy.wait(6000);
		cy.contains("Connect AWS Account").click();
		cy.wait(2000);
		cy.get('[class="amplify-button amplify-field-group__control amplify-button--primary"]').eq(0).click();
		cy.wait(2000);
		cy.origin(Cypress.env("ORIGIN_WEB"), () => {
			cy.get(Cypress.env("GET_WEB")).then(els => {
				[...els].forEach(el => {
					cy.wait(5000);
					cy.wrap(el).get('[placeholder="Username"]').eq(1).invoke("val", 'refat.mahmoud@makeen.io');
					cy.wrap(el).get('[placeholder="Password"]').eq(1).invoke("val", 'Makeen2022!');
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
		cy.get('[class="mapboxgl-user-location-accuracy-circle mapboxgl-marker mapboxgl-marker-anchor-center"]').click();
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
