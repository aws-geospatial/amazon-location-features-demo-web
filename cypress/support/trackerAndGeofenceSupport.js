Cypress.Commands.add("addTrackerAndGeofenceEnterExit", (isResponsive, geofenceName) => {
	if (isResponsive) {
		cy.get('[data-testid="explore-button-container-Geofences"]').click();
		cy.get('[data-testid="add-geofence-button-container-mobile"]', { timeout: 30000 }).click();
	} else {
		cy.get('[class="amplify-flex geofence-button"]').click();
	}
	cy.get('[placeholder="Enter address or coordinates"]', { timeout: 30000 }).type("Empire State Building", {
		delay: 200
	});
	cy.wait(5000);
	cy.contains("Empire State Building").click();
	cy.get('[placeholder="Type unique Geofence Name"]').type(`${geofenceName}`, { force: true });
	cy.contains("Save").click();
	cy.wait(5000);
	cy.get("div").should("contain", `${geofenceName}`);
	if (isResponsive) {
		cy.get('[data-testid="bottomsheet-header-close-icon"]').click();
		cy.openResponsiveMenu('[data-testid="bottomsheet"]');
	} else {
		// cy.get('[data-testid="auth-geofence-box-close-button"]').click();
		cy.get('[class="amplify-flex geofence-card-close "]').click(); // TODO: remove this after deployment
		cy.get('[data-testid="hamburger-menu"]').click();
	}
	cy.wait(5000);
	cy.contains("Tracker").click();
	cy.contains("Continue").click();
	cy.wait(5000);
	cy.get('[class="mapboxgl-canvas"]').click("left", { force: true });
	cy.wait(5000);
	cy.get('[class="mapboxgl-canvas"]').click("right", { force: true });
	cy.wait(5000);
	cy.get('[class="mapboxgl-canvas"]').click("right", { force: true });
	cy.wait(5000);
	cy.contains("Save").click();
	cy.get('[class="amplify-button amplify-field-group__control amplify-button--primary play-pause-button"]').click();
	cy.get(
		'[class="Toastify__toast Toastify__toast-theme--dark Toastify__toast--info Toastify__toast--close-on-click enter-geofence"]',
		{ timeout: 50000 }
	)
		.should("be.visible")
		.click({ multiple: true, force: true });
	cy.get(
		'[class="Toastify__toast Toastify__toast-theme--dark Toastify__toast--info Toastify__toast--close-on-click exit-geofence"]',
		{ timeout: 50000 }
	)
		.should("be.visible")
		.click({ multiple: true, force: true });
	cy.wait(5000);
	if (isResponsive) {
		cy.get('[data-testid="bottomsheet-header-close-icon"]').click();
		cy.get('[data-testid="explore-button-container-Geofences"]').click();
	} else {
		cy.get('[data-testid="auth-tracker-box-close"]').click();
		cy.wait(5000);
		cy.get('[class="amplify-flex geofence-button"]').click();
		cy.wait(5000);
		cy.contains("Go Back").click();
	}
	cy.wait(5000);
	cy.get(`[data-testid="icon-trash-${geofenceName}"]`).click({ force: true });
	cy.wait(5000);
	cy.get('[data-testid="geofences-list-container"]').should("not.contain", `${geofenceName}`);
	cy.wait(5000);
	isResponsive
		? cy.get('[data-testid="bottomsheet-header-close-icon"]').click()
		: cy.get('[data-testid="auth-geofence-box-close-button"]').click();
	cy.wait(5000);
	cy.signOutAndDisconnectFromAwsAccount(isResponsive);
});

Cypress.Commands.add("addEditAndDeleteGeofence", (isResponsive, geofenceName) => {
	if (isResponsive) {
		cy.get('[data-testid="explore-button-container-Geofences"]').click();
		cy.get('[data-testid="add-geofence-button-container-mobile"]', { timeout: 30000 }).click();
	} else {
		cy.get('[class="amplify-flex geofence-button"]').click();
		cy.get('[class="amplify-loader"]').should("not.exist");
	}
	cy.get('[placeholder="Enter address or coordinates"]', { timeout: 30000 }).type("Rio Tinto Perth Western Australia", {
		delay: 200
	});
	cy.wait(4000);
	isResponsive ? cy.get('[class="amplify-flex suggestion border-top"]').click() : cy.contains("Rio Tinto").click();
	cy.get('[placeholder="Type unique Geofence Name"]').type(`${geofenceName}`);
	cy.wait(5000);
	cy.contains("Save").click();
	cy.wait(5000);
	cy.get("div").should("contain", `${geofenceName}`);
	cy.contains(`${geofenceName}`).click({ force: true });
	cy.contains("Save").should("be.disabled");
	isResponsive ? cy.get('[data-testid="bottomsheet-header-close-icon"]').click() : cy.contains("Go Back").click();
	cy.get(`[data-testid="icon-trash-${geofenceName}"]`).click({ force: true });
	cy.get('[data-testid="geofences-list-container"]').should("not.contain", `${geofenceName}`);
	isResponsive
		? cy.get('[data-testid="bottomsheet-header-close-icon"]').click()
		: cy.get('[data-testid="auth-geofence-box-close-button"]').click();
	cy.signOutAndDisconnectFromAwsAccount(isResponsive);
});

Cypress.Commands.add("useUnauthSimulation", isResponsive => {
	isResponsive
		? cy.openResponsiveMenu('[data-testid="bottomsheet"]')
		: cy.get('[data-testid="hamburger-menu"]').click();
	cy.contains("Geofence").click();
	cy.get('[data-testid="unauth-simulation-cta"]').click();
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
