/* Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved. */
/* SPDX-License-Identifier: MIT-0 */
/// <reference types="cypress" />

//STR
// 1-Go to https://qa.amazonlocation.services/demo
// 2-User clicks on the hamburger menu.
// 3-Verify User clicks on overview and it takes the user to this url https://qa.amazonlocation.services/overview in a different tab
// 4-Verify User clicks on product and it takes the user to this url https://qa.amazonlocation.services/product in a different tab
// 5-Verify User clicks on samples and it takes the user to this url https://qa.amazonlocation.services/samples in a different tab

describe("Verify that the items in side menu take us to correct pages ", () => {
    it("authentication", { scrollBehavior: false }, () => {
        cy.visit(Cypress.env("URL"), {
            auth: {
                username: Cypress.env("USERNAME"),
                password: Cypress.env("PASSWORD")
            }
        });
        cy.wait(20000);
        cy.get('[id="Icon"]').click();
        cy.wait(2000);
        cy.contains("Overview").click();
        cy.wait(2000);
        cy.url().should("eq", "https://qa.amazonlocation.services/overview");
        cy.wait(2000);
        cy.go("back");
        cy.wait(5000);
        // cy.get('[id="Icon"]').click();
        // cy.wait(2000);
        // cy.contains("Product").click();
        // cy.wait(2000);
        // cy.url().should("eq", "https://qa.amazonlocation.services/product");
        // cy.wait(2000);
        // cy.go("back");
        // cy.wait(5000);
        cy.get('[id="Icon"]').click();
        cy.wait(2000);
        cy.contains("Samples").click();
        cy.wait(2000);
        cy.url().should("eq", "https://qa.amazonlocation.services/samples");
        cy.wait(2000);
        cy.go("back");
        cy.wait(5000);
    });
});
