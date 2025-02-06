Cypress.Commands.add("checkSignIn", isResponsive => {
	cy.get("#root").then($root => {
		if ($root.find('[data-testid="sign-in-button"]').length > 0) {
			isResponsive
				? cy.get('[data-testid="sign-in-button"]').first().click({ force: true })
				: cy.get('[data-testid="sign-in-button"]').click();
			cy.wait(15000);
			isResponsive
				? cy.get('[data-testid="explore-button-container-Geofences"]').click()
				: cy.get('[class="amplify-flex geofence-button"]').click();
			cy.wait(10000);
		}
	});
});

Cypress.Commands.add("addTrackerAndGeofenceEnterExit", (isResponsive, geofenceName) => {
	if (isResponsive) {
		cy.get('[data-testid="explore-button-container-Geofences"]').click();
		cy.wait(10000);
		cy.checkSignIn(isResponsive);
		cy.get('[data-testid="add-geofence-button-container-mobile"]').click();
	} else {
		cy.get('[class="amplify-flex geofence-button"]').click();
		cy.wait(10000);
		cy.checkSignIn(isResponsive);
	}
	cy.wait(5000);
	cy.get('[placeholder="Enter address or coordinates"]').type("Empire State Building", {
		delay: 200
	});
	cy.wait(5000);
	cy.get('[class="amplify-flex suggestion border-top"]').click();
	cy.wait(2000);
	cy.get('[placeholder="Type unique Geofence Name"]').type(`${geofenceName}`);
	cy.wait(2000);
	cy.contains("Save").click();
	cy.wait(5000);
	cy.get("div").should("contain", `${geofenceName}`);
	if (isResponsive) {
		cy.get('[data-testid="bottomsheet-header-close-icon"]').click();
	} else {
		cy.get('[data-testid="auth-geofence-box-close-button"]').click();
		cy.get('[data-testid="hamburger-menu"]').click();
	}
	cy.wait(5000);
	cy.contains("Tracker").click();
	cy.wait(5000);
	cy.get('[class="maplibregl-canvas"]').click("left", { force: true });
	cy.wait(5000);
	isResponsive
		? cy.get('[class="maplibregl-canvas"]').click(200, 200, { force: true })
		: cy.get('[class="maplibregl-canvas"]').click("right", { force: true });
	cy.wait(5000);
	cy.get('[class="maplibregl-canvas"]').click("right", { force: true });
	if (isResponsive) {
		cy.wait(5000);
		cy.get('[class="maplibregl-canvas"]').click(200, 200, { force: true });
	}
	cy.wait(5000);
	cy.contains("Save").click();
	cy.wait(5000);
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
		cy.wait(10000);
		cy.checkSignIn(isResponsive);
		cy.get('[data-testid="add-geofence-button-container-mobile"]').click();
	} else {
		cy.get('[class="amplify-flex geofence-button"]').click();
		cy.wait(10000);
		cy.checkSignIn(isResponsive);
	}
	cy.wait(5000);
	cy.get('[placeholder="Enter address or coordinates"]').type("Seattle", {
		delay: 200
	});
	cy.wait(5000);
	cy.get('[class="amplify-flex suggestion border-top"]').click();
	cy.wait(2000);
	cy.get('[placeholder="Type unique Geofence Name"]').type(`${geofenceName}`);
	cy.wait(2000);
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
