/* Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved. */
/* SPDX-License-Identifier: MIT-0 */

describe("Unauthorized users have limited permissions", () => {
	it("shouldn't allow unauth users to user tracker and geofence", { scrollBehavior: false }, () => {
		cy.visitDomain(`${Cypress.env("WEB_DOMAIN")}`);
		cy.get('[class="amplify-flex geofence-button"]').click();
		cy.wait(2000);
		cy.get("div").should("contain", "Connect AWS Account");
		cy.wait(2000);
		cy.get('[class="amplify-flex modal-close"]').click();
		cy.wait(2000);
		cy.get('[id="Icon"]').click();
		cy.wait(2000);
		cy.contains("Tracker").click();
		cy.wait(2000);
		cy.get("div").should("contain", "Connect AWS Account");
		cy.wait(2000);
		cy.get('[class="amplify-flex modal-close"]').click();
	});
});
