/* Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved. */
/* SPDX-License-Identifier: MIT-0 */
/// <reference types="cypress" />

//STR
// 1-Go to https://qa.amazonlocation.services/demo
// 2-I click on hamburger menu
// 3-I go to settings
// 4-I open Connect AWS Account
// 5-I click on disconnect AWS account
// 5-Verify User is able to disconnect from AWS

describe("Check disconnecting from AWS", () => {
	it("authentication", () => {
		cy.visit(Cypress.env("URL"), {
			auth: {
				username: Cypress.env("USERNAME"),
				password: Cypress.env("PASSWORD")
			}
		});
		cy.wait(25000);
		cy.get('[id="Icon"]').click();
		cy.wait(1000);
		cy.contains("Settings").click();
		cy.wait(1000);
		cy.contains("Connect AWS Account").click();
		cy.wait(1000);
		cy.get('[placeholder="Enter IdentityPoolId"]').type(Cypress.env("IDENTITY_POOL_ID"));
		cy.wait(2000);
		cy.get('[placeholder="Enter UserDomain"]').type(Cypress.env("USER_DOMAIN"));
		cy.wait(2000);
		cy.get('[placeholder="Enter UserPoolClientId"]').type(Cypress.env("USER_POOL_CLIENT_ID"));
		cy.wait(2000);
		cy.get('[placeholder="Enter UserPoolId"]').type(Cypress.env("USER_POOL_ID"));
		cy.wait(2000);
		cy.get('[placeholder="Enter WebSocketUrl"]').type(Cypress.env("WEB_SOCKET_URL"));
		cy.wait(500);
		cy.get('[type="button"]').eq(3).click();
		cy.wait(3000);
		cy.contains("Connect AWS Account").click();
		cy.wait(2000);
		cy.get("div").should("contain", "Disconnect AWS Account");
		cy.wait(2000);
		cy.contains("Disconnect AWS Account").click();
		cy.wait(2000);
	});
});
