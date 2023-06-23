/* Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved. */
/* SPDX-License-Identifier: MIT-0 */

describe("Map zoom in/out", () => {
	it("should allow user to be able to zoom the map in and out", { scrollBehavior: false }, () => {
		cy.visitDomain(`${Cypress.env("WEB_DOMAIN")}/demo`);

		for (let i = 0; i < 3; i++) {
			cy.get('[title="Zoom in"]').click();
			cy.wait(2000);
		}

		for (let i = 0; i < 3; i++) {
			cy.get('[title="Zoom out"]').click();
			cy.wait(2000);
		}
	});
});
