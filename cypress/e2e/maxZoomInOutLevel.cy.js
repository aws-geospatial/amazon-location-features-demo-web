/* Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved. */
/* SPDX-License-Identifier: MIT-0 */
/// <reference types="cypress" />

//STR
// 1- Go to https://qa.amazonlocation.services/demo
// 2-Once the map renders user can see + and - icons on the bottom right corner
// 3-Verify that clicking + can max zoom in
// 4-Verify that clicking - can max zoom out

describe("Verify that theres max zoom in/out level", () => {
	it("authentication", { scrollBehavior: false }, () => {
		cy.visit(Cypress.env("URL"), {
			auth: {
				username: Cypress.env("USERNAME"),
				password: Cypress.env("PASSWORD")
			}
		});
		cy.wait(25000);
		cy.get('[title="Zoom in"]').click();
		cy.wait(1000);
		cy.get('[title="Zoom in"]').click();
		cy.wait(1000);
		cy.get('[title="Zoom in"]').click();
		cy.wait(1000);
		cy.get('[title="Zoom in"]').click();
		cy.wait(1000);
		cy.get('[title="Zoom in"]').click();
		cy.wait(1000);
		cy.get('[title="Zoom in"]').click();
		cy.wait(1000);
		cy.get('[title="Zoom in"]').click();
		cy.wait(1000);
		cy.get('[title="Zoom in"]').should("be.disabled");
		cy.wait(1000);
		cy.get('[title="Zoom out"]').click();
		cy.wait(1000);
		cy.get('[title="Zoom out"]').click();
		cy.wait(1000);
		cy.get('[title="Zoom out"]').click();
		cy.wait(1000);
		cy.get('[title="Zoom out"]').click();
		cy.wait(1000);
		cy.get('[title="Zoom out"]').click();
		cy.wait(1000);
		cy.get('[title="Zoom out"]').click();
		cy.wait(1000);
		cy.get('[title="Zoom out"]').click();
		cy.wait(1000);
		cy.get('[title="Zoom out"]').click();
		cy.wait(1000);
		cy.get('[title="Zoom out"]').click();
		cy.wait(1000);
		cy.get('[title="Zoom out"]').click();
		cy.wait(1000);
		cy.get('[title="Zoom out"]').click();
		cy.wait(1000);
		cy.get('[title="Zoom out"]').click();
		cy.wait(1000);
		cy.get('[title="Zoom out"]').click();
		cy.wait(1000);
		cy.get('[title="Zoom out"]').click();
		cy.wait(1000);
		cy.get('[title="Zoom out"]').click();
		cy.wait(1000);
		cy.get('[title="Zoom out"]').click();
		cy.wait(1000);
		cy.get('[title="Zoom out"]').click();
		cy.wait(1000);
		cy.get('[title="Zoom out"]').click();
		cy.wait(1000);
		cy.get('[title="Zoom out"]').click();
		cy.wait(1000);
		cy.get('[title="Zoom out"]').click();
		cy.wait(1000);
		cy.get('[title="Zoom out"]').should("be.disabled");
		cy.wait(1000);
	});
});
