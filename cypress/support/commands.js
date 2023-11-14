/* Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved. */
/* SPDX-License-Identifier: MIT-0 */

Cypress.Commands.add("visitDomainInDesktopView", (path = "demo?dp=Esri") => {
	Cypress.on("uncaught:exception", () => {
		return false;
	});

	const domain = `${Cypress.env("WEB_DOMAIN")}/${path}`;

	domain.includes("dev")
		? cy.visit(domain, {
				auth: {
					username: Cypress.env("WEB_DOMAIN_USERNAME"),
					password: Cypress.env("WEB_DOMAIN_PASSWORD")
				}
		  })
		: cy.visit(domain);
	cy.wait(20000);
	cy.get('[data-testid="welcome-modal-continue-button"]').click();
	cy.wait(2000);
});

Cypress.Commands.add("connectAwsAccountInDesktopView", () => {
	cy.get('[data-testid="hamburger-menu"]').click();
	cy.wait(2000);
	cy.get('[data-testid="connect-aws-account-button"]').click();
	cy.wait(2000);
	cy.get('[placeholder="Enter IdentityPoolId"]').type(`${Cypress.env("IDENTITY_POOL_ID")}`);
	cy.get('[placeholder="Enter UserDomain"]').type(`${Cypress.env("USER_DOMAIN")}`);
	cy.get('[placeholder="Enter UserPoolClientId"]').type(`${Cypress.env("USER_POOL_CLIENT_ID")}`);
	cy.get('[placeholder="Enter UserPoolId"]').type(`${Cypress.env("USER_POOL_ID")}`);
	cy.get('[placeholder="Enter WebSocketUrl"]').type(`${Cypress.env("WEB_SOCKET_URL")}`);
	cy.get('[data-testid="connect-button"]').click();
	cy.wait(5000);
	cy.get('[data-testid="connect-aws-account-modal-container"]').should("contain", "Your AWS account is now connected.");
	cy.wait(2000);
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
	cy.wait(2000);
	cy.get("#root").then($root => {
		const asd = $root.find('[class="amplify-button amplify-field-group__control amplify-button--primary"]');

		if (asd.length && asd[0].innerText === "Sign in") {
			asd[0].click();
		} else {
			cy.get('[data-testid="hamburger-menu"]').click();
		}
	});
	cy.wait(2000);
});

Cypress.Commands.add("disconnectAwsAccountInDesktopView", () => {
	cy.get('[data-testid="hamburger-menu"]').click();
	cy.wait(2000);
	cy.get('[data-testid="sign-out-button"]').click();
	cy.wait(10000);
	cy.get('[data-testid="hamburger-menu"]').click();
	cy.wait(2000);
	cy.get("#root").then($root => {
		const root = $root.find('[class="amplify-button amplify-field-group__control amplify-button--primary"]');
		root.length && root[0].innerText === "Sign out"
			? root[0].click()
			: cy.get('[data-testid="hamburger-menu"]').click();
	});
	cy.wait(2000);
	// cy.get('[data-testid="hamburger-menu"]').click();
	// cy.wait(2000);
	// cy.get('[data-testid="disconnect-aws-account-button"]').click();
	// cy.wait(10000);
	// cy.get('[data-testid="welcome-modal-continue-button"]').click();
	// cy.wait(2000);
	// cy.get('[data-testid="hamburger-menu"]').click();
	// cy.wait(2000);
	// cy.get('[data-testid="connect-aws-account-button"]').should("exist");
	// cy.wait(2000);
	// cy.get('[data-testid="hamburger-menu"]').click();
	// cy.wait(2000);
});

Cypress.Commands.add("visitDomainInResponsiveView", (path = "demo?dp=Esri") => {
	Cypress.on("uncaught:exception", () => {
		return false;
	});

	const domain = `${Cypress.env("WEB_DOMAIN")}/${path}`;

	cy.viewport(400, 733);
	domain.includes("dev")
		? cy.visit(domain, {
				auth: {
					username: Cypress.env("WEB_DOMAIN_USERNAME"),
					password: Cypress.env("WEB_DOMAIN_PASSWORD")
				}
		  })
		: cy.visit(domain);
	cy.wait(20000);
	cy.get('[data-testid="welcome-modal-continue-button"]').click();
	cy.wait(2000);
});

