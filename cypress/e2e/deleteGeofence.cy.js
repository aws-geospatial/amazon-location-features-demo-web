/* Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved. */
/* SPDX-License-Identifier: MIT-0 */
/// <reference types="cypress" />

//STR
// 1-Go to https://qa.amazonlocation.services/demo
// 2-I click on the hamburger menu
// 3-I go to geofence
// 4-I click on the delete icon on the right corner of already created geofence
// 5-I see a prompt saying “Delete Geofence”
// 6-I click on “ok”
// 7-Verify user can delete geofence

describe("Delete Geofence", () => {
	it("authentication", () => {
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
		cy.get('[type="button"]').eq(3).click();
		cy.wait(5000);
		cy.contains("Connect AWS Account").click();
		cy.wait(2000);
		cy.get('[type="button"]').eq(3).click();
		cy.wait(2000);
		cy.origin(Cypress.env("USER_DOMAIN"), () => {
			cy.get(".modal-content.background-customizable.modal-content-mobile.visible-md.visible-lg").then(els => {
				[...els].forEach(el => {
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
		cy.wait(5000);
		cy.get('[class="amplify-flex geofence-button"]').click();
		cy.wait(2000);
		cy.get('[placeholder="Enter address or coordinates"]').type("gramercy park music school USA").wait(5000);
		cy.get('[class="amplify-flex suggestion border-top"]').click();
		cy.wait(2000);
		cy.get('[placeholder="Type unique Geofence Name"]').type("Geofence1");
		cy.wait(2000);
		cy.contains("Save").click();
		cy.wait(2000);
		cy.get("div").should("contain", "Geofence1");
		cy.wait(2000);
		cy.get('[data-testid="icon-trash-Geofence1"]').click({ force: true });
		cy.get('[class="geofences-list-container"]').should("not.contain", "Geofence1");
	});
});
