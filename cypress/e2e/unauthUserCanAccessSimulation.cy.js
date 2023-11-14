/* Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved. */
/* SPDX-License-Identifier: MIT-0 */

describe("Unauth Simulation", () => {
	context("Desktop view", () => {
		beforeEach(() => {
			cy.visitDomainInDesktopView();
		});

		it("should allow user to use unauth simulation", () => {
			cy.get('[data-testid="hamburger-menu"]').click();
			cy.wait(2000);
			cy.contains("Geofence").click();
			cy.wait(2000);
			cy.get('[data-testid="unauth-simulation-cta"]').click();
			cy.wait(2000);
			cy.get('[data-testid="start-simulation-btn"]').click();
			cy.wait(2000);
			cy.get(
				'[class="Toastify__toast Toastify__toast-theme--dark Toastify__toast--info Toastify__toast--close-on-click enter-geofence"]',
				{ timeout: 20000 }
			)
				.should("be.visible")
				.click({ multiple: true, force: true });
			cy.get(
				'[class="Toastify__toast Toastify__toast-theme--dark Toastify__toast--info Toastify__toast--close-on-click exit-geofence"]',
				{ timeout: 20000 }
			)
				.should("be.visible")
				.click({ multiple: true, force: true });
			cy.wait(2000);
			cy.get('[data-testid="pause-button"]').click();
			cy.wait(2000);
			cy.get('[data-testid="unauth-simulation-back-arrow"]').click();
			cy.wait(2000);
			cy.get('[data-testid="confirmation-cancel-button"]').click();
		});
	});

	context("Responsive view", () => {
		beforeEach(() => {
			cy.visitDomainInResponsiveView();
			cy.expandBottomsheet();
		});

		it.skip("should allow user to use unauth simulation", () => {
			cy.get('[data-testid="explore-button-container-Trackers"]').click();
			cy.wait(2000);
			cy.get('[data-testid="unauth-simulation-cta"]').click();
			cy.wait(2000);
			cy.get('[data-testid="start-simulation-btn"]').click();
			cy.wait(2000);
			cy.get(
				'[class="Toastify__toast Toastify__toast-theme--dark Toastify__toast--info Toastify__toast--close-on-click enter-geofence"]',
				{ timeout: 20000 }
			)
				.should("be.visible")
				.click({ multiple: true, force: true });
			cy.get(
				'[class="Toastify__toast Toastify__toast-theme--dark Toastify__toast--info Toastify__toast--close-on-click exit-geofence"]',
				{ timeout: 20000 }
			)
				.should("be.visible")
				.click({ multiple: true, force: true });
			cy.wait(2000);
			cy.get('[data-testid="pause-button"]').click();
			cy.wait(2000);
			cy.get('[data-testid="bottomsheet-header-close-icon"]').click();
			cy.wait(2000);
			cy.get('[data-testid="confirmation-cancel-button"]').click();
		});
	});
});
