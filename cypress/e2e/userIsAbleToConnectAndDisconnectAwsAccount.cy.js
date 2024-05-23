/* Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved. */
/* SPDX-License-Identifier: MIT-0 */

describe("Connecting and Disconnecting AWS account", () => {
	context("Desktop view", () => {
		beforeEach(() => {
			cy.visitDomain(`${Cypress.env("WEB_DOMAIN")}/demo`);
			cy.get('[data-testid="hamburger-menu"]').click();
			cy.get('[data-testid="connect-aws-account-button"]').first().click();
			cy.wait(5000);
			cy.get('[placeholder="Enter IdentityPoolId"]').type(`${Cypress.env("IDENTITY_POOL_ID")}`);
			cy.get('[placeholder="Enter UserDomain"]').type(`${Cypress.env("USER_DOMAIN")}`);
			cy.get('[placeholder="Enter UserPoolClientId"]').type(`${Cypress.env("USER_POOL_CLIENT_ID")}`);
			cy.get('[placeholder="Enter UserPoolId"]').type(`${Cypress.env("USER_POOL_ID")}`);
			cy.get('[placeholder="Enter WebSocketUrl"]').type(`${Cypress.env("WEB_SOCKET_URL")}`);
			cy.get('[data-testid="connect-button"]').click();
			cy.wait(5000);
			cy.get('[data-testid="connect-aws-account-modal-container"]').should(
				"contain",
				"Your AWS account is now connected."
			);
			cy.wait(5000);
			cy.get('[data-testid="sign-in-button"]').click();
			cy.wait(5000);
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
			cy.get('[data-testid="hamburger-menu"]').click();
			cy.wait(5000);
			cy.get("#root").then($root => {
				const asd = $root.find('[class="amplify-button amplify-field-group__control amplify-button--primary"]');
	
				if (asd.length && asd[0].innerText === "Sign in") {
					asd[0].click();
				} else {
					cy.get('[data-testid="hamburger-menu"]').click();
				}
			});
			cy.wait(5000);
		});
	
		it("should allow user to connect, sign-in, sign-out and disconnect AWS account from sidebar", () => {
			cy.get('[data-testid="hamburger-menu"]').click();
			cy.wait(5000);
			cy.get('[data-testid="sign-out-button"]').click();
			cy.wait(5000);
			cy.get('[data-testid="hamburger-menu"]').click();
			cy.get("#root").then($root => {
				const root = $root.find('[class="amplify-button amplify-field-group__control amplify-button--primary"]');
				root.length && root[0].innerText === "Sign out"
					? root[0].click()
					: cy.get('[data-testid="hamburger-menu"]').click();
			});
			cy.wait(5000);
			cy.get('[data-testid="hamburger-menu"]').click();
			cy.wait(5000);
			cy.get('[data-testid="disconnect-aws-account-button"]').click();
			cy.wait(10000);
			cy.get('[data-testid="welcome-modal-continue-button"]').click();
			cy.wait(5000);
			cy.get('[data-testid="hamburger-menu"]').click();
			cy.get('[data-testid="connect-aws-account-button"]').should("exist");
		});
	});

	context("Responsive view", () => {
		beforeEach(() => {
			cy.visitDomainInResponsiveView(`${Cypress.env("WEB_DOMAIN")}/demo`);
			cy.openResponsiveMenu('[data-testid="bottomsheet"]');
			cy.get('[data-testid="connect-aws-account-button"]').first().click();
			cy.wait(5000);
			cy.get('[placeholder="Enter IdentityPoolId"]').type(`${Cypress.env("IDENTITY_POOL_ID")}`);
			cy.get('[placeholder="Enter UserDomain"]').type(`${Cypress.env("USER_DOMAIN")}`);
			cy.get('[placeholder="Enter UserPoolClientId"]').type(`${Cypress.env("USER_POOL_CLIENT_ID")}`);
			cy.get('[placeholder="Enter UserPoolId"]').type(`${Cypress.env("USER_POOL_ID")}`);
			cy.get('[placeholder="Enter WebSocketUrl"]').type(`${Cypress.env("WEB_SOCKET_URL")}`);
			cy.get('[data-testid="connect-button"]').click();
			cy.wait(5000);
			cy.get('[data-testid="connect-aws-account-modal-container"]').should(
				"contain",
				"Your AWS account is now connected."
			);
			cy.wait(5000);
			cy.get('[data-testid="sign-in-button"]').first().click();
			cy.wait(5000);
			cy.origin(`${Cypress.env("USER_DOMAIN")}`, () => {
				cy.get(".modal-content.background-customizable.modal-content-mobile.visible-md.visible-lg").then(els => {
					[...els].forEach(el => {
						cy.wrap(el)
							.get('[placeholder="Username"]')
							.first()
							.type(`${Cypress.env("COGNITO_EMAIL")}`);
						cy.wrap(el)
							.get('[placeholder="Password"]')
							.first()
							.type(`${Cypress.env("COGNITO_PASSWORD")}`);
						cy.wrap(el).get('[name="signInSubmitButton"]').first().click();
					});
				});
			});
			cy.wait(5000);
			cy.openResponsiveMenu('[data-testid="bottomsheet"]');
			cy.wait(5000);
			cy.get("#root").then($root => {
				const asd = $root.find('[class="amplify-button amplify-field-group__control amplify-button--primary"]');
	
				if (asd.length && asd[0].innerText === "Sign in") {
					asd[0].click();
				} else {
					cy.closeResponsiveMenu('[data-testid="bottomsheet"]');
				}
			});
			cy.wait(5000);
		});
	
		it("should allow user to connect, sign-in, sign-out and disconnect AWS account from sidebar", () => {
			cy.openResponsiveMenu('[data-testid="bottomsheet"]');
			cy.wait(5000);
			cy.get('[data-testid="sign-out-button"]').click();
			cy.wait(5000);
			cy.openResponsiveMenu('[data-testid="bottomsheet"]');
			cy.get("#root").then($root => {
				const root = $root.find('[class="amplify-button amplify-field-group__control amplify-button--primary"]');
				root.length && root[0].innerText === "Sign out"
					? root[0].click()
					: cy.closeResponsiveMenu('[data-testid="bottomsheet"]');
			});
			cy.wait(5000);
			cy.openResponsiveMenu('[data-testid="bottomsheet"]');
			cy.wait(5000);
			cy.get('[data-testid="disconnect-aws-account-button"]').click();
			cy.wait(10000);
			cy.get('[data-testid="welcome-modal-continue-button"]').click();
			cy.wait(5000);
			cy.openResponsiveMenu('[data-testid="bottomsheet"]');
			cy.get('[data-testid="connect-aws-account-button"]').should("exist");
		});
	});
});
