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

		cy.wait(20000);
		cy.get('[data-testid="welcome-modal-continue-button"]').click();
	}
});

Cypress.Commands.add("visitDomainInResponsiveView", domain => {
	Cypress.on("uncaught:exception", () => {
		return false;
	});

	cy.viewport(400, 733);

	if (typeof domain === "string") {
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
	}
});

Cypress.Commands.add("openResponsiveMenu", (menuElement) => {
	cy.get(menuElement)
	.invoke('removeAttr', 'class')
	.invoke('attr', 'class', 'bottom-sheet mobile  disable-body-scroll  no-dragging')
	.invoke('removeAttr', 'style')
	.invoke('attr', 'style', '--rsbs-content-opacity: 1; --rsbs-backdrop-opacity: 1; --rsbs-antigap-scale-y: 0; --rsbs-overlay-translate-y: 0px; --rsbs-overlay-rounded: 10px; --rsbs-overlay-h: 730px; opacity: 1;');
});

Cypress.Commands.add("closeResponsiveMenu", (menuElement) => {
	cy.get(menuElement)
	.invoke('removeAttr', 'class')
	.invoke('attr', 'class', 'bottom-sheet mobile add-overlay disable-body-scroll margin-top-from-header no-dragging')
	.invoke('removeAttr', 'style')
	.invoke('attr', 'style', '--rsbs-content-opacity: 1; --rsbs-backdrop-opacity: 1; --rsbs-antigap-scale-y: 0; --rsbs-overlay-translate-y: 0px; --rsbs-overlay-rounded: 10px; --rsbs-overlay-h: 238px; opacity: 1;');
});
