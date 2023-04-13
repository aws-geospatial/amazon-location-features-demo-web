/* Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved. */
/* SPDX-License-Identifier: MIT-0 */
/// <reference types="cypress" />

//STR
// 1- Go to https://qa.amazonlocation.services/demo
// 2-User clicks on the search field
// 3-User searches a location by category e.g.School
// 4-Verify user searches by categories

describe("Verify that user can search by categories ", () => {
	it("authentication", { scrollBehavior: false }, () => {
		cy.visit(Cypress.env("URL"), {
			auth: {
				username: Cypress.env("USERNAME"),
				password: Cypress.env("PASSWORD")
			}
		});
		cy.wait(25000);
		cy.get('[placeholder="Search"]').click().type("School").wait(5000).type("{enter}");
		cy.wait(5000);
		cy.get("div").should("contain", "مدرسة عبادة بن الصامت الابتدائية");
		cy.wait(2000);
		cy.get("div").should("contain", "المدرسة التاسعة بعد المائة الابتدائية بنات");
		cy.wait(2000);
		cy.get("div").should("contain", "المدرسة التاسعة والتسعون بعد المائة الابتدائية بنات");
		cy.wait(2000);
		cy.get("div").should("contain", "مدرسة الجرجاني الابتدائية-بنين");
		cy.wait(2000);
		cy.get("div").should("contain", "مدرسة 158");
		cy.wait(2000);
	});
});
