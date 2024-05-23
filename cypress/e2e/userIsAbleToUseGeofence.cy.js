/* Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved. */
/* SPDX-License-Identifier: MIT-0 */

import { faker } from "@faker-js/faker";

describe("Geofence", () => {
	context("Desktop view", () => {
		const geofenceName = faker.random.word();

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
	
		it("should allow user to add, edit and delete geofence", () => {
			cy.get('[class="amplify-flex geofence-button"]').click();
			cy.get('[placeholder="Enter address or coordinates"]').type("Rio Tinto Perth Western Australia");
			cy.wait(4000);
			cy.contains("Rio Tinto").click();
			cy.wait(5000);
			cy.get('[placeholder="Type unique Geofence Name"]').type(`${geofenceName}`);
			cy.wait(5000);
			cy.contains("Save").click();
			cy.wait(5000);
			cy.get("div").should("contain", `${geofenceName}`);
			cy.wait(5000);
			cy.contains(`${geofenceName}`).click({ force: true });
			cy.wait(5000);
			cy.contains("Save").should("be.disabled");
			cy.contains("Go Back").click();
			cy.wait(5000);
			cy.get(`[data-testid="icon-trash-${geofenceName}"]`).click({ force: true });
			cy.wait(5000);
			cy.get('[data-testid="geofences-list-container"]').should("not.contain", `${geofenceName}`);
			cy.wait(5000);
			cy.get('[data-testid="auth-geofence-box-close-button"]').click();
			cy.wait(5000);
			cy.get('[data-testid="hamburger-menu"]').click();
			cy.wait(5000);
			cy.get('[data-testid="sign-out-button"]').click();
			cy.wait(30000);
			cy.get('[data-testid="hamburger-menu"]').click();
			cy.wait(5000);
			cy.get('[data-testid="disconnect-aws-account-button"]').click();
		});
	});

	context("Responsive view", () => {
		const geofenceName = faker.random.word();

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
	
		it("should allow user to add, edit and delete geofence", () => {
			cy.get('[data-testid="explore-button-container-Geofences"]').click();
			cy.get('[data-testid="add-geofence-button-container-mobile"]').click();
			cy.get('[placeholder="Enter address or coordinates"]').type("Rio Tinto Perth Western Australia");
			cy.wait(4000);
			cy.get('[class="amplify-flex suggestion border-top"]').click();
			cy.wait(5000);
			cy.get('[placeholder="Type unique Geofence Name"]').type(`${geofenceName}{enter}`);
			cy.wait(5000);
			cy.contains("Save").click();
			cy.wait(5000);
			cy.get("div").should("contain", `${geofenceName}`);
			cy.wait(5000);
			cy.contains(`${geofenceName}`).click({ force: true });
			cy.wait(5000);
			cy.contains("Save").should("be.disabled");
			cy.get('[data-testid="bottomsheet-header-close-icon"]').click();
			cy.wait(5000);
			cy.get(`[data-testid="icon-trash-${geofenceName}"]`).click({ force: true });
			cy.wait(5000);
			cy.get('[data-testid="geofences-list-container"]').should("not.contain", `${geofenceName}`);
			cy.wait(5000);
			cy.get('[data-testid="bottomsheet-header-close-icon"]').click();
			cy.wait(5000);
			cy.openResponsiveMenu('[data-testid="bottomsheet"]');
			cy.wait(5000);
			cy.get('[data-testid="sign-out-button"]').click();
			cy.wait(30000);
			cy.openResponsiveMenu('[data-testid="bottomsheet"]');
			cy.wait(5000);
			cy.get('[data-testid="disconnect-aws-account-button"]').click();
		});
	});
});
