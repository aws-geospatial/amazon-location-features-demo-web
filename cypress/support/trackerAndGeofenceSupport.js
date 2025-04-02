Cypress.Commands.add("useUnauthSimulation", isResponsive => {
	if (isResponsive) {
		cy.contains("Trackers").click();
		cy.wait(5000);
		cy.openResponsiveMenu('[data-testid="bottomsheet"]');
	} else {
		cy.get('[data-testid="hamburger-menu"]').click();
		cy.contains("Trackers").click();
	}
	cy.get('[data-testid="start-simulation-btn"]').click();
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
	cy.get('[data-testid="pause-button"]').click();
	isResponsive
		? cy.get('[data-testid="bottomsheet-header-close-icon"]').click()
		: cy.get('[data-testid="unauth-simulation-back-arrow"]').click();
	cy.get('[data-testid="confirmation-cancel-button"]').click();
});
