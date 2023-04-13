/* Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved. */
/* SPDX-License-Identifier: MIT-0 */
/// <reference types="cypress" />

// STR
// 1- Go to https://qa.amazonlocation.services/demo
// 2- Once the map renders user can see + and - icons on the right bottom corner
// 3- Verify that clicking + zooms in the map
// 4- Verify that clicking - zooms out from the map

describe("Verify that User can Zoom in/out", () => {
	it("authentication", { scrollBehavior: false }, () => {
		cy.visit(Cypress.env("url"), {
			auth: {
				username: Cypress.env("USERNAME"),
				password: Cypress.env("PASSWORD")
			}
		});
		cy.wait(15000);
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
