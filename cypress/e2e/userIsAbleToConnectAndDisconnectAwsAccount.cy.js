/* Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved. */
/* SPDX-License-Identifier: MIT-0 */

describe("Connecting and Disconnecting AWS account", () => {
	beforeEach(() => {
		cy.visitDomain(`${Cypress.env("WEB_DOMAIN")}`);
		cy.get('[id="Icon"]').click();
	});

	it("should allow user to connect, sign-in, sign-out and disconnect AWS account from sidebar", () => {
		cy.contains("Connect AWS Account").click();
		cy.wait(2000);
		cy.get('[placeholder="Enter IdentityPoolId"]').type(`${Cypress.env("IDENTITY_POOL_ID")}`);
		cy.get('[placeholder="Enter UserDomain"]').type(`${Cypress.env("USER_DOMAIN")}`);
		cy.get('[placeholder="Enter UserPoolClientId"]').type(`${Cypress.env("USER_POOL_CLIENT_ID")}`);
		cy.get('[placeholder="Enter UserPoolId"]').type(`${Cypress.env("USER_POOL_ID")}`);
		cy.get('[placeholder="Enter WebSocketUrl"]').type(`${Cypress.env("WEB_SOCKET_URL")}`);
		cy.get('[type="button"]').eq(3).click();
		cy.wait(5000);
		cy.get("div").should("contain", "Your AWS account is now connected.");
		cy.get('[class="amplify-button amplify-field-group__control amplify-button--primary"]').click();
		cy.wait(2000);
		cy.origin(`${Cypress.env("USER_DOMAIN")}`, () => {
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
		cy.get('[id="Icon"]').click();
		cy.contains("Sign out").should("exist");
		cy.contains("Sign out").click();
		cy.wait(5000);
		cy.get('[id="Icon"]').click();
		cy.contains("Disconnect AWS Account").should("exist");
		cy.contains("Disconnect AWS Account").click();
		cy.wait(10000);
		cy.get('[class="amplify-button amplify-field-group__control amplify-button--primary"]').click();
		cy.wait(5000);
		cy.get('[id="Icon"]').click();
		cy.get("div").should("contain", "Connect AWS Account");
	});
});
