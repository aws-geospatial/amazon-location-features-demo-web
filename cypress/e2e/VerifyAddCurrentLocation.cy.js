/* Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved. */
/* SPDX-License-Identifier: MIT-0 */
/// <reference types="cypress" />

//STR
// 1-Go to https://qa.amazonlocation.services/demo
// 2-User clicks on the route icon besides the search bar.
// 3-User enters from and to location.
// 4-User enters his current location in the from
// 5-User enters kewdale perth in the to
// 6-Verify User can add his current location in one of the routing fields

describe("Verify that user can add his current location in one of routing fields", () => {
    it("authentication", { scrollBehavior: false }, () => {
        cy.visit(Cypress.env("URL"), {
            auth: {
                username: Cypress.env("USERNAME"),
                password: Cypress.env("PASSWORD")
            }
        });
        cy.wait(20000);
        cy.get('[class="amplify-flex icon outter-end-component"]').click();
        cy.wait(2000);
        cy.get('[placeholder="From"]').type("40.7485492, -73.9879522");
        cy.wait(2000);
        cy.contains("Nycomputers, 1270 Broadway, New York, NY, 10001, USA").click();
        cy.wait(2000);
        cy.get('[placeholder="To"]').click().type("40.737941, -73.9881014");
        cy.wait(2000);
        cy.contains("232-250 Park Ave S, New York, NY, 10003, USA").click();
        cy.wait(2000);
        cy.get("div").should("contain", "4-98 W 33rd St, New York, NY, 10001, USA");
    });
});
