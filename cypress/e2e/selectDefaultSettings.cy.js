/* Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved. */
/* SPDX-License-Identifier: MIT-0 */
/// <reference types="cypress" />

//STR
// 1-Go to https://qa.amazonlocation.services/demo
// 2-I click on the hamburger menu
// 3-I open settings
// 4-I click on the default route options
// 5-Verify User can select default route options from settings

describe("Select default route options from settings", () => {
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
        cy.contains("Settings").click();
        cy.wait(2000);
        cy.contains("Default route options").click();
        cy.wait(6000);
    });
});
