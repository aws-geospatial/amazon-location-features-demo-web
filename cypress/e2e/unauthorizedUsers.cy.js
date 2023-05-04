/* Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved. */
/* SPDX-License-Identifier: MIT-0 */
/// <reference types="cypress" />

//STR
// 1-Go to URL https://qa.amazonlocation.services/demo
// 2- I verify that I am not connected to AWS
// 3- I can click on map styles and change map styles
// 4- I click on geofence icon from the demo page and I can see Connect to AWS menu and I can close it
// 5- I can click on locate me and I am positioned to my current location
// 6- I can zoom in and zoom out
// 7- I can click on hamburger menu and click geofence and see Connect to AWS modal and can close it
// 8- I can click on hamburger menu and click tracker and see Connect to AWS modal and can close it
// 9- I can add a geocode and get a reverse geocode
// 10- I can search for a category
// 11- I can route between 2 places
// 12- I can change route options
// 13- I can choose mode of travel (car, walk or bug)
// 14- I can go to settings and change data provider, change map styles and change default route options

describe("Unauthorized users MUST only have access to predefined permissions and resources (calculate route, geocode, reverse geocode etc.).", () => {
	it("authentication", { scrollBehavior: false }, () => {
		cy.visit(Cypress.env("WEB_DOMAIN"), {
			auth: {
				username: Cypress.env("WEB_DOMAIN_USERNAME"),
				password: Cypress.env("WEB_DOMAIN_PASSWORD")
			}
		});
		cy.wait(5000);
		cy.get('[class="amplify-button amplify-field-group__control amplify-button--primary"]').click();
		cy.wait(2000);
		cy.get('[class="amplify-flex geofence-button"]').click();
		cy.wait(2000);
		cy.get("div").should("contain", "Connect AWS Account");
		cy.wait(2000);
		cy.get('[class="amplify-flex modal-close"]').click();
		cy.wait(2000);
		cy.get('[id="Icon"]').click();
		cy.wait(2000);
		cy.contains("Tracker").click();
		cy.wait(2000);
		cy.get("div").should("contain", "Connect AWS Account");
		cy.wait(2000);
		cy.get('[class="amplify-flex modal-close"]').click();
		cy.wait(2000);
		cy.get('[placeholder="Search"]').click();
		cy.wait(2000);
		cy.get('[inputmode="search"]')
			.type("gramercy park music school USA")
			.wait(5000)
			.type("{downArrow}")
			.type("{enter}");
		cy.wait(10000);
		cy.get(
			"#root > div > div:nth-child(2) > div.mapboxgl-map > div.mapboxgl-popup.popup-container.mapboxgl-popup-anchor-left > div.mapboxgl-popup-content > div > div.info-container > p"
		).should("have.text", "Gramercy Park Music School");
	});
});
