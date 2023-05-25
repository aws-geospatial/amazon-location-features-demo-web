/* Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved. */
/* SPDX-License-Identifier: MIT-0 */

Cypress.Commands.add("grantLocationAccess", () => {
	Cypress.log({
		name: "Grant Location Access"
	});
});

Cypress.Commands.add("visitDomain", domain => {
	if (typeof domain === "string" && domain.includes("dev")) {
		cy.visit(domain, {
			auth: {
				username: Cypress.env("WEB_DOMAIN_USERNAME"),
				password: Cypress.env("WEB_DOMAIN_PASSWORD")
			}
		});
		cy.wait(20000);
		cy.get('[class="amplify-button amplify-field-group__control amplify-button--primary"]').click();
	} else {
		cy.visit(domain);
		cy.wait(20000);
		cy.get('[class="amplify-button amplify-field-group__control amplify-button--primary"]').click();
	}
});
