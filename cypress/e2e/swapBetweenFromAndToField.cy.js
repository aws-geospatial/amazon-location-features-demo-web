/* Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved. */
/* SPDX-License-Identifier: MIT-0 */
/// <reference types="cypress" />

//STR
// 1-Go to https://qa.amazonlocation.services/demo
// 2-User click on route icon
// 3-User select origin point
// 4-User select destination point
// 5-User can see the selected route on the Map
// 6-Verify User clicks on reverse icon and it changes the origin point to destination and destination point to origin

describe("Verify that user can revese between From field and to field", () => {
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
    cy.wait(3000);
    cy.contains("Nycomputers, 1270 Broadway, New York, NY, 10001, USA").click();
    cy.wait(2000);
    cy.get('[placeholder="To"]').click().type("40.737941, -73.9881014");
    cy.wait(3000);
    cy.contains("232-250 Park Ave S, New York, NY, 10003, USA").click();
    cy.wait(2000);
    cy.get('[class="mapboxgl-marker mapboxgl-marker-anchor-center"]').eq(0).should("be.visible");
    cy.wait(2000);
    cy.get('[class="mapboxgl-marker mapboxgl-marker-anchor-center"]').eq(1).should("be.visible");
    cy.wait(2000);
    cy.wait(2000);
    cy.get('[class="amplify-flex swap-icon-container"]').click();
    cy.wait(2000);
    cy.get('[class="mapboxgl-marker mapboxgl-marker-anchor-center"]').eq(0).should("be.visible");
    cy.wait(2000);
    cy.get('[class="mapboxgl-marker mapboxgl-marker-anchor-center"]').eq(1).should("be.visible");
    cy.wait(2000);
    cy.wait(2000);
    cy.get('[class="amplify-flex swap-icon-container"]').click();
  });
});
