/* Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved. */
/* SPDX-License-Identifier: MIT-0 */
/// <reference types="cypress" />

//STR
// 1-Go to https://qa.amazonlocation.services/demo
// 2-User can see the search bar
// 3-Verify Direction button is working fine which is beside the search bar

describe("Verify that direction button beside search bar is working fine", () => {
  it("authentication", { scrollBehavior: false }, () => {
    cy.visit(Cypress.env("URL"), {
      auth: {
        username: Cypress.env("USERNAME"),
        password: Cypress.env("PASSWORD")
      }
    });
    cy.wait(20000);
    cy.get('[class="mapboxgl-user-location-dot mapboxgl-marker mapboxgl-marker-anchor-center"]').wait(5000).should('be.visible').click()
    cy.wait(3000);
    cy.get('[class="amplify-text amplify-text--primary bold"]').should("have.text", "Directions");
    cy.wait(2000);
    cy.get('[class="amplify-text amplify-text--primary bold"]').click();
    cy.wait(2000);
    cy.get("div").should("contain", "Route Options");
    cy.wait(2000);
  });
});
