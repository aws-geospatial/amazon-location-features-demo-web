/* Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved. */
/* SPDX-License-Identifier: MIT-0 */

describe("Switch data provider and map styles", () => {
	context("Desktop view", () => {
		beforeEach(() => {
			cy.visitDomainInDesktopView();
		});

		it(
			"should allow user to view and switch between map styles from right side menu",
			{ scrollBehavior: false },
			() => {
				cy.get('[data-testid="map-styles-button"]').click();
				cy.get('[data-testid="map-styles-card"]').should("be.visible");

				cy.get('[data-testid="map-style-item-location.aws.com.demo.maps.Esri.Light"]').should(
					"have.class",
					"mb-style-container selected"
				);

				cy.get('[data-testid="map-style-item-location.aws.com.demo.maps.HERE.Explore"]').click({ force: true });
				cy.get('[data-testid="map-style-item-location.aws.com.demo.maps.HERE.Explore"]').click({ force: true });
				cy.wait(5000);
				cy.get('[data-testid="map-style-item-location.aws.com.demo.maps.HERE.Explore"]').should(
					"have.class",
					"mb-style-container selected"
				);

				cy.get('[data-testid="map-style-item-location.aws.com.demo.maps.Grab.StandardLight"]').click({ force: true });
				cy.get('[data-testid="map-style-item-location.aws.com.demo.maps.Grab.StandardLight"]').click({ force: true });
				cy.get('[data-testid="confirmation-button"]').click({ force: true });
				cy.wait(5000);
				cy.get('[data-testid="map-style-item-location.aws.com.demo.maps.Grab.StandardLight"]').should(
					"have.class",
					"mb-style-container selected"
				);

				cy.get('[data-testid="map-style-item-location.aws.com.demo.maps.OpenData.StandardLight"]').click({
					force: true
				});
				cy.get('[data-testid="map-style-item-location.aws.com.demo.maps.OpenData.StandardLight"]').click({
					force: true
				});
				cy.get('[data-testid="confirmation-button"]').click({ force: true });
				cy.wait(5000);
				cy.get('[data-testid="map-style-item-location.aws.com.demo.maps.OpenData.StandardLight"]').should(
					"have.class",
					"mb-style-container selected"
				);
			}
		);
	});

	context("Responsive view", () => {
		beforeEach(() => {
			cy.visitDomainInResponsiveView();
			cy.expandBottomsheet();
		});

		it(
			"should allow user to view and switch between map styles from right side menu",
			{ scrollBehavior: false },
			() => {
				cy.get('[data-testid="explore-button-container-Map style"]').click();
				cy.wait(2000);
				cy.get('[data-testid="map-styles-container"]').should("be.visible");
				cy.get('[data-testid="map-style-item-location.aws.com.demo.maps.Esri.Light"]').should(
					"have.class",
					"mb-style-container selected"
				);
				cy.get('[data-testid="map-style-item-location.aws.com.demo.maps.HERE.Explore"]').click({ force: true });
				cy.get('[data-testid="map-style-item-location.aws.com.demo.maps.HERE.Explore"]').click({ force: true });
				cy.wait(5000);
				cy.get('[data-testid="map-style-item-location.aws.com.demo.maps.HERE.Explore"]').should(
					"have.class",
					"mb-style-container selected"
				);
				cy.get('[data-testid="map-style-item-location.aws.com.demo.maps.Grab.StandardLight"]').click({ force: true });
				cy.get('[data-testid="map-style-item-location.aws.com.demo.maps.Grab.StandardLight"]').click({ force: true });
				cy.get('[data-testid="confirmation-button"]').click({ force: true });
				cy.wait(5000);
				cy.get('[data-testid="map-style-item-location.aws.com.demo.maps.Grab.StandardLight"]').should(
					"have.class",
					"mb-style-container selected"
				);
				cy.get('[data-testid="map-style-item-location.aws.com.demo.maps.OpenData.StandardLight"]').click({
					force: true
				});
				cy.get('[data-testid="map-style-item-location.aws.com.demo.maps.OpenData.StandardLight"]').click({
					force: true
				});
				cy.get('[data-testid="confirmation-button"]').click({ force: true });
				cy.wait(5000);
				cy.get('[data-testid="map-style-item-location.aws.com.demo.maps.OpenData.StandardLight"]').should(
					"have.class",
					"mb-style-container selected"
				);
			}
		);
	});
});
