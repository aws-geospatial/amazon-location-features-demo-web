/* Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved. */
/* SPDX-License-Identifier: MIT-0 */
/// <reference types="cypress" />

//STR
// 1-Go to https://qa.amazonlocation.services/demo
// 2-I open hamburger menu
// 3-I go to settings
// 4-I click on connect your AWS account
// 5-I add IdentityPoolId
// 6-I add UserDomain
// 7-I add UserPoolClientId
// 8-I add UserPoolId
// 9-I add WebSocketUrl
// 10-I click on connect
// 11-I close the app
// 12-I reopen the open
// 13-I click on settings
// 14-I go to connect your AWS account
// 15-I click on sign in
// 16-I enter email and password
// 17-I click on log in
// 18-Verify User is able to sign in after being connected to AWS

describe("User can sign in after being connected to AWS", () => {
	it("authentication", () => {
		cy.visit(Cypress.env("URL"), {
			auth: {
				username: Cypress.env("USERNAME"),
				password: Cypress.env("PASSWORD")
			}
		});
		cy.wait(15000);
		cy.get('[id="Icon"]').click();
		cy.wait(2000);
		cy.contains("Settings").click();
		cy.wait(2000);
		cy.contains("Connect AWS Account").click();
		cy.wait(2000);
		cy.get('[placeholder="Enter IdentityPoolId"]').type(Cypress.env("IDENTITY_POOL_ID"));
		cy.wait(2000);
		cy.get('[placeholder="Enter UserDomain"]').type(Cypress.env("USER_DOMAIN"));
		cy.wait(2000);
		cy.get('[placeholder="Enter UserPoolClientId"]').type(Cypress.env("USER_POOL_CLIENT_ID"));
		cy.wait(2000);
		cy.get('[placeholder="Enter UserPoolId"]').type(Cypress.env("USER_POOL_ID"));
		cy.wait(2000);
		cy.get('[placeholder="Enter WebSocketUrl"]').type(Cypress.env("WEB_SOCKET_URL"));
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
					cy.wrap(el).find("#signInFormUsername").type(Cypress.env("EMAIL"));
					cy.wrap(el).find("#signInFormPassword").type(Cypress.env("EMAIL_PASS"));
					cy.wrap(el).find('[name="signInSubmitButton"]').click();
				});
			});
		});
		cy.wait(10000);
		cy.get('[id="Icon"]').click();
		cy.contains("Sign out").should("exist");
		cy.wait(5000);
		cy.get("div").should("contain", "Search");
		cy.wait(2000);
	});
});
