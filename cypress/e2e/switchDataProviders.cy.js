/* Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved. */
/* SPDX-License-Identifier: MIT-0 */
/// <reference types="cypress" />

//STR
// 1-Go to https://qa.amazonlocation.services/demo
// 2-I click on the hamburger menu
// 3-I open settings
// 4-I click on the data providers
// 5-I am on esri map style
// 6-I click on Here map style
// 7-Verify User is able to switch between data providers from settings

describe("Switch between data providers from Settings", () => {
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
        cy.get('[class="amplify-flex amplify-radio__button"]').eq(1).click();
        cy.wait(6000);
    });
});
