/* Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved. */
/* SPDX-License-Identifier: MIT-0 */

Cypress.Commands.add("visitDomain", domain => {
	Cypress.on("uncaught:exception", () => {
		return false;
	});

	if (typeof domain === "string") {
		domain.includes("dev")
			? cy.visit(domain, {
					auth: {
						username: Cypress.env("WEB_DOMAIN_USERNAME"),
						password: Cypress.env("WEB_DOMAIN_PASSWORD")
					}
			  })
			: cy.visit(domain);

		cy.wait(10000);
		cy.get('[data-testid="welcome-modal-continue-button"]').click();
	}
});

Cypress.Commands.add("visitDomainInResponsiveView", domain => {
	cy.viewport(400, 733);
	cy.visitDomain(domain);
});

Cypress.Commands.add("openResponsiveMenu", menuElement => {
	cy.get(menuElement)
		.invoke("removeAttr", "class")
		.invoke("attr", "class", "bottom-sheet mobile  disable-body-scroll  no-dragging")
		.invoke("removeAttr", "style")
		.invoke(
			"attr",
			"style",
			"--rsbs-content-opacity: 1; --rsbs-backdrop-opacity: 1; --rsbs-antigap-scale-y: 0; --rsbs-overlay-translate-y: 0px; --rsbs-overlay-rounded: 10px; --rsbs-overlay-h: 730px; opacity: 1;"
		);
});

Cypress.Commands.add("closeResponsiveMenu", menuElement => {
	cy.get(menuElement)
		.invoke("removeAttr", "class")
		.invoke("attr", "class", "bottom-sheet mobile add-overlay disable-body-scroll margin-top-from-header no-dragging")
		.invoke("removeAttr", "style")
		.invoke(
			"attr",
			"style",
			"--rsbs-content-opacity: 1; --rsbs-backdrop-opacity: 1; --rsbs-antigap-scale-y: 0; --rsbs-overlay-translate-y: 0px; --rsbs-overlay-rounded: 10px; --rsbs-overlay-h: 238px; opacity: 1;"
		);
});

Cypress.Commands.add("connectAwsAccount", isResponsive => {
	isResponsive
		? cy.openResponsiveMenu('[data-testid="bottomsheet"]')
		: cy.get('[data-testid="hamburger-menu"]').click();
	cy.get('[data-testid="connect-aws-account-button"]').click();
	cy.get('[placeholder="Enter IdentityPoolId"]').type(`${Cypress.env("IDENTITY_POOL_ID")}`);
	cy.get('[placeholder="Enter UserDomain"]').type(`${Cypress.env("USER_DOMAIN")}`);
	cy.get('[placeholder="Enter UserPoolClientId"]').type(`${Cypress.env("USER_POOL_CLIENT_ID")}`);
	cy.get('[placeholder="Enter UserPoolId"]').type(`${Cypress.env("USER_POOL_ID")}`);
	cy.get('[placeholder="Enter WebSocketUrl"]').type(`${Cypress.env("WEB_SOCKET_URL")}`);
	cy.get('[data-testid="connect-button"]').click();
	cy.get('[data-testid="connect-aws-account-modal-container"]').should("contain", "Your AWS account is now connected.");
	cy.get('[data-testid="sign-in-button"]').click();
	cy.wait(5000);
	cy.origin(`${Cypress.env("USER_DOMAIN")}`, { args: { isResponsive } }, ({ isResponsive }) => {
		isResponsive
			? cy.get(".modal-content.background-customizable.modal-content-mobile.visible-md.visible-lg").then(els => {
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
			  })
			: cy.get(".modal-content.background-customizable.modal-content-mobile.visible-md.visible-lg").then(els => {
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
	isResponsive
		? cy.openResponsiveMenu('[data-testid="bottomsheet"]')
		: cy.get('[data-testid="hamburger-menu"]').click();
	cy.wait(5000);
	cy.get("#root").then($root => {
		if ($root.find('[data-testid="sign-in-button"]').length > 0) {
			cy.get('[data-testid="sign-in-button"]').click();
		} else {
			isResponsive
				? cy.closeResponsiveMenu('[data-testid="bottomsheet"]')
				: cy.get('[data-testid="hamburger-menu"]').click();
		}
	});
	cy.wait(15000);
});

Cypress.Commands.add("signOutAndDisconnectFromAwsAccount", isResponsive => {
	isResponsive
		? cy.openResponsiveMenu('[data-testid="bottomsheet"]')
		: cy.get('[data-testid="hamburger-menu"]').click();
	cy.get('[data-testid="sign-out-button"]').click();
	cy.wait(5000);
	isResponsive
		? cy.openResponsiveMenu('[data-testid="bottomsheet"]')
		: cy.get('[data-testid="hamburger-menu"]').click();
	cy.get("#root").then($root => {
		const root = $root.find('[class="amplify-button amplify-field-group__control amplify-button--primary"]');
		root.length && root[0].innerText === "Sign out"
			? root[0].click()
			: isResponsive
			? cy.closeResponsiveMenu('[data-testid="bottomsheet"]')
			: cy.get('[data-testid="hamburger-menu"]').click();
	});
	cy.wait(5000);
	isResponsive
		? cy.openResponsiveMenu('[data-testid="bottomsheet"]')
		: cy.get('[data-testid="hamburger-menu"]').click();
	cy.get('[data-testid="disconnect-aws-account-button"]').click();
	cy.get('[data-testid="welcome-modal-continue-button"]').click();
	isResponsive
		? cy.openResponsiveMenu('[data-testid="bottomsheet"]')
		: cy.get('[data-testid="hamburger-menu"]').click();
	cy.get('[data-testid="connect-aws-account-button"]').should("exist");
});
