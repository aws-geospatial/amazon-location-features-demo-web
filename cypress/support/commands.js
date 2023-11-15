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
