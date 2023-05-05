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

describe("Add, Edit and Delete Geofence", () => {
	it("should allow user to add, edit and delete geofence", () => {
		cy.visit(Cypress.env("WEB_DOMAIN"), {
			auth: {
				username: Cypress.env("WEB_DOMAIN_USERNAME"),
				password: Cypress.env("WEB_DOMAIN_PASSWORD")
			}
		});
		cy.wait(5000);
		cy.get('[class="amplify-button amplify-field-group__control amplify-button--primary"]').click();
		cy.get('[id="Icon"]').click();
		cy.wait(2000);
		cy.contains("Settings").click();
		cy.wait(2000);
		cy.contains("Connect AWS Account").click();
		cy.wait(2000);
		cy.get('[placeholder="Enter IdentityPoolId"]').type(`${Cypress.env("IDENTITY_POOL_ID")}`);
		cy.get('[placeholder="Enter UserDomain"]').type(`${Cypress.env("USER_DOMAIN")}`);
		cy.get('[placeholder="Enter UserPoolClientId"]').type(`${Cypress.env("USER_POOL_CLIENT_ID")}`);
		cy.get('[placeholder="Enter UserPoolId"]').type(`${Cypress.env("USER_POOL_ID")}`);
		cy.get('[placeholder="Enter WebSocketUrl"]').type(`${Cypress.env("WEB_SOCKET_URL")}`);
		cy.get('[class="amplify-button amplify-field-group__control amplify-button--primary"]').click();
		cy.wait(5000);
		cy.contains("Connect AWS Account").click();
		cy.wait(2000);
		cy.get('[class="amplify-button amplify-field-group__control amplify-button--primary"]').eq(0).click();
		cy.wait(2000);
		cy.origin(Cypress.env("USER_DOMAIN"), () => {
			cy.get(".modal-content.background-customizable.modal-content-mobile.visible-md.visible-lg").then(els => {
				[...els].forEach(el => {
					cy.wait(2000);
					cy.wrap(el)
						.get('[placeholder="Username"]')
						.eq(1)
						.type(`${Cypress.env("COGNITO_EMAIL")}`);
					cy.wrap(el)
						.get('[placeholder="Password"]')
						.eq(1)
						.type(`${Cypress.env("COGNITO_PASSWORD")}`);
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
		cy.get('[placeholder="Enter address or coordinates"]').type("Rio Tinto Perth Western Australia");
		cy.wait(4000);
		cy.contains("Rio Tinto Operations Centre").click();
		cy.wait(2000);
		cy.get('[placeholder="Type unique Geofence Name"]').type("Geofence1");
		cy.wait(2000);
		cy.contains("Save").click();
		cy.wait(2000);
		cy.get("div").should("contain", "Geofence1");
		cy.wait(2000);
		cy.contains("Geofence1").click();
		cy.wait(2000);
		cy.get('[type="number"]').type("50");
		cy.wait(2000);
		cy.contains("Save").click();
		cy.wait(2000);
		cy.get('[data-testid="icon-trash-Geofence1"]').click({ force: true });
		cy.get('[class="geofences-list-container"]').should("not.contain", "Geofence1");
	});
});
