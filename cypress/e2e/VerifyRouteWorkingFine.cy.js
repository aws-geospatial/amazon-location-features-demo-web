/* Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved. */
/* SPDX-License-Identifier: MIT-0 */
/// <reference types="cypress" />

//STR
// 1-Go to https://qa.amazonlocation.services/demo
// 2-User clicks on the route icon besides the search bar.
// 3-User enters auburn sydney to manly beach sydney in the route
// 4-User clicks on route options and checks avoid tolls
// 5-Verify route option (tolls) is working fine.
// 6-User enters port fouad to port said in the route
// 7-User clicks on route options and checks avoid ferries
// 6-Verify route option (ferries) is working fine

/// <reference types="cypress" />

describe("Verify that route options are working fine", () => {
	beforeEach(() => {
		cy.visit(Cypress.env("WEB_DOMAIN"), {
			auth: {
				username: Cypress.env("WEB_DOMAIN_USERNAME"),
				password: Cypress.env("WEB_DOMAIN_PASSWORD")
			}
		});
		cy.wait(20000);
		cy.get('[class="amplify-button amplify-field-group__control amplify-button--primary"]').click();
	});

	it("tests toll route option", () => {
		cy.get('[class="amplify-flex icon outter-end-component"]').click().wait(2000);
		cy.get('[placeholder="From"]').click().type("auburn sydney");
		cy.wait(4000);
		cy.contains("Auburn").click();
		cy.wait(2000);
		cy.get('[placeholder="To"]').click().type("manly beach sydney");
		cy.wait(4000);
		cy.contains("Beach").click();
		cy.wait(2000);
		cy.contains("Route Options").click();
		cy.wait(2000);
		cy.contains("Avoid tolls").click();
		cy.wait(2000);
		cy.get('[class="route-card-close"]').click();
		cy.wait(3000);
	});

	it("tests ferry route option", () => {
		cy.get('[class="amplify-flex icon outter-end-component"]').click().wait(2000);
		cy.get('[placeholder="From"]').click().type("port fouad");
		cy.wait(2000);
		cy.contains("Port Fouad").click();
		cy.wait(2000);
		cy.get('[placeholder="To"]').click().type("port said");
		cy.wait(2000);
		cy.contains("Port Said").click();
		cy.wait(2000);
		cy.contains("Route Options").click();
		cy.wait(2000);
		cy.contains("Avoid ferries").click();
		cy.wait(2000);
		cy.get('[class="route-card-close"]').click();
		cy.wait(2000);
	});
});