Cypress.Commands.add("connectAwsAccountInResponsiveView", () => {
	cy.get('[data-testid="connect-aws-account-button"]').click();
	cy.wait(5000);
	cy.get('[placeholder="Enter IdentityPoolId"]').type(`${Cypress.env("IDENTITY_POOL_ID")}`);
	cy.get('[placeholder="Enter UserDomain"]').type(`${Cypress.env("USER_DOMAIN")}`);
	cy.get('[placeholder="Enter UserPoolClientId"]').type(`${Cypress.env("USER_POOL_CLIENT_ID")}`);
	cy.get('[placeholder="Enter UserPoolId"]').type(`${Cypress.env("USER_POOL_ID")}`);
	cy.get('[placeholder="Enter WebSocketUrl"]').type(`${Cypress.env("WEB_SOCKET_URL")}`);
	cy.get('[data-testid="connect-button"]').click();
	cy.wait(5000);
	cy.get('[data-testid="connect-aws-account-modal-container"]').should("contain", "Your AWS account is now connected.");
	cy.wait(2000);
	cy.contains("button", "Sign in").click();
	cy.wait(5000);
	cy.origin(`${Cypress.env("USER_DOMAIN")}`, () => {
		cy.get(".modal-content.background-customizable.modal-content-mobile.visible-xs.visible-sm").then(els => {
			[...els].forEach(el => {
				cy.wrap(el)
					.get('[placeholder="Username"]')
					.eq(0)
					.type(`${Cypress.env("COGNITO_EMAIL")}`);
				cy.wrap(el)
					.get('[placeholder="Password"]')
					.eq(0)
					.type(`${Cypress.env("COGNITO_PASSWORD")}`);
				cy.wrap(el).get('[name="signInSubmitButton"]').eq(0).click();
			});
		});
	});
	cy.wait(5000);
	cy.expandBottomsheet();
	cy.wait(2000);
	cy.get("#root").then($root => {
		const asd = $root.find('[class="amplify-button amplify-field-group__control amplify-button--primary"]');

		if (asd.length && asd[0].innerText === "Sign in") {
			asd[0].click();
		} else {
			cy.collapseBottomsheet();
		}
	});
	cy.wait(2000);
});

Cypress.Commands.add("disconnectAwsAccountInResponsiveView", () => {
	cy.get('[data-testid="sign-out-button"]').click();
	cy.wait(5000);
	cy.expandBottomsheet();
	cy.wait(2000);
	cy.get("#root").then($root => {
		const root = $root.find('[class="amplify-button amplify-field-group__control amplify-button--primary"]');
		root.length && root[0].innerText === "Sign out" ? root[0].click() : cy.collapseBottomsheet();
	});
	cy.wait(5000);
	cy.expandBottomsheet();
	cy.wait(2000);
	cy.get('[data-testid="disconnect-aws-account-button"]').click();
	cy.wait(10000);
	cy.get('[data-testid="welcome-modal-continue-button"]').click();
	cy.wait(2000);
	cy.expandBottomsheet();
	cy.wait(2000);
	cy.get('[data-testid="connect-aws-account-button"]').should("exist");
	cy.wait(2000);
});

Cypress.Commands.add("expandBottomsheet", (height = "723px") => {
	cy.get('[data-testid="bottomsheet"]').then($el => {
		$el[0].style.setProperty("--rsbs-overlay-h", height);
	});
	cy.wait(2000);
});

Cypress.Commands.add("collapseBottomsheet", (height = "125px") => {
	cy.get('[data-testid="bottomsheet"]').then($el => {
		$el[0].style.setProperty("--rsbs-overlay-h", height);
	});
	cy.wait(2000);
});
