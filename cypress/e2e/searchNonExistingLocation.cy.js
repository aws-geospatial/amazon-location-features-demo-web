/* Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved. */
/* SPDX-License-Identifier: MIT-0 */
/// <reference types="cypress" />

//STR
// 1-Go to https://qa.amazonlocation.services/demo
// 2-User clicks on the search field
// 3-User press enter on the blank search field
// 4-Verify User sees a message “No matching places found” if he entered a non existing location

describe("Verify that user will get a message if he entered a non existing location", () => {
  it("authentication", { scrollBehavior: false }, () => {
    cy.visit(Cypress.env("URL"), {
      auth: {
        username: Cypress.env("USERNAME"),
        password: Cypress.env("PASSWORD")
      }
    });
    cy.wait(20000);
    cy.get('[placeholder="Search"]').click().type("{enter}");
    cy.wait(5000);
    cy.get("div").should("contain", "Failed to search place by text, 'Text' must have length at least 1");
    cy.wait(2000);
  });
});
